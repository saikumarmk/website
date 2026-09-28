/**
 * Search index payload for /search-index.json prerender.
 * Uses raw markdown sources (import.meta.glob ?raw) instead of genPosts({ postHtml: true }),
 * which would run Svelte SSR render() for every post and is very slow at build time.
 */
import FlexSearch from 'flexsearch'
import { FLEXSEARCH_DOCUMENT_OPTIONS, STATIC_SEARCH_PAGES } from '$lib/search/flexsearch-config'
import { projects } from '$lib/config/portfolio'
import { topics, topicOf } from '$lib/config/topics'
import { filterAndSortPosts, typeOfPost } from './posts'

function stripFrontmatter(source: string): string {
  return source.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, '')
}

/** Plain text for FlexSearch from a post source file (md / svelte.md). */
export function plaintextFromRawMarkdown(source: string): string {
  let s = stripFrontmatter(source)
  s = s.replace(/<script\b[\s\S]*?<\/script>/gi, ' ')
  s = s.replace(/<style\b[\s\S]*?<\/style>/gi, ' ')
  s = s.replace(/```[\s\S]*?```/g, ' ')
  s = s.replace(/<[^>]+>/g, ' ')
  s = s.replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1')
  s = s.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
  s = s.replace(/`([^`]+)`/g, '$1')
  s = s.replace(/^#{1,6}\s+/gm, '')
  s = s.replace(/\*{1,2}([^*]+)\*{1,2}/g, '$1')
  s = s.replace(/~~([^~]+)~~/g, '$1')
  s = s.replace(/&[^;]+;/g, ' ')
  // Long guides (e.g. guide-to-tech-*) exceed a few kB; 5k cut off company names mid-article.
  s = s.replace(/\s+/g, ' ').trim().slice(0, 200_000)
  return s
}

export type SearchGroup = 'Writing' | 'Project Dex' | 'Pages'

export type SearchEntry = {
  /** also the FlexSearch document id */
  path: string
  group: SearchGroup
  title: string
  summary: string
  tags: string[]
  /** the small print on the right of a hit: a topic, a Dex number */
  meta: string
  /** grows the hit's flower */
  seed: string | number
  created?: Blog.Post['created']
  content: string
}

type PostWithFile = Blog.Post & { __filePath: string }

export function genSearchIndexPayload(): SearchEntry[] {
  // Glob pattern must be a string literal (Vite import analysis).
  const modules = import.meta.glob<Blog.Post.Module>('/src/routes/**/*.{md,svelte.md}', { eager: true })
  const rawByPath = import.meta.glob<string>('/src/routes/**/*.{md,svelte.md}', {
    query: '?raw',
    import: 'default',
    eager: true
  })

  const posts: PostWithFile[] = []
  for (const [filePath, module] of Object.entries(modules)) {
    if (!module?.metadata) continue
    try {
      posts.push({
        ...module.metadata,
        type: typeOfPost(module.metadata),
        __filePath: filePath
      } as PostWithFile)
    } catch (e) {
      console.warn(
        `[genSearchIndexPayload] skipping broken post ${module.metadata?.slug ?? '?'}`,
        (e as Error).message
      )
    }
  }

  const sorted = filterAndSortPosts(posts, false, undefined)

  return sorted.map(post => {
    const raw = rawByPath[post.__filePath]
    const content = raw ? plaintextFromRawMarkdown(raw) : ''
    const topic = post.path.startsWith('/growth/') ? undefined : topicOf(post)
    return {
      path: post.path,
      group: 'Writing',
      title: post.title || '',
      summary: post.summary || '',
      tags: post.tags || [],
      meta: topic ? topics[topic].label : post.path.startsWith('/growth/') ? 'Yggdrasil' : '',
      seed: post.seed ?? post.path,
      created: post.created,
      content
    }
  })
}

/** Dex entries link to `/dex#<id>`, which selects that entry. */
export function genDexEntries(): SearchEntry[] {
  return projects.map((p, i) => ({
    path: `/dex#${p.id}`,
    group: 'Project Dex',
    title: p.name,
    summary: p.description ?? '',
    tags: [...(p.tags ?? []), ...(p.badges ?? [])],
    meta: `No. ${String(i + 1).padStart(3, '0')}`,
    seed: p.id,
    content: ''
  }))
}

export function genPageEntries(): SearchEntry[] {
  return STATIC_SEARCH_PAGES.map(p => ({
    path: p.path,
    group: 'Pages',
    title: p.title,
    summary: p.summary,
    tags: [],
    meta: '',
    seed: `page:${p.title}`,
    content: ''
  }))
}

export type SearchIndexJson = {
  posts: SearchEntry[]
  dex: SearchEntry[]
  pages: SearchEntry[]
  /** FlexSearch Document.export chunks — client calls import(key, data) in order */
  serializedIndex: Array<[string, string]>
}

/** Build serialized FlexSearch index (runs at prerender; avoids client-side add() loop). */
export function buildSerializedFlexSearch(entries: SearchEntry[]): Array<[string, string]> {
  const doc = new FlexSearch.Document(FLEXSEARCH_DOCUMENT_OPTIONS)
  for (const entry of entries) {
    doc.add({
      ...entry,
      tags: entry.tags.join(' ')
    })
  }
  const chunks: Array<[string, string]> = []
  doc.export((key: string, data: string) => {
    chunks.push([key, data])
  })
  return chunks
}

export function buildSearchIndexJson(): SearchIndexJson {
  const posts = genSearchIndexPayload()
  const dex = genDexEntries()
  const pages = genPageEntries()
  return {
    posts,
    dex,
    pages,
    serializedIndex: buildSerializedFlexSearch([...posts, ...dex, ...pages])
  }
}
