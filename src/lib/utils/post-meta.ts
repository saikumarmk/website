import type { FFFFlavoredFrontmatter } from 'fff-flavored-frontmatter'

/* Kept apart from posts.ts, whose eager glob of every post must never reach a client bundle. */

/** Same ordering/filter as genPosts (used by search index prerender). */
export function filterAndSortPosts<T extends Blog.Post>(
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
 * Generate Tags List
 * @param posts - posts list
 * @returns - tags list
 */
export const genTags = (posts: Blog.Post[]): string[] => {
  if (!Array.isArray(posts)) return []
  return [
    ...new Set(posts.reduce((acc, posts) => (posts.tags ? [...acc, ...posts.tags] : acc), ['']).slice(1))
  ]
}
