// Define series configurations
export type SeriesConfig = {
  name: string
  parts: {
    title: string
    slug: string
    part: number
  }[]
}

export const SERIES_CONFIGS: Record<string, SeriesConfig> = {
  'playbook': {
    name: 'The Grad/Intern Playbook',
    parts: [
      { title: 'FAQ', slug: 'guide-to-tech-faq', part: 0 },
      { title: 'Part 1: Timeline', slug: 'guide-to-tech-1', part: 1 },
      { title: 'Part 2: Improving', slug: 'guide-to-tech-2', part: 2 },
      { title: 'Part 2.5: Résumé', slug: 'guide-to-tech-2.5', part: 2.5 },
      { title: 'Part 3: Applying', slug: 'guide-to-tech-3', part: 3 }
    ]
  },
  'uni-journey': {
    name: 'University Journey',
    parts: [
      { title: 'Part 1: The Canva Chronicles', slug: 'uni-journey-1', part: 1 },
      { title: 'Part 2', slug: 'uni-journey-2', part: 2 }
    ]
  },
  'pokered-elo': {
    name: 'Pokemon Red ELO Analysis',
    parts: [
      { title: 'Part 1', slug: 'pokered-elo-1', part: 1 },
      { title: 'Part 2', slug: 'pokered-elo-2', part: 2 }
    ]
  }
}

/**
 * Detect series from slug or path
 */
export function detectSeries(slug: string): { series: SeriesConfig; part: number } | undefined {
  // Clean the slug - remove file extension, leading/trailing slashes, and normalize slashes
  const cleanSlug = slug
    .replace(/\\/g, '/') // Replace backslashes with forward slashes
    .replace(/\/\+page\.(md|svelte\.md)$/g, '') // Remove +page.md or +page.svelte.md
    .replace(/^\/+|\/+$/g, '') // Remove leading/trailing slashes
  
  for (const [key, config] of Object.entries(SERIES_CONFIGS)) {
    const part = config.parts.find(p => p.slug === cleanSlug)
    if (part) {
      return { series: config, part: part.part }
    }
  }
  return undefined
}

/**
 * Get series information for a post
 */
export function getSeriesInfo(post: Urara.Post): { series: SeriesConfig; part: number } | undefined {
  // Try both slug and path
  return detectSeries(post.slug) || detectSeries(post.path)
}

