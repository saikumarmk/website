import type { Grid, Plate } from './types'

/** Recursion: fib(9) as a call tree, with the branches memoisation would skip. */
const N = 9, SPEED = 1.1, HOLD = 150

interface Call {
  n: number
  depth: number
  parent: Call | null
  kids: Call[]
  x: number
  state: 'computed' | 'hit' | 'skipped'
}

let order: Call[] = []
let leaves = 0
let frame = 0

function build() {
  order = []
  let leaf = 0
  const rec = (n: number, depth: number, parent: Call | null): Call => {
    const node: Call = { n, depth, parent, kids: [], x: 0, state: 'computed' }
    order.push(node)
    if (n < 2) node.x = leaf++
    else {
      node.kids = [rec(n - 1, depth + 1, node), rec(n - 2, depth + 1, node)]
      node.x = (node.kids[0].x + node.kids[1].x) / 2
    }
    return node
  }
  const root = rec(N, 0, null)
  const done = new Set<number>()
  const mark = (node: Call, skipped: boolean) => {
    if (skipped) {
      node.state = 'skipped'
      node.kids.forEach((c) => mark(c, true))
      return
    }
    if (done.has(node.n)) {
      node.state = 'hit'
      node.kids.forEach((c) => mark(c, true))
      return
    }
    node.kids.forEach((c) => mark(c, false))
    done.add(node.n)
  }
  mark(root, false)
  leaves = leaf
}

export default {
  slug: 'essence-recursion',
  title: 'Essence of Recursion',
  caption:
    "fib(9) as a call tree, walked in the order the recursion makes its calls. Naively that's 109 calls. The bright spine is the 10 values that actually get computed; the pink knots are calls a memo table answers straight away, and the pale branches under them are work it never does: 17 calls instead of 109.",
  init() {
    build()
    frame = 0
  },
  step(_t, g: Grid) {
    frame++
    const shown = Math.min(order.length, Math.floor(frame * SPEED))
    if (shown === order.length && frame > order.length / SPEED + HOLD) {
      frame = 0
      return
    }
    const X = (c: Call) => 16 + (c.x / (leaves - 1)) * (g.W - 32)
    const Y = (c: Call) => 22 + (c.depth / (N - 1)) * (g.H - 38)
    for (let i = 0; i < shown; i++) {
      const c = order[i], cur = i === shown - 1 && shown < order.length
      const amt = cur ? 4 : c.state === 'skipped' ? 0.28 : 1.2
      const hue = c.state === 'skipped' ? 1 : c.state === 'hit' ? 2 : 0
      if (c.parent) g.line(X(c.parent), Y(c.parent), X(c), Y(c), c.state === 'skipped' ? 0.1 : 0.32, hue)
      g.splat(X(c), Y(c), amt, hue)
    }
  }
} satisfies Plate
