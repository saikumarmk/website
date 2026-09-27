import { describe, expect, it } from 'vitest'
import { render, seeded, NAMES, type Species } from '$lib/thread'

const specimen = (seed: string, size = 200, species: Species | null = null) =>
  render((b, W, H) => b.specimen(W / 2, H * 0.46, size * 0.31, seeded(seed).rng, { leaves: true, box: [W, H], species }), size, size)

/** every absolute point in M/L paths and every circle's extent */
const extents = (html: string) => {
  const xs: number[] = [], ys: number[] = []
  for (const [, d] of html.matchAll(/ d="([^"]+)"/g)) {
    if (/[a-zA-KN-Z]/.test(d.replace(/Z/g, ''))) continue
    const n = d.match(/-?\d+(\.\d+)?/g)!.map(Number)
    for (let i = 0; i + 1 < n.length; i += 2) xs.push(n[i]), ys.push(n[i + 1])
  }
  for (const [, cx, cy, r] of html.matchAll(/cx="([^"]+)" cy="([^"]+)" r="([^"]+)"/g)) {
    xs.push(+cx - +r, +cx + +r), ys.push(+cy - +r, +cy + +r)
  }
  return { minX: Math.min(...xs), maxX: Math.max(...xs), minY: Math.min(...ys), maxY: Math.max(...ys), count: xs.length }
}

const seeds = ['guide-to-tech-1', 'essence-recursion', 'unit-scores-dashboard', 'hello', '', 'a'.repeat(500)]

describe('thread engine', () => {
  it('is deterministic: the same seed gives byte-identical markup', () => {
    for (const s of seeds) {
      const a = specimen(s), b = specimen(s)
      expect(a.html).toBe(b.html)
      expect(a.result).toBe(b.result)
      expect(a.duration).toBe(b.duration)
    }
  })

  it('different seeds give different pieces', () => {
    const pieces = new Set(seeds.map((s) => specimen(s).html))
    expect(pieces.size).toBe(seeds.length)
  })

  it('every species stays inside its box', () => {
    for (const species of Object.keys(NAMES) as Species[]) {
      for (const size of [96, 200, 320]) {
        for (const s of seeds) {
          const { html, result } = specimen(s, size, species)
          expect(result).toBe(species)
          const e = extents(html)
          expect(e.count).toBeGreaterThan(0)
          expect(e.minX).toBeGreaterThanOrEqual(-0.5)
          expect(e.minY).toBeGreaterThanOrEqual(-0.5)
          expect(e.maxX).toBeLessThanOrEqual(size + 0.5)
          expect(e.maxY).toBeLessThanOrEqual(size + 0.5)
        }
      }
    }
  })

  it('palette choice is stable per seed', () => {
    expect(seeded('guide-to-tech-1').palette).toBe(seeded('guide-to-tech-1').palette)
    expect(seeded('x').hash).not.toBe(seeded('y').hash)
  })
})
