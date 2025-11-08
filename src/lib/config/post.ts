import type { PostConfig } from '$lib/types/post'

export const post: PostConfig = {
  comment: {
    use: ['Giscus'],
    style: 'boxed',
    giscus: {
      // TODO: Replace these with your actual values from https://giscus.app
      repo: 'YOUR_GITHUB_USERNAME/YOUR_REPO_NAME', // e.g., 'saikumarmk/website'
      repoID: 'YOUR_REPO_ID', // Get from https://giscus.app
      category: 'General', // Optional: Discussion category name
      categoryID: 'YOUR_CATEGORY_ID', // Get from https://giscus.app
      reactionsEnabled: true,
      emitMetadata: false,
      inputPosition: 'bottom',
      theme: 'preferred_color_scheme', // Auto matches light/dark mode
      lang: 'en'
    }
  }
}
