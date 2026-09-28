import katex from 'katex'
import { Marked } from 'marked'
import { createShikiHighlighter, renderCodeToHTML } from 'shiki-twoslash'
import { parsePythonToSections, type RenderedSection } from '$lib/components/prose/parse-python-sections'

let highlighter: ReturnType<typeof createShikiHighlighter> | undefined

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!)

const marked = new Marked({
  renderer: {
    // links relative to the original tutorial site (`../parity.html`) have nowhere to go here
    link({ href, tokens }) {
      const text = this.parser.parseInline(tokens)
      if (!/^https?:\/\//.test(href)) return text
      return `<a href="${esc(href)}" rel="nofollow noopener noreferrer external" target="_blank">${text}</a>`
    },
    heading({ tokens, depth }) {
      const level = depth <= 2 ? 3 : 4
      return `<h${level}>${this.parser.parseInline(tokens)}</h${level}>`
    }
  }
})

/** Markdown with maths: TeX is set aside before Markdown can mangle its underscores and backslashes. */
export function renderDocs(src: string): string {
  const math: string[] = []
  const keep = (tex: string, displayMode: boolean) => {
    math.push(katex.renderToString(tex, { displayMode, throwOnError: false }))
    return `\u0000${math.length - 1}\u0000`
  }
  const text = src
    .replace(/\\begin\{align\}[\s\S]*?\\end\{align\}/g, (m) => keep(m, true))
    .replace(/\$\$([\s\S]+?)\$\$/g, (_, tex) => keep(tex, true))
    .replace(/\$([^$\n]+?)\$/g, (_, tex) => keep(tex, false))
  const html = marked.parse(text, { async: false }) as string
  return html.replace(/\u0000(\d+)\u0000/g, (_, n) => math[Number(n)])
}

export async function renderAnnotated(source: string): Promise<RenderedSection[]> {
  const hl = await (highlighter ??= createShikiHighlighter({ theme: 'css-variables' }))
  return parsePythonToSections(source).map((s) => ({
    docs: renderDocs(s.docs),
    code: s.code.trim()
      ? renderCodeToHTML(s.code, 'python', {}, { themeName: 'css-variables' }, hl).replace('<pre class="shiki', '<pre class="shiki no-copy')
      : ''
  }))
}
