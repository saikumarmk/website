import { rand, type Grid, type Plate } from './types'

/** Associativity: build a sparse table for range-max, then answer queries with two overlapping windows. */
const n = 32, K = 5

let T: number[][] = []
let frame = 0
let q: { l: number; r: number; k: number; a: number; b: number; at: number } | null = null

const layout = (g: Grid) => {
  const cw = Math.max(2, Math.floor((g.cols - 4) / n)), c0 = Math.floor((g.cols - cw * n) / 2)
  const gap = Math.max(2, Math.floor((g.rows - 5) / K))
  return { cw, c0, row: (k: number) => 2 + k * gap, qRow: 2 + K * gap }
}
const buildFrames = (k: number) => (n - (1 << k) + 1) * 1.2

function init() {
  const v = Array.from({ length: n }, () => rand(0.12, 1))
  T = [v]
  for (let k = 1; k < K; k++) T[k] = T[k - 1].map((x, i) => (i + (1 << (k - 1)) < n ? Math.max(x, T[k - 1][i + (1 << (k - 1))]) : 0))
  frame = 0
  q = null
}

export default {
  slug: 'essence-associativity',
  title: 'Essence of Associativity',
  caption:
    "A sparse table for range maximum over 32 numbers. Row k holds the max of every run of 2ᵏ, each built from two runs of 2ᵏ⁻¹ in the row above, which is only allowed because max is associative. Then any range is answered by the two windows of 2ᵏ that cover it; they overlap, and that's fine because max(x, x) = x.",
  init,
  step(_t, g) {
    const L = layout(g)
    const bar = (k: number, i: number, amt: number, hue: number) => {
      for (let c = 0; c < L.cw - 1; c++) g.cell(L.c0 + i * L.cw + c, L.row(k), amt, hue)
    }
    frame++
    let f = frame, k = 1, cursor = n
    while (k < K && f > buildFrames(k)) {
      f -= buildFrames(k)
      k++
    }
    const building = k < K
    if (building) cursor = Math.floor(f / 1.2)
    for (let i = 0; i < n; i++) bar(0, i, T[0][i], 0)
    for (let r = 1; r < K; r++) {
      const last = n - (1 << r)
      const upto = r < k ? last : r === k && building ? Math.min(cursor - 1, last) : -1
      for (let i = 0; i <= upto; i++) bar(r, i, T[r][i], r / (K - 1))
    }
    if (building && cursor <= n - (1 << k)) {
      const h = 1 << (k - 1)
      bar(k - 1, cursor, 2.4, 2)
      bar(k - 1, cursor + h, 2.4, 2)
      bar(k, cursor, 2.4, 2)
      return
    }
    if (frame > 2000) return init()
    if (!q || frame - q.at > 75) {
      let len = 5 + Math.floor(rand(0, 20))
      if ((len & (len - 1)) === 0) len++
      const l = Math.floor(rand(0, n - len + 1)), r = l + len - 1
      const kk = Math.min(K - 1, Math.floor(Math.log2(r - l + 1)))
      q = { l, r, k: kk, a: l, b: r - (1 << kk) + 1, at: frame }
    }
    const w = 1 << q.k
    for (let i = q.l; i <= q.r; i++) bar(0, i, 1.6, 2)
    bar(q.k, q.a, 2.6, 2)
    bar(q.k, q.b, 2.6, 2)
    for (let c = 0; c < w * L.cw - 1; c++) {
      g.cell(L.c0 + q.a * L.cw + c, L.qRow, 1.1, 2)
      g.cell(L.c0 + q.b * L.cw + c, L.qRow + 1, 1.1, 2)
    }
  }
} satisfies Plate
