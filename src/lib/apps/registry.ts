export type AppStatus = 'live' | 'beta' | 'legacy'
export type AppEmbedMode = 'fullscreen' | 'contained'

export type SiteApp = {
  slug: string
  title: string
  summary: string
  route: string
  tags: string[]
  status: AppStatus
  embedMode: AppEmbedMode
}

/** Interactive / data-vis apps — separate from blog markdown routes. */
export const siteApps: SiteApp[] = [
  {
    slug: 'yggdrasil-2026',
    title: 'Yggdrasil 2026',
    summary: 'Interactive skill-tree explorer with filters and graph layout.',
    route: '/growth/2026',
    tags: ['graph', 'learning'],
    status: 'live',
    embedMode: 'fullscreen'
  }
]

export function getApp(slug: string): SiteApp | undefined {
  return siteApps.find(a => a.slug === slug)
}
