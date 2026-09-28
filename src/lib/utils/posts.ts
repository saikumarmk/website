import { render } from 'svelte/server'
import { filterAndSortPosts, typeOfPost } from './post-meta'

export { filterAndSortPosts, genTags, typeOfPost } from './post-meta'

interface GenPostsOptions {
  /** import.meta.glob<Blog.Post.Module> https://vitejs.dev/guide/features.html#glob-import */
  modules?: { [path: string]: Blog.Post.Module }
  /** set to true to output html */
  postHtml?: boolean
  /** limit a certain number of posts */
  postLimit?: number
  /** hide posts with 'unlisted' flag */
  filterUnlisted?: boolean
}

type GenPostsFunction = (options?: GenPostsOptions) => Blog.Post[]

/**
 * Generate Posts List
 * @param options - An optional configuration object
 * @returns - posts list
 */
export const genPosts: GenPostsFunction = ({
  modules = import.meta.glob<Blog.Post.Module>('/src/routes/**/*.{md,svelte.md}', { eager: true }),
  postHtml = false,
  postLimit = undefined,
  filterUnlisted = false
} = {}) => {
  function renderHtml(module: Blog.Post.Module): string {
    if (!(postHtml || typeOfPost(module.metadata) !== 'article')) return ''
    try {
      const body = render(module.default, { props: {} })
        .body // eslint-disable-next-line no-control-regex
        .replace(/[\u0000-\u001F]/g, '')
        .replace(/[\r\n]/g, '')

      // Prefer <main> / <article> inner HTML (search-index strips tags later).
      // Old pattern `<main [^>]+>` failed for `<main>` with no attrs and could throw when .match() was null.
      const inner =
        body.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1] ?? body.match(/<article\b[^>]*>([\s\S]*?)<\/article>/i)?.[1]

      const fragment = inner ?? body

      return fragment.replace(/( style=")(.*?)(")/gi, '').replace(/(<span>)(.*?)(<\/span>)/gi, '$2')
    } catch (e) {
      console.warn(`[genPosts] failed to render ${module.metadata?.slug ?? '?'}:`, (e as Error).message)
      return ''
    }
  }

  const posts: Blog.Post[] = []
  for (const [, module] of Object.entries(modules)) {
    if (module?.metadata == null) continue
    try {
      posts.push({
        ...module.metadata,
        type: typeOfPost(module.metadata),
        html: renderHtml(module)
      } as Blog.Post)
    } catch (e) {
      console.warn(`[genPosts] skipping broken post ${module.metadata?.slug ?? '?'}:`, (e as Error).message)
    }
  }

  return filterAndSortPosts(posts, filterUnlisted, postLimit)
}
