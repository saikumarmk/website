import { describe, expect, it } from 'vitest'
import { experienceRows, resume, shortYears } from './resume'

describe('shortYears', () => {
  it('shortens ranges in the same century', () => {
    expect(shortYears('February 2024 – February 2026')).toBe('2024 – 26')
    expect(shortYears('March 2026 – Present')).toBe('2026 – now')
    expect(shortYears('November 2022 – February 2023')).toBe('2022 – 23')
    expect(shortYears('June 2022 – July 2022')).toBe('2022')
  })
})

describe('experienceRows', () => {
  it('lists every role newest first, with the current one marked', () => {
    const rows = experienceRows(resume)
    expect(rows.length).toBeGreaterThan(0)
    expect(rows[0].now).toBe(true)
    for (let i = 1; i < rows.length; i++) expect(rows[i - 1].start).toBeGreaterThanOrEqual(rows[i].start)
    expect(rows.every(r => !/<[^>]+>/.test(r.at))).toBe(true)
  })
})
