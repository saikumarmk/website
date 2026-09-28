// mdsvex config type
import type { MdsvexOptions } from 'mdsvex'

// rehype plugins
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypeExternalLinks from 'rehype-external-links'

// remark plugins
import type { Node, Data } from 'unist'
import { remarkSlideSplit } from './src/lib/slides/remark-slide-split.ts'
import { hash } from './src/lib/thread/seed.ts'
import { existsSync, readFileSync, statSync } from 'fs'
import { execFileSync } from 'child_process'
import { parse, join } from 'path'
import { visit } from 'unist-util-visit'
import { toString } from 'mdast-util-to-string'
import Slugger from 'github-slugger'
import remarkFFF from 'remark-fff'
import remarkFootnotes from 'remark-footnotes'
import rehypeKatexSvelte from "rehype-katex-svelte";
import remarkMath from 'remark-math'

// highlighter
import { escapeSvelte } from 'mdsvex'
import { lex, parse as parseFence } from 'fenceparser'
import { renderCodeToHTML, runTwoSlash, createShikiHighlighter } from 'shiki-twoslash'

let highlighterPromise: ReturnType<typeof createShikiHighlighter> | undefined
type VALUE = { [key in string | number]: VALUE } | Array<VALUE> | string | boolean | number

// Strip Svelte component tags from heading text for ToC
const cleanHeadingText = (text: string): string => {
  return text
    .replace(/<[A-Z][a-zA-Z]*\s[^>]*\/>/g, '') // Self-closing components like <PokemonSprite ... />
    .replace(/<[A-Z][a-zA-Z]*[^>]*>.*?<\/[A-Z][a-zA-Z]*>/g, '') // Components with children
    .trim()
}

const ignoredRevs = new Set(
  existsSync('.git-blame-ignore-revs')
    ? readFileSync('.git-blame-ignore-revs', 'utf8')
        .split('\n')
        .map((line) => line.replace(/#.*/, '').trim())
        .filter(Boolean)
    : []
)

// Last commit that changed the file's content; pure renames (R100) and mechanical
// commits listed in .git-blame-ignore-revs don't count as edits.
const lastEdited = (file: string): string | undefined => {
  try {
    const log = execFileSync('git', ['log', '--follow', '--format=%x00%H %aI', '--name-status', '--', file], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore']
    })
    const edit = log
      .split('\0')
      .map((entry) => entry.trim().split('\n'))
      .find(([head, , status]) => head && !ignoredRevs.has(head.split(' ')[0]) && !status?.startsWith('R100'))
    if (!edit) return undefined
    return execFileSync('git', ['status', '--porcelain', '--', file], { encoding: 'utf8' }).trim() ? undefined : edit[0].split(' ')[1]
  } catch {
    return undefined
  }
}

const remarkPostMeta =
  () =>
    (tree: Node<Data>, { data, filename }: { data: { fm?: Record<string, unknown> }; filename?: string }) => {
      // route groups like (posts) are folders only, not part of the URL or slug
      const filepath = filename ? filename.split('/src/routes')[1].replace(/\/\([^/]+\)/g, '') : 'unknown'
      const { dir, name } = parse(filepath)
      if (!data.fm) data.fm = {}
      if (filename && !data.fm.updated) data.fm.updated = lastEdited(filename) ?? statSync(filename).mtime
      // the post's own words seed its flower: same text, same flower
      const prose: string[] = []
      visit(tree, (node: any) => {
        if (node.type === 'text' || node.type === 'inlineCode') prose.push(node.value)
      })
      const text = prose.join(' ').replace(/\s+/g, ' ').trim()
      data.fm.words = text ? text.split(' ').length : 0
      data.fm.seed = hash(text || filepath)
      // Generate slug & path
      data.fm.slug = filepath
      data.fm.path = join(dir, `/${name}`.replace('/+page', '').replace('.svelte', ''))
      // Generate ToC
      if (data.fm.toc !== false) {
        const [slugs, toc]: [slugs: Slugger, toc: { depth: number; title: string; slug: string }[]] = [new Slugger(), []]
        visit(tree, 'heading', (node: { depth: number }) => {
          const rawTitle = toString(node)
          const cleanTitle = cleanHeadingText(rawTitle)
          toc.push({
            depth: node.depth,
            title: cleanTitle,
            slug: slugs.slug(rawTitle, false) // Keep raw for slug matching
          })
        })
        if (toc.length > 0) data.fm.toc = toc
        else data.fm.toc = false
      }
    }

// Better type definitions needed
const remarkSpoiler = () => (tree: Node<Data>) =>
  visit(tree, 'paragraph', (node: any) => {
    const { children } = node
    const text = children[0].value
    const re = /\|\|(.{1,}?)\|\|/g
    if (re.test(children[0].value)) {
      children[0].type = 'html'
      children[0].value = text.replace(re, (_match: unknown, p1: string) => `<span class="spoiler">${p1}</span>`)
    }
    return node
  })

const defineConfig = (config: MdsvexOptions) => config

export default defineConfig({
  extensions: ['.svelte.md', '.md'],
  smartypants: {
    dashes: 'oldschool'
  },
  // Relative path (not path.resolve): absolute paths in generated imports can split the
  // layout module between client/server bundles and break `* as Components` for MD embeds.
  layout: {
    _: 'src/lib/components/post_layout.svelte'
  },
  highlight: {
    highlighter: async (code, lang, meta) => {
      let fence: Record<string, VALUE> | null
      let twoslash: any
      try {
        fence = parseFence(lex([lang, meta].filter(Boolean).join(' ')))
      } catch (error) {
        throw new Error(`Could not parse the codefence for this code sample \n${code}`)
      }
      if (fence?.twoslash === true) twoslash = runTwoSlash(code, lang as string)
      return `{@html \`${escapeSvelte(
        renderCodeToHTML(
          code,
          lang as string,
          fence ?? {},
          { themeName: 'css-variables' },
          await (highlighterPromise ??= createShikiHighlighter({ theme: 'css-variables' })),
          twoslash
        )
      )}\` }`
    }
  },
  remarkPlugins: [
    [
      remarkFFF as any,
      {
        presets: ['hugo'],
        target: 'mdsvex'
      }
    ],
    remarkSlideSplit,
    remarkPostMeta,
    remarkSpoiler,
    [remarkFootnotes, { inlineNotes: true }],
    remarkMath
  ],
  rehypePlugins: [
    rehypeSlug as any,
    [rehypeAutolinkHeadings, { behavior: 'wrap' }],
    [
      rehypeExternalLinks,
      {
        rel: ['nofollow', 'noopener', 'noreferrer', 'external'],
        target: '_blank'
      }
    ],
    [
      rehypeKatexSvelte,
      {
        macros: {
          "\\CC": "\\mathbb{C}",
          "\\vec": "\\mathbf",
        },
      },
    ],
  ]
})
