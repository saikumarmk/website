import type { FFFFlavoredFrontmatter } from 'fff-flavored-frontmatter'
import { render } from 'svelte/server'

interface GenPostsOptions {
  /** import.meta.glob<Urara.Post.Module> https://vitejs.dev/guide/features.html#glob-import */
  modules?: { [path: string]: Urara.Post.Module }
  /** set to true to output html */
  postHtml?: boolean
  /** limit a certain number of posts */
  postLimit?: number
  /** hide posts with 'unlisted' flag */
  filterUnlisted?: boolean
}

type GenPostsFunction = (options?: GenPostsOptions) => Urara.Post[]

type GenTagsFunction = (posts: Urara.Post[]) => string[]

/** Same ordering/filter as genPosts (used by search index prerender). */
export function filterAndSortPosts<T extends Urara.Post>(
  posts: T[],
  filterUnlisted = false,
  postLimit?: number
): T[] {
  return posts
    .filter(
      (post, index) =>
        (!filterUnlisted || !post.flags?.includes('unlisted')) && (!postLimit || index < postLimit)
    )
    .sort((a, b) => Date.parse(b.published ?? b.created) - Date.parse(a.published ?? a.created))
}

/**
 * Detect Post Type
 * @param fm - post frontmatter
 * @returns - post type string
 */
export const typeOfPost = (
  fm: FFFFlavoredFrontmatter | null | undefined
): 'note' | 'article' | 'reply' | 'photo' | 'like' | 'video' | 'repost' | 'bookmark' | 'audio' => {
  if (!fm) return 'note'
  return fm.title
    ? 'article'
    : fm.image
      ? 'photo'
      : fm.audio
        ? 'audio'
        : fm.video
          ? 'video'
          : fm.bookmark_of
            ? 'bookmark'
            : fm.like_of
              ? 'like'
              : fm.repost_of
                ? 'repost'
                : fm.in_reply_to
                  ? 'reply'
                  : 'note'
}

/**
 * Generate Posts List
 * @param options - An optional configuration object
 * @returns - posts list
 */
export const genPosts: GenPostsFunction = ({
  modules = import.meta.glob<Urara.Post.Module>('/src/routes/**/*.{md,svelte.md}', { eager: true }),
  postHtml = false,
  postLimit = undefined,
  filterUnlisted = false
} = {}) => {
  function renderHtml(module: Urara.Post.Module): string {
    if (!(postHtml || typeOfPost(module.metadata) !== 'article')) return ''
    try {
      const body = render(module.default, { props: {} })
        .body // eslint-disable-next-line no-control-regex
        .replace(/[\u0000-\u001F]/g, '')
        .replace(/[\r\n]/g, '')

      // Prefer <main> / <article> inner HTML (search-index strips tags later).
      // Old pattern `<main [^>]+>` failed for `<main>` with no attrs and could throw when .match() was null.
      const inner =
        body.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1] ??
        body.match(/<article\b[^>]*>([\s\S]*?)<\/article>/i)?.[1]

      const fragment = inner ?? body

      return fragment
        .replace(/( style=")(.*?)(")/gi, '')
        .replace(/(<span>)(.*?)(<\/span>)/gi, '$2')
    } catch (e) {
      console.warn(`[genPosts] failed to render ${module.metadata?.slug ?? '?'}:`, (e as Error).message)
      return ''
    }
  }

  const posts: Urara.Post[] = []
  for (const [, module] of Object.entries(modules)) {
    if (module?.metadata == null) continue
    try {
      posts.push({
        ...module.metadata,
        type: typeOfPost(module.metadata),
        html: renderHtml(module)
      } as Urara.Post)
    } catch (e) {
      console.warn(`[genPosts] skipping broken post ${module.metadata?.slug ?? '?'}:`, (e as Error).message)
    }
  }

  return filterAndSortPosts(posts, filterUnlisted, postLimit)
}

/**
 * Generate Tags List
 * @param posts - posts list
 * @returns - tags list
 */
export const genTags: GenTagsFunction = posts => {
  if (!Array.isArray(posts)) return []
  return [
    ...new Set(posts.reduce((acc, posts) => (posts.tags ? [...acc, ...posts.tags] : acc), ['']).slice(1))
  ]
}
