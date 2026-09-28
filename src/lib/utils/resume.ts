import resumeJson from '../../resources/resume.json'

/**
 * `src/resources/resume.json`, written by `pnpm cv` (scripts/resume-to-json.mjs) from the résumé .tex.
 * Text fields hold trusted inline HTML (links, <i>, <b>, <code>) converted from the LaTeX.
 */
export interface Resume {
  name: string
  links: [label: string, url: string][]
  source: string
  sections: {
    title: string
    orgs: { org: string; where: string; roles: { role: string; when: string; pts: string[] }[] }[]
    skills: [key: string, value: string][]
  }[]
}

export interface ExperienceRow {
  /** first word of the organisation, lower-cased ("canva", "monash"), matched by the Trainer Card badges */
  org: string
  /** shortened years: "2024 – 26", "2026 – now" */
  yr: string
  start: number
  role: string
  at: string
  now: boolean
  pts: string[]
}

export const resume = resumeJson as unknown as Resume

const text = (html: string) => html.replace(/<[^>]+>/g, '')

export function shortYears(when: string) {
  const [a, b] = text(when)
    .split(/\s*–\s*/)
    .map(x => (/present/i.test(x) ? 'now' : (x.match(/\d{4}/) ?? [x])[0]))
  if (!b || a === b) return a
  if (b === 'now') return `${a} – now`
  return a.slice(0, 2) === b.slice(0, 2) ? `${a} – ${b.slice(2)}` : `${a} – ${b}`
}

/** One row per role across every section, newest first. Education rows keep their dates in `where`. */
export function experienceRows(cv: Resume = resume): ExperienceRow[] {
  return cv.sections
    .flatMap(s =>
      s.orgs.flatMap(o =>
        o.roles.map(r => {
          const dated = /\d{4}/.test(text(r.when)) ? r.when : o.where
          return {
            org: text(o.org).split(/\s+/)[0].toLowerCase(),
            yr: shortYears(dated),
            start: +(text(dated).match(/\d{4}/) ?? [0])[0],
            role: r.role,
            at: text(o.org).replace(/ University$/, ''),
            now: /present/i.test(text(dated)),
            pts: r.pts
          }
        })
      )
    )
    .sort((x, y) => y.start - x.start)
}
