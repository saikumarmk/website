/** The ASCII field's character grid, as a plate sees it. Hue 0..2 maps to the canvas's --c1..--c3. */
export interface Grid {
  readonly W: number
  readonly H: number
  readonly cols: number
  readonly rows: number
  readonly charW: number
  readonly lineH: number
  readonly pointer: { x: number; y: number }
  splat(x: number, y: number, amt: number, hue: number): void
  cell(c: number, r: number, amt: number, hue: number): void
  line(x0: number, y0: number, x1: number, y1: number, amt: number, hue: number): void
}

/** A small live figure lifted from a post, drawn by `AsciiField` in plate mode on the home page. */
export interface Plate {
  /** the post it comes from, served at `/<slug>/` */
  slug: string
  title: string
  caption: string
  init(g: Grid): void
  /** one simulation tick; `t` is simulated ms */
  step(t: number, g: Grid): void
}

export const rand = (a: number, b: number) => a + Math.random() * (b - a)
