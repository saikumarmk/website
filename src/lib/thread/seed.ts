import type { Palette, Rng } from './types'

/** FNV-1a: deterministic, and any edit to the text regrows the flower. */
export function hash(str: string): number {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

/** mulberry32 */
export function rng(seed: number): Rng {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Ado's blue is the most likely. */
export const PALETTES: readonly Palette[] = ['ado', 'ado', 'ado', 'lav', 'pink', 'cyan', 'gold']

/** Text is hashed; a number is taken as an already-computed hash (e.g. a post's build-time `seed`). */
export function seeded(input: string | number) {
  const h = typeof input === 'number' ? input >>> 0 : hash(input)
  const r = rng(h)
  return { hash: h, rng: r, palette: PALETTES[Math.floor(r() * PALETTES.length)] }
}

export const seedLabel = (h: number) => h.toString(16).padStart(8, '0')
