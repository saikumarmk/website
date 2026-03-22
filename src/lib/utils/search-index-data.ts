/**
 * Search index payload for /search-index.json prerender.
 * Uses raw markdown sources (import.meta.glob ?raw) instead of genPosts({ postHtml: true }),
 * which would run Svelte SSR render() for every post and is very slow at build time.
 */
import FlexSearch from 'flexsearch'
import { FLEXSEARCH_DOCUMENT_OPTIONS, STATIC_SEARCH_PAGES } from '$lib/search/flexsearch-config'
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
  s = s.replace(/&[^;]+;/g, ' ')
  // Long guides (e.g. guide-to-tech-*) exceed a few kB; 5k cut off company names mid-article.
  s = s.replace(/\s+/g, ' ').trim().slice(0, 200_000)
  return s
}

type PostWithFile = Urara.Post & { __filePath: string }

export function genSearchIndexPayload(): Array<{
  path: string
  title: string
  summary: string
  tags: string[]
  created: Urara.Post['created']
  content: string
}> {
  // Glob pattern must be a string literal (Vite import analysis).
  const modules = import.meta.glob<Urara.Post.Module>('/src/routes/**/*.{md,svelte.md}', { eager: true })
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
    return {
      path: post.path,
      title: post.title || '',
      summary: post.summary || '',
      tags: post.tags || [],
      created: post.created,
      content
    }
  })
}

export type SearchIndexJson = {
  posts: ReturnType<typeof genSearchIndexPayload>
  /** FlexSearch Document.export chunks — client calls import(key, data) in order */
  serializedIndex: Array<[string, string]>
}

/** Build serialized FlexSearch index (runs at prerender; avoids client-side add() loop). */
export function buildSerializedFlexSearch(posts: ReturnType<typeof genSearchIndexPayload>): Array<[string, string]> {
  const doc = new FlexSearch.Document(FLEXSEARCH_DOCUMENT_OPTIONS)
  for (const post of posts) {
    doc.add({
      ...post,
      tags: post.tags?.join(' ') || ''
    })
  }
  for (const page of STATIC_SEARCH_PAGES) {
    doc.add({
      ...page,
      tags: ''
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
  return {
    posts,
    serializedIndex: buildSerializedFlexSearch(posts)
  }
}
