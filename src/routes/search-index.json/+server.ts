import type { RequestHandler } from './$types'
import { json } from '@sveltejs/kit'
import { genPosts } from '$lib/utils/posts'

export const prerender = true
export const trailingSlash = 'never'

// Generate search index with full HTML content for text search
export const GET: RequestHandler = async () => {
  const posts = genPosts({ postHtml: true })
  
  // Strip HTML tags and return plain text for searching
  const searchablePosts = posts.map(post => ({
    path: post.path,
    title: post.title || '',
    summary: post.summary || '',
    tags: post.tags || [],
    created: post.created,
    // Strip HTML tags to get plain text content
    content: post.html
      ? post.html
          .replace(/<[^>]*>/g, ' ')  // Remove HTML tags
          .replace(/&[^;]+;/g, ' ')   // Remove HTML entities
          .replace(/\s+/g, ' ')       // Normalize whitespace
          .trim()
          .slice(0, 5000)             // Limit content length per post
      : ''
  }))
  
  return json(searchablePosts)
}


