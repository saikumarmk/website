/*
  Thread: embroidery as SVG.

  Every motif is built from three kinds of stitch, the way a machine embroiderer digitises a design:
    satin    short parallel strokes that fill a shape (petals, leaves)
    run      a dashed running stitch for outlines, stems and midribs
    knot     a French knot (a dot)
  Each piece also lays down an underlay (a fill in the page colour) so petals in front hide the
  ones behind, like thread sitting on top of thread.

  Sewing: each stitch gets a delay (--d) in the order a needle would make it, the flower from its
  heart outward. The class "sew" on the <svg> plays it; CSS does the rest (see styles/sampler.css),
  so reduced motion is a stylesheet concern.
*/
import type { BladeShape, Pt, Rng, Species, Tone } from './types'

export const GOLDEN = Math.PI * (3 - Math.sqrt(5))
const SPECIES: readonly Species[] = ['rose', 'rose', 'kiku', 'kiku', 'daisy', 'sakura', 'sakura', 'camellia', 'camellia', 'cluster']
export const NAMES: Record<Species, string> = { rose: 'rose', kiku: 'chrysanthemum', daisy: 'aster', sakura: 'sakura', camellia: 'camellia', cluster: 'hydrangea' }

const f = (n: number) => Math.round(n * 10) / 10
const pol = (cx: number, cy: number, r: number, a: number): Pt => [cx + Math.cos(a) * r, cy + Math.sin(a) * r]
const quad = (p0: Pt, c: Pt, p1: Pt, t: number): Pt => {
  const u = 1 - t
  return [u * u * p0[0] + 2 * u * t * c[0] + t * t * p1[0], u * u * p0[1] + 2 * u * t * c[1] + t * t * p1[1]]
}
const line = (a: Pt, b: Pt) => `M${f(a[0])} ${f(a[1])}L${f(b[0])} ${f(b[1])}`
/** distance from (cx, cy) along angle a to the box edge, less a margin */
const toEdge = (cx: number, cy: number, a: number, [w, h]: [number, number], margin: number) => {
  const dx = Math.cos(a), dy = Math.sin(a)
  const tx = dx > 1e-9 ? (w - margin - cx) / dx : dx < -1e-9 ? (margin - cx) / dx : Infinity
  const ty = dy > 1e-9 ? (h - margin - cy) / dy : dy < -1e-9 ? (margin - cy) / dy : Infinity
  return Math.min(tx, ty)
}
const poly = (pts: Pt[], close = false) => 'M' + pts.map((p) => `${f(p[0])} ${f(p[1])}`).join('L') + (close ? 'Z' : '')

const PROFILES: Record<BladeShape, (s: number) => number> = {
  lens: (s) => Math.pow(Math.sin(Math.PI * s), 0.8),
  spoon: (s) => Math.pow(Math.sin(Math.PI * Math.pow(s, 1.6)), 0.6),
  round: (s) => Math.pow(Math.sin(Math.PI * s * 0.84), 0.5)
}

export interface SpecimenOptions {
  leaves?: boolean
  /** [width, height]: shrink the flower so nothing leaves the box */
  box?: [number, number] | null
  species?: Species | null
}

export class Builder {
  clock = 0
  private out: string[] = []

  constructor(private speed = 1) {}

  private at(ms: number) {
    return `style="--d:${Math.round(ms / this.speed)}ms"`
  }

  tick(ms: number) {
    this.clock += ms
    return this.clock
  }
  raw(s: string) {
    this.out.push(s)
  }
  under(d: string, t: number) {
    this.out.push(`<path class="under" d="${d}" ${this.at(t)}/>`)
  }
  satin(d: string, tone: Tone, t: number) {
    this.out.push(`<path class="satin ${tone}" d="${d}" pathLength="1" ${this.at(t)}/>`)
  }
  run(d: string, tone: Tone, t: number) {
    this.out.push(`<path class="run ${tone}" d="${d}" ${this.at(t)}/>`)
  }
  knot(x: number, y: number, r: number, tone: Tone, t: number) {
    this.out.push(`<circle class="knot ${tone}" cx="${f(x)}" cy="${f(y)}" r="${r}" ${this.at(t)}/>`)
  }

  /** petals around a spiral, each turned by the golden angle from the last; inner petals sit on top */
  rose(cx: number, cy: number, R: number, { petals = 14, turn = 0, tones = ['r3', 'r2', 'r1'] as Tone[], cup = 1.32, width = 1 } = {}) {
    const start = this.clock
    const pieces: { e0: Pt; e1: Pt; co: Pt; ci: Pt; tone: Tone; t: number }[] = []
    for (let k = 0; k < petals; k++) {
      const u = (k + 1) / petals
      const r = R * (0.2 + 0.8 * Math.sqrt(u))
      const a = turn + k * GOLDEN
      const w = Math.min(1.35, (0.55 + 0.75 * u) * width)
      const e0 = pol(cx, cy, r * 0.62, a - w), e1 = pol(cx, cy, r * 0.62, a + w)
      const co = pol(cx, cy, r * cup, a), ci = pol(cx, cy, r * 0.5, a)
      const tone = tones[Math.min(tones.length - 1, Math.floor(u * tones.length))]
      pieces.push({ e0, e1, co, ci, tone, t: start + k * 70 })
    }
    // outer petals first in the DOM so inner ones lie on top; delays run heart-outward
    for (let i = pieces.length - 1; i >= 0; i--) {
      const { e0, e1, co, ci, tone, t } = pieces[i]
      const outer: Pt[] = [], inner: Pt[] = []
      for (let s = 0; s <= 16; s++) {
        outer.push(quad(e0, co, e1, s / 16))
        inner.push(quad(e0, ci, e1, s / 16))
      }
      this.under(poly(outer.concat(inner.slice().reverse()), true), t)
      const n = 11
      let d = ''
      for (let s = 1; s < n; s++) {
        const ti = s / n
        d += line(quad(e0, ci, e1, ti), quad(e0, co, e1, Math.min(1, ti + 0.05)))
      }
      this.satin(d, tone, t + 20)
      this.run(poly(outer), 'r4', t + 40)
    }
    const heart: Pt[] = []
    for (let s = 0; s <= 40; s++) heart.push(pol(cx, cy, R * 0.2 * (s / 40), turn + s * 0.42))
    this.run(poly(heart), 'r4', start)
    this.clock = start + petals * 70 + 120
    return this
  }

  /** a curved midrib with satin stitches leaning toward the tip */
  leaf(x0: number, y0: number, x1: number, y1: number, width: number, bend = 0.2, tone: Tone = 'g1') {
    const L = Math.hypot(x1 - x0, y1 - y0), nx = -(y1 - y0) / L, ny = (x1 - x0) / L
    const p0: Pt = [x0, y0], p1: Pt = [x1, y1], c: Pt = [(x0 + x1) / 2 + nx * bend * L, (y0 + y1) / 2 + ny * bend * L]
    const N = Math.max(10, Math.round(L / 5))
    const mid: Pt[] = [], left: Pt[] = [], right: Pt[] = []
    for (let i = 0; i <= N; i++) {
      const t = i / N, p = quad(p0, c, p1, t), q = quad(p0, c, p1, Math.min(1, t + 0.01)), q0 = quad(p0, c, p1, Math.max(0, t - 0.01))
      let tx = q[0] - q0[0], ty = q[1] - q0[1]
      const tl = Math.hypot(tx, ty) || 1
      tx /= tl
      ty /= tl
      const w = width * Math.pow(Math.sin(Math.PI * t), 0.85) * (1 - 0.25 * t)
      mid.push(p)
      left.push([p[0] - ty * w, p[1] + tx * w])
      right.push([p[0] + ty * w, p[1] - tx * w])
    }
    const t0 = this.clock
    this.under(poly(left.concat(right.slice().reverse()), true), t0)
    let d = ''
    for (let i = 1; i < N; i++) {
      const j = Math.min(N, i + 2)
      d += line(mid[i], left[j]) + line(mid[i], right[j])
    }
    this.satin(d, tone, t0 + 30)
    this.run(poly(mid), 'g2', t0 + 10)
    this.clock = t0 + 260
    return this
  }

  /** one petal along an axis; satin runs across it and the edge is a running stitch */
  blade(x0: number, y0: number, x1: number, y1: number, w: number, { tone = 'r2' as Tone, edge = 'r4' as Tone | null, t = this.clock, shape = 'lens' as BladeShape, notch = 0 } = {}) {
    const L = Math.hypot(x1 - x0, y1 - y0) || 1, ux = (x1 - x0) / L, uy = (y1 - y0) / L
    const prof = PROFILES[shape]
    const N = Math.max(6, Math.round(L / 2.6)), left: Pt[] = [], right: Pt[] = []
    for (let i = 0; i <= N; i++) {
      const s = i / N, px = x0 + ux * L * s, py = y0 + uy * L * s, hw = w * prof(s)
      left.push([px - uy * hw, py + ux * hw])
      right.push([px + uy * hw, py - ux * hw])
    }
    const tip: Pt[] = notch ? [[x0 + ux * L * (1 - notch), y0 + uy * L * (1 - notch)]] : []
    const outline = left.concat(tip, right.slice().reverse())
    this.under(poly(outline, true), t)
    let d = ''
    for (let i = 1; i < N; i++) d += line(left[i], right[Math.min(N, i + 1)])
    this.satin(d, tone, t + 15)
    if (edge) this.run(poly(outline, true), edge, t + 30)
    return this
  }

  /** a disc of French knots in phyllotaxis, for flower centres */
  disc(cx: number, cy: number, r: number, n: number, tones: Tone[] = ['g1', 'g2'], t = this.clock) {
    for (let i = 0; i < n; i++) {
      const rr = r * Math.sqrt((i + 0.5) / n), a = i * GOLDEN
      this.knot(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr, Math.max(0.7, r * 0.16), tones[i % tones.length], t + i * 12)
    }
    return this
  }

  /** chrysanthemum: rings of thin spoon petals */
  kiku(cx: number, cy: number, R: number, { n = 20, rings = 3, turn = 0, tones = ['r1', 'r2', 'r3'] as Tone[] } = {}) {
    const start = this.clock
    const list: { j: number; a: number; len: number; w: number }[] = []
    for (let j = 0; j < rings; j++) {
      const m = Math.max(6, n - j * 4), len = R * (1 - j * 0.27)
      for (let k = 0; k < m; k++) list.push({ j, a: turn + (k + j * 0.5) * ((Math.PI * 2) / m), len, w: R * (0.07 + j * 0.02) })
    }
    list.forEach(({ j, a, len, w }, i) => {
      const tt = start + (rings - 1 - j) * 260 + (i % 24) * 18
      this.blade(cx + Math.cos(a) * R * 0.14, cy + Math.sin(a) * R * 0.14, cx + Math.cos(a) * len, cy + Math.sin(a) * len, w, { tone: tones[Math.min(tones.length - 1, rings - 1 - j)], t: tt, shape: 'spoon' })
    })
    this.disc(cx, cy, R * 0.16, 9, ['r4', 'g1'], start)
    this.clock = start + rings * 260 + 480
    return this
  }

  /** one ring of lens petals around a knotted gold heart */
  daisy(cx: number, cy: number, R: number, { n = 13, turn = 0, tones = ['r2', 'r1'] as Tone[] } = {}) {
    const start = this.clock
    for (let k = 0; k < n; k++) {
      const a = turn + k * ((Math.PI * 2) / n)
      this.blade(cx + Math.cos(a) * R * 0.2, cy + Math.sin(a) * R * 0.2, cx + Math.cos(a) * R, cy + Math.sin(a) * R, R * 0.15, { tone: tones[k % tones.length], t: start + 200 + k * 50 })
    }
    this.under(`M${f(cx - R * 0.27)} ${f(cy)}a${f(R * 0.27)} ${f(R * 0.27)} 0 1 0 ${f(R * 0.54)} 0a${f(R * 0.27)} ${f(R * 0.27)} 0 1 0 ${f(-R * 0.54)} 0`, start)
    this.disc(cx, cy, R * 0.25, 21, ['g1', 'g2'], start)
    this.clock = start + 200 + n * 50 + 200
    return this
  }

  /** five broad notched petals and a spray of stamens */
  sakura(cx: number, cy: number, R: number, { turn = 0, n = 5, tones = ['r2', 'r1'] as Tone[] } = {}) {
    const start = this.clock
    for (let k = 0; k < n; k++) {
      const a = turn + k * ((Math.PI * 2) / n)
      this.blade(cx + Math.cos(a) * R * 0.06, cy + Math.sin(a) * R * 0.06, cx + Math.cos(a) * R, cy + Math.sin(a) * R, R * 0.4, { tone: tones[k % tones.length], edge: 'r3', t: start + k * 90, shape: 'round', notch: 0.13 })
    }
    for (let k = 0; k < 9; k++) {
      const a = turn + 0.3 + k * ((Math.PI * 2) / 9), r1 = R * (0.34 + 0.08 * (k % 2))
      this.run(line([cx + Math.cos(a) * R * 0.08, cy + Math.sin(a) * R * 0.08], [cx + Math.cos(a) * r1, cy + Math.sin(a) * r1]), 'r4', start + n * 90 + k * 25)
      this.knot(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1, Math.max(0.8, R * 0.045), 'g1', start + n * 90 + 120 + k * 25)
    }
    this.clock = start + n * 90 + 400
    return this
  }

  /** two rings of big rounded petals, a ring of gold stamens */
  camellia(cx: number, cy: number, R: number, { turn = 0, n = 6, tones = ['r3', 'r2'] as Tone[] } = {}) {
    const start = this.clock
    for (let k = 0; k < n; k++) {
      const a = turn + k * ((Math.PI * 2) / n)
      this.blade(cx, cy, cx + Math.cos(a) * R, cy + Math.sin(a) * R, R * 0.5, { tone: tones[0], edge: 'r4', t: start + 300 + k * 70, shape: 'round', notch: 0.06 })
    }
    for (let k = 0; k < n - 1; k++) {
      const a = turn + Math.PI / n + k * ((Math.PI * 2) / (n - 1))
      this.blade(cx, cy, cx + Math.cos(a) * R * 0.62, cy + Math.sin(a) * R * 0.62, R * 0.34, { tone: tones[1], edge: 'r4', t: start + 120 + k * 60, shape: 'round', notch: 0.06 })
    }
    for (let k = 0; k < 11; k++) {
      const a = turn + k * ((Math.PI * 2) / 11)
      this.knot(cx + Math.cos(a) * R * 0.17, cy + Math.sin(a) * R * 0.17, Math.max(0.8, R * 0.05), 'g1', start + k * 10)
    }
    this.knot(cx, cy, Math.max(0.9, R * 0.07), 'g2', start)
    this.clock = start + 300 + n * 70 + 200
    return this
  }

  /** hydrangea: a round cluster of tiny four-petal florets */
  cluster(cx: number, cy: number, R: number, rng: Rng, { tones = ['r1', 'r2', 'r3'] as Tone[] } = {}) {
    const start = this.clock, m = 7 + Math.floor(rng() * 6), fr = R * 0.3
    for (let i = m - 1; i >= 0; i--) {
      const rr = R * 0.7 * Math.sqrt((i + 0.4) / m), a = i * GOLDEN, x = cx + Math.cos(a) * rr, y = cy + Math.sin(a) * rr
      const tone = tones[Math.floor(rng() * tones.length)], rot = rng() * Math.PI, t = start + i * 60
      for (let k = 0; k < 4; k++) {
        const q = rot + (k * Math.PI) / 2
        this.blade(x, y, x + Math.cos(q) * fr, y + Math.sin(q) * fr, fr * 0.42, { tone, edge: 'r4', t: t + k * 20 })
      }
      this.knot(x, y, Math.max(0.7, fr * 0.14), 'g1', t + 90)
    }
    this.clock = start + m * 60 + 300
    return this
  }

  stem(pts: Pt[], tone: Tone = 'g2') {
    this.run(poly(pts), tone, this.clock)
    this.clock += 180
    return this
  }

  curve(x0: number, y0: number, cx: number, cy: number, x1: number, y1: number, n = 24): Pt[] {
    const pts: Pt[] = []
    for (let i = 0; i <= n; i++) pts.push(quad([x0, y0], [cx, cy], [x1, y1], i / n))
    return pts
  }

  /** a flower grown from a seed: same text, same flower. Returns the species it chose. */
  specimen(cx: number, cy: number, R: number, rng: Rng, { leaves = true, box = null, species = null }: SpecimenOptions = {}): Species {
    const kind = species || SPECIES[Math.floor(rng() * SPECIES.length)]
    const turn = rng() * Math.PI * 2
    const tones: Tone[] = rng() < 0.5 ? ['r3', 'r2', 'r1'] : ['r1', 'r2', 'r3']
    const cup = 1.18 + rng() * 0.32
    const reach = kind === 'rose' ? cup : 1
    R *= 0.78 + rng() * 0.3
    if (box) R = Math.min(R, (Math.min(cx, box[0] - cx, cy, box[1] - cy) - 2) / reach)
    if (leaves) {
      const n = 1 + Math.floor(rng() * 3)
      for (let i = 0; i < n; i++) {
        const a = Math.PI * (0.18 + 0.64 * (n === 1 ? rng() : i / (n - 1))) + (rng() - 0.5) * 0.3
        const r0 = R * 0.55
        let r1 = R * (1.45 + rng() * 0.35)
        const a1 = a + (rng() - 0.5) * 0.4
        if (box) r1 = Math.min(r1, toEdge(cx, cy, a1, box, 3))
        const [x0, y0] = pol(cx, cy, r0, a), [x1, y1] = pol(cx, cy, r1, a1)
        this.leaf(x0, y0, x1, y1, R * (0.2 + rng() * 0.1), (rng() < 0.5 ? -1 : 1) * (0.15 + rng() * 0.15))
      }
    }
    if (kind === 'rose') this.rose(cx, cy, R, { petals: 9 + Math.floor(rng() * 10), turn, cup, width: 0.8 + rng() * 0.4, tones })
    else if (kind === 'kiku') this.kiku(cx, cy, R, { n: 16 + Math.floor(rng() * 10), rings: 2 + Math.floor(rng() * 2), turn, tones: tones.slice().reverse() })
    else if (kind === 'daisy') this.daisy(cx, cy, R, { n: 9 + Math.floor(rng() * 8), turn, tones: rng() < 0.5 ? ['r2', 'r1'] : ['r1'] })
    else if (kind === 'sakura') this.sakura(cx, cy, R, { turn, n: rng() < 0.8 ? 5 : 6, tones: rng() < 0.5 ? ['r1', 'r2'] : ['r2'] })
    else if (kind === 'camellia') this.camellia(cx, cy, R, { turn, n: 5 + Math.floor(rng() * 3), tones: rng() < 0.5 ? ['r3', 'r2'] : ['r2', 'r1'] })
    else this.cluster(cx, cy, R, rng, { tones })
    const k = Math.floor(rng() * 4)
    for (let i = 0; i < k; i++) {
      let [x, y] = pol(cx, cy, R * reach * (1.12 + rng() * 0.25), -Math.PI * (0.15 + rng() * 0.7))
      if (box) {
        x = Math.max(3, Math.min(box[0] - 3, x))
        y = Math.max(3, Math.min(box[1] - 3, y))
      }
      this.knot(x, y, Math.min(2.4, 1.2 + R * 0.05), 'g1', this.tick(50))
    }
    return kind
  }

  toString() {
    return this.out.join('')
  }
}
