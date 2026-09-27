/** Shelves on the writing index, in display order. A post's `topic:` frontmatter picks one. */
export const topics = {
  maths: { label: 'Maths & algorithms', blurb: 'Algorithms explained through the structure underneath them.' },
  systems: { label: 'ML systems', blurb: 'Making models go faster.' },
  games: { label: 'Game archaeology', blurb: 'Pulling data and behaviour out of old games.' },
  building: { label: 'Things I built', blurb: 'Write-ups of projects, from scrapers to emulators.' },
  playbook: { label: 'The Playbook', blurb: 'A guide to getting a grad or intern role in Australian tech. Best read in order.' },
  journal: { label: 'Journal', blurb: 'Updates, year reviews and notes about this site.' }
} as const satisfies Record<string, { label: string; blurb: string }>

export type Topic = keyof typeof topics

/** `topic:` if it's a known shelf, else the first tag that is one, else undefined */
export function topicOf(post: Pick<Blog.Post, 'topic' | 'tags'>): Topic | undefined {
  const known = (t?: string): t is Topic => !!t && t in topics
  if (known(post.topic)) return post.topic
  return post.tags?.find(known)
}

/** reading time at 230 wpm, at least a minute */
export const readMins = (words = 0) => Math.max(1, Math.round(words / 230))
