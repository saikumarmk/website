import type { PostConfig } from '$lib/types/post'

export const post: PostConfig = {
  comment: {
    use: ['Giscus'],
    style: 'boxed',
    giscus: {
      repo: 'saikumarmk/website',
      repoID: 'R_kgDOHjJJ-A',
      category: 'General',
      categoryID: 'DIC_kwDOHjJJ-M4CxknV',
      reactionsEnabled: true,
      emitMetadata: false,
      inputPosition: 'bottom',
      theme: 'preferred_color_scheme',
      lang: 'en'
    }
  }
}
