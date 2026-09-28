import { rand, type Grid, type Plate } from './types'

/** Pokémon Red Elo: ratings start level and the Elo update sorts them into the hidden order. */
const N = 391,
  LO = 216,
  HI = 2713,
  MEAN = (LO + HI) / 2,
  ALPHA = 24,
  PER_FRAME = 180,
  RESTART = 900

let s: number[] = []
let R = new Float64Array(N)
let frame = 0

const px = (g: Grid, r: number) => 18 + (r / 3000) * (g.W - 36)
const py = (g: Grid, i: number) => 14 + (1 - i / (N - 1)) * (g.H - 28)

function init() {
  // synthetic strengths; the post fits the real ones
  s = Array.from({ length: N }, (_, i) => LO + (HI - LO) * (i / (N - 1)) + rand(-40, 40))
  R = new Float64Array(N).fill(MEAN)
  frame = 0
}

export default {
  slug: 'pokered-elo-2',
  title: 'More Pokémon Red Elo World',
  caption:
    "391 trainers, all starting on the same rating. Each tick, random pairs battle, the stronger one usually wins, and both ratings move by R ← R + α(outcome − expected). Height is each trainer's true strength (synthetic here; the post fits the real ones), so the ratings sorting themselves onto the faint diagonal is Elo recovering the order.",
  init,
  step(_t, g) {
    if (++frame > RESTART) init()
    for (let b = 0; b < PER_FRAME; b++) {
      const i = (Math.random() * N) | 0,
        j = (Math.random() * N) | 0
      if (i === j) continue
      const pTrue = 1 / (1 + 10 ** ((s[j] - s[i]) / 400)),
        pExp = 1 / (1 + 10 ** ((R[j] - R[i]) / 400))
      const d = ALPHA * ((Math.random() < pTrue ? 1 : 0) - pExp)
      R[i] += d
      R[j] -= d
    }
    for (let i = 0; i < N; i += 3) g.splat(px(g, s[i]), py(g, i), 0.12, 1)
    for (let i = 0; i < N; i++) g.splat(px(g, R[i]), py(g, i), 0.9, (2 * i) / N)
  }
} satisfies Plate
