#!/usr/bin/env node
/**
 * Link previews and favicons, run after `vite build`.
 *
 * For every post in the prerendered posts.json: a 1200×630 share card (`og/<path>.png`) with the same
 * seeded flower that closes the post, and the flower alone as its favicon (`og/<path>-32.png`, `-16.png`).
 * Plus `og/site.png`, the site's own card, in ink.
 *
 * PNGs are cached in node_modules/.cache/og by their inputs, so a rebuild only draws what changed.
 */
import { createHash } from 'node:crypto'
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { Resvg } from '@resvg/resvg-js'
import satori from 'satori'
import { runnerImport } from 'vite'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const at = (...p) => join(root, ...p)
const kit = at('.svelte-kit/output')
const cacheDir = at('node_modules/.cache/og')
const started = Date.now()

// `vite preview` serves .svelte-kit/output; the adapters copy it to build/ (static, Netlify) or build/client (node)
const adapterOut = [at('build/client'), at('build')].find(existsSync)
const outDirs = [join(kit, 'client'), ...(adapterOut ? [adapterOut] : [])]

const findFile = (dir, name) => {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name)
    if (e.isFile() && e.name === name) return p
    if (e.isDirectory()) {
      const hit = findFile(p, name)
      if (hit) return hit
    }
  }
}
const postsFile = existsSync(join(kit, 'prerendered')) && findFile(join(kit, 'prerendered'), 'posts.json')
if (!postsFile) throw new Error('og: no prerendered posts.json; run `vite build` first')
/** @type {any[]} */
const posts = JSON.parse(readFileSync(postsFile, 'utf8'))

// the thread engine and configs are TypeScript with extensionless imports, which Node can't load on its own
const load = async id =>
  (await runnerImport(id, { configFile: false, root, logLevel: 'error', oxc: { tsconfig: false } })).module
const [thread, { topics, topicOf, readMins }, { getSeriesInfo }] = await Promise.all(
  ['/src/lib/thread/index.ts', '/src/lib/config/topics.ts', '/src/lib/utils/series.ts'].map(load)
)

/* ---------- colours, read from the site's own stylesheet ---------- */

const css = readFileSync(at('src/styles/sampler.css'), 'utf8')
const themes = {}
for (const [, theme, pal, body] of css.matchAll(/\[data-theme='(\w+)'\]\s*(?:\.pal-(\w+)\s*)?\{([^}]*)\}/g)) {
  const vars = Object.fromEntries([...body.matchAll(/--([\w-]+):\s*([^;]+);/g)].map(m => [m[1], m[2].trim()]))
  themes[theme] ??= {}
  themes[theme][pal ?? 'base'] = { ...themes[theme][pal ?? 'base'], ...vars }
}
const colours = (theme, palette) => ({ ...themes[theme].base, ...themes[theme][palette] })

/* ---------- flowers ---------- */

/** the builder's class-styled markup, with the stylesheet's rules written onto each stitch */
function paint(html, c, { under, satin = 1.2, run = 1.25, dash = '3.4 2.6' }) {
  const line = `fill="none" stroke-linecap="round"`
  return html
    .replace(/ style="--d:-?\d+ms"| pathLength="1"| class="thread"/g, '')
    .replace(/class="(under|satin|run|knot)(?: (\w+))?"/g, (_, kind, tone) => {
      if (kind === 'under') return `fill="${under}"`
      if (kind === 'knot') return `fill="${c[tone]}"`
      if (kind === 'satin') return `${line} stroke="${c[tone]}" stroke-width="${satin}"`
      return `${line} stroke="${c[tone]}" stroke-width="${run}"${dash ? ` stroke-dasharray="${dash}"` : ''}`
    })
}

/** the post's end flower (`post_container.svelte`): leaves, not fitted, so the same seed draws the same shape */
function bloom(seed, theme, under) {
  const sd = thread.seeded(seed)
  const { html, result } = thread.render(b => b.specimen(150, 132, 96, thread.seeded(seed).rng, { leaves: true }), 300, 300)
  return {
    svg: paint(html, colours(theme, sd.palette), { under }),
    species: thread.NAMES[result],
    label: thread.seedLabel(sd.hash)
  }
}

/** tab size: the flower alone, fitted, with stitches thickened until they read as solid thread */
function favicon(seed) {
  const sd = thread.seeded(seed)
  const c = colours('ivory', sd.palette)
  const { html } = thread.render(b => b.specimen(30, 30, 30, thread.seeded(seed).rng, { leaves: false, box: [60, 60] }), 60, 60)
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 60">${paint(html, c, { under: c.bg, satin: 3.2, run: 2.4, dash: '' })}</svg>`
}

/* ---------- cards ---------- */

const font = (pkg, file) => readFileSync(at('node_modules/@fontsource', pkg, 'files', file))
const fonts = [
  ...['latin', 'latin-ext'].flatMap(sub =>
    ['normal', 'italic'].map(style => ({
      name: 'Newsreader',
      data: font('newsreader', `newsreader-${sub}-400-${style}.woff`),
      weight: 400,
      style
    }))
  ),
  ...['latin', 'latin-ext'].map(sub => ({
    name: 'Plex',
    data: font('ibm-plex-mono', `ibm-plex-mono-${sub}-400-normal.woff`),
    weight: 400,
    style: 'normal'
  }))
]

const W = 1200
const H = 630
const h = (type, style, ...children) => ({ type, props: { style, children: children.length > 1 ? children : children[0] } })
const mono = { fontFamily: 'Plex' }

async function card({ seed, theme = 'ivory', kicker, title, summary, meta }) {
  const c = colours(theme, 'base')
  const flower = bloom(seed, theme, c.panel)
  const text = h(
    'div',
    { display: 'flex', flexDirection: 'column', width: 614, height: '100%' },
    h(
      'div',
      { ...mono, display: 'flex', alignItems: 'center', fontSize: 24, color: c.fg2 },
      h('div', { width: 12, height: 12, borderRadius: 6, background: c.g1, marginRight: 12 }),
      'saikumarmk.com'
    ),
    h(
      'div',
      {
        ...mono,
        fontSize: 22,
        letterSpacing: 2.6,
        textTransform: 'uppercase',
        color: c.c2,
        marginTop: 'auto',
        marginBottom: 18
      },
      kicker || ' '
    ),
    h('div', { display: 'block', fontSize: 66, lineHeight: 1.06, letterSpacing: -0.66, color: c.fg, lineClamp: 3 }, title),
    ...(summary
      ? [
          h(
            'div',
            {
              display: 'block',
              fontSize: 29,
              fontStyle: 'italic',
              color: c.muted,
              marginTop: 18,
              lineHeight: 1.3,
              lineClamp: 2
            },
            summary
          )
        ]
      : []),
    h('div', { ...mono, fontSize: 21, color: c.muted, marginTop: 'auto', paddingTop: 28 }, meta)
  )
  const caption = h(
    'div',
    { ...mono, position: 'absolute', right: 70, bottom: 62, fontSize: 17, color: c.muted },
    `${flower.species} · ${flower.label}`
  )
  const svg = await satori(
    h('div', { display: 'flex', width: W, height: H, padding: '64px 40px 56px 76px', fontFamily: 'Newsreader' }, text, caption),
    { width: W, height: H, fonts }
  )
  // cloth, stitched border and flower go under satori's text
  const hatch = (id, turn, alpha) =>
    `<pattern id="${id}" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(${turn})"><rect x="5" width="1" height="6" fill="${c.fg}" fill-opacity="${alpha}"/></pattern>`
  const cloth =
    `<defs>${hatch('og-h1', 45, 0.03)}${hatch('og-h2', -45, 0.02)}</defs>` +
    `<rect width="${W}" height="${H}" fill="${c.panel}"/><rect width="${W}" height="${H}" fill="url(#og-h1)"/><rect width="${W}" height="${H}" fill="url(#og-h2)"/>` +
    `<rect x="23.5" y="23.5" width="${W - 47}" height="${H - 47}" rx="12.5" fill="none" stroke="${c.g1}" stroke-opacity=".6" stroke-width="3" stroke-dasharray="9 7"/>` +
    // the prototype's 300-unit art box, at its size and place in the right-hand column
    `<g transform="translate(670 44) scale(1.7)">${flower.svg}</g>`
  return png(svg.replace(/^(<svg[^>]*>)/, `$1${cloth}`), W)
}

const png = (svg, width) =>
  new Resvg(svg, { fitTo: { mode: 'width', value: width }, font: { loadSystemFonts: false } }).render().asPng()

/* ---------- what each post says ---------- */

const fmt = d =>
  d
    ? new Date(d).toLocaleDateString('en-AU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        timeZone: 'Australia/Melbourne'
      })
    : ''

function kickerOf(post) {
  const series = getSeriesInfo(post)
  if (series) return `${series.series.name} · ${series.part === 0 ? 'FAQ' : `Part ${series.part}`}`
  const topic = topicOf(post)
  return topic ? topics[topic].label : ''
}

const jobs = posts.map(post => {
  const date = fmt(post.published ?? post.created)
  return {
    slug: post.path.replace(/^\/+|\/+$/g, ''),
    seed: post.seed ?? post.path,
    kicker: kickerOf(post),
    title: post.title ?? post.summary ?? post.path.slice(1),
    summary: post.title ? post.summary : undefined,
    meta: [date, post.words ? `${readMins(post.words)} min read` : ''].filter(Boolean).join(' · ')
  }
})
jobs.push({
  slug: 'site',
  seed: 'saikumarmk.com',
  theme: 'ink',
  kicker: 'AI researcher · ML engineer',
  title: "Hi, I'm Sai.",
  summary: 'Maths, ML systems, old games, and advice for students getting into Australian tech.',
  meta: 'Writing · Projects · CV',
  icons: false
})

/* ---------- draw, from cache where the inputs haven't changed ---------- */

// anything that changes how a card looks invalidates the cache
const version = createHash('sha1')
for (const f of [
  fileURLToPath(import.meta.url),
  at('src/styles/sampler.css'),
  ...readdirSync(at('src/lib/thread')).map(f => at('src/lib/thread', f))
])
  version.update(readFileSync(f))
const v = version.digest('hex')

mkdirSync(cacheDir, { recursive: true })
let drawn = 0
async function cached(key, make) {
  const file = join(
    cacheDir,
    createHash('sha1')
      .update(v + key)
      .digest('hex') + '.png'
  )
  if (!existsSync(file)) {
    writeFileSync(file, await make())
    drawn++
  }
  return file
}

const write = (name, file) => {
  for (const dir of outDirs) {
    mkdirSync(dirname(join(dir, 'og', name)), { recursive: true })
    copyFileSync(file, join(dir, 'og', name))
  }
}

for (const { icons = true, ...job } of jobs) {
  write(`${job.slug}.png`, await cached(JSON.stringify(job), () => card(job)))
  if (!icons) continue
  const svg = favicon(job.seed)
  for (const size of [32, 16]) write(`${job.slug}-${size}.png`, await cached(`${size}:${svg}`, () => png(svg, size)))
}

// the prerender crawler lets /og/ links through (svelte.config.ts), so check every one points at a file here
const missing = new Set()
const scan = dir => {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name)
    if (e.isDirectory()) scan(p)
    else if (e.name.endsWith('.html'))
      for (const [, ref] of readFileSync(p, 'utf8').matchAll(/="(?:https?:\/\/[^/"]+)?\/og\/([^"]+\.png)"/g))
        if (!existsSync(join(outDirs[0], 'og', ref))) missing.add(ref)
  }
}
scan(join(kit, 'prerendered'))
if (missing.size) throw new Error(`og: pages link to images that weren't made: ${[...missing].join(', ')}`)

console.log(
  `og: ${jobs.length} cards (${drawn} images drawn, the rest cached) in ${((Date.now() - started) / 1000).toFixed(1)}s`
)
