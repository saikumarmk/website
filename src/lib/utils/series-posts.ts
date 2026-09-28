import { SERIES_CONFIGS, getSeriesInfo } from './series'

/** Series with their own page; the strip and next-part card link to it. */
export const SERIES_PAGES: Record<string, string> = { playbook: '/playbook' }

export interface SeriesPart {
  post: Blog.Post
  /** 0 is the FAQ, which is listed last */
  part: number
  label: string
  /** what goes in the knot */
  mark: string
  /** a half part (2.5) is a side trip off the stem */
  side: boolean
  short: string
}

export interface Series {
  key: string
  name: string
  href?: string
  parts: SeriesPart[]
  appendix: Blog.Post[]
}

/** `series:` frontmatter, else the series in `SERIES_CONFIGS` that lists the post */
export function seriesKeyOf(post: Blog.Post): string | undefined {
  if (post.series) return post.series
  const info = getSeriesInfo(post)
  return info ? Object.keys(SERIES_CONFIGS).find(k => SERIES_CONFIGS[k] === info.series) : undefined
}

const dateOf = (p: Blog.Post) => Date.parse(p.published ?? p.created)

/** Parts come from the posts themselves; numbering from `SERIES_CONFIGS` if it has one, else date order. */
export function seriesOf(key: string, posts: Blog.Post[]): Series {
  const name = SERIES_CONFIGS[key]?.name ?? key
  const members = posts.filter(p => !p.flags?.includes('unlisted') && seriesKeyOf(p) === key)
  const appendix = members.filter(p => p.series_appendix).sort((a, b) => dateOf(a) - dateOf(b))
  const main = members.filter(p => !p.series_appendix).sort((a, b) => dateOf(a) - dateOf(b))
  const shortOf = (title = '') =>
    title
      .replace(new RegExp(`^${name.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&')}:\\s*`), '')
      .replace(/^Part [\d.]+[^-–]*[-–]\s*/, '') || title
  const parts = main
    .map((post, i) => {
      const part = getSeriesInfo(post)?.part ?? i + 1
      return {
        post,
        part,
        label: part === 0 ? 'FAQ' : `Part ${part}`,
        mark: part === 0 ? '?' : String(part),
        side: part % 1 !== 0,
        short: shortOf(post.title)
      }
    })
    .sort((a, b) => (a.part || 1e9) - (b.part || 1e9))
  return { key, name, href: SERIES_PAGES[key], parts, appendix }
}
