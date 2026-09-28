<script lang="ts">
  import { onMount } from 'svelte'
  import Head from '$lib/components/head.svelte'
  import Sidenote from '$lib/components/sidenote.svelte'
  import AsciiField from '$lib/components/AsciiField.svelte'
  import Embroidery from '$lib/components/thread/Embroidery.svelte'
  import Specimen from '$lib/components/thread/Specimen.svelte'
  import { satinSelect } from '$lib/actions/satin-select'
  import { settleMargins } from '$lib/actions/settle-margins'
  import { plates } from '$lib/plates'
  import { site } from '$lib/config/site'
  import { homeContent } from '$lib/config/home'
  import { dexHighlights, projects, trainerCard } from '$lib/config/portfolio'
  import { experienceRows } from '$lib/utils/resume'

  let { data }: { data: { res?: Blog.Post[] } } = $props()

  const isLearningNote = (p: Blog.Post) =>
    p.path?.startsWith('/growth/') || p.tags?.includes('yggdrasil') || p.tags?.includes('learning-note') || 'growth' in p
  let posts = $derived((data.res ?? []).filter(p => !p.flags?.includes('unlisted') && !isLearningNote(p)))
  let recent = $derived(posts.slice(0, 5))
  const monthYear = (d?: string) =>
    d ? new Date(d).toLocaleDateString('en-AU', { month: 'short', year: 'numeric', timeZone: 'Australia/Melbourne' }) : ''

  /* ---------- the plate: a live figure from a post, a different one each visit ---------- */
  const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII']
  const PLATE_KEY = 'home-plate'
  let plateAt = $state(0)
  let plate = $derived(plates[plateAt])
  let plateRunning = $state(true)
  const remember = (i: number) => {
    try {
      localStorage.setItem(PLATE_KEY, String(i))
    } catch {}
  }
  function nextPlate() {
    plateAt = (plateAt + 1) % plates.length
    remember(plateAt)
  }

  /* ---------- status line ---------- */
  const statusOf = (s: string) => s.replace(/[.!]+$/, '').toLowerCase() + '.'
  let status = $state(statusOf(homeContent.statusMessages[0]))
  function reroll() {
    const pool = homeContent.statusMessages.map(statusOf).filter(s => s !== status)
    status = pool[Math.floor(Math.random() * pool.length)]
  }

  onMount(() => {
    let last = -1
    try {
      last = Number(localStorage.getItem(PLATE_KEY) ?? -1)
    } catch {}
    plateAt = (((last + 1) % plates.length) + plates.length) % plates.length
    remember(plateAt)
    reroll()
  })

  /* ---------- trainer card ---------- */
  const rows = experienceRows()
  const current = rows[0]
  const highlights = dexHighlights.map(id => projects.find(p => p.id === id)).filter(p => !!p)
  const no = (i: number) => String(i + 1).padStart(3, '0')
  let fieldRunning = $state(true)
  let badgeId = $state<string | null>(null)
  let badge = $derived(trainerCard.badges.find(b => b.id === badgeId))
  let open = $state<boolean[]>(rows.map(() => false))
  let flashOrg = $state<string | null>(null)

  function pickBadge(id: string) {
    badgeId = badgeId === id ? null : id
    const org = badge?.org ?? null
    flashOrg = org
    open = rows.map(r => !!org && r.org === org)
  }
</script>

<Head />

<svelte:head>
  <title>Sai | saikumarmk.com</title>
</svelte:head>

<div class="home" use:settleMargins>
  <div
    class="spray"
    aria-hidden="true"
    title="click to sew it again"
    onclick={e => e.currentTarget.querySelector('svg')?.dispatchEvent(new Event('thread:resew'))}>
    <Embroidery
      width={480}
      height={304}
      compose={(b, W, H) => {
        b.stem(b.curve(W + 20, H - 6, W * 0.72, H * 0.72, W * 0.44, H * 0.42))
        b.leaf(W * 0.86, H * 0.84, W * 0.7, H * 0.6, 20, 0.22)
        b.leaf(W * 0.66, H * 0.66, W * 0.56, H * 0.9, 17, -0.25)
        b.leaf(W * 0.55, H * 0.52, W * 0.36, H * 0.66, 14, 0.25)
        b.rose(W * 0.42, H * 0.36, 74, { petals: 16, turn: 0.4 })
        b.stem(b.curve(W * 0.8, H * 0.7, W * 0.84, H * 0.42, W * 0.8, H * 0.24))
        b.leaf(W * 0.83, H * 0.46, W * 0.96, H * 0.36, 11, -0.2)
        b.rose(W * 0.79, H * 0.2, 36, { petals: 10, turn: 2.1 })
        for (const [x, y] of [
          [0.62, 0.12],
          [0.66, 0.2],
          [0.96, 0.14],
          [0.26, 0.64],
          [0.3, 0.74]
        ])
          b.knot(W * x, H * y, 2.2, 'g1', b.tick(40))
      }} />
  </div>

  <div class="col with-notes">
    <h1 class="hello">
      Hi, I'm <em>Sai</em>
      .
    </h1>
    <div class="lede">
      <p>
        I work on generative photo and video models at Canva<Sidenote n={1}>
          <b>{current.role}</b>
          , Video Studio. Before that, Photo Effects, where I worked on Background Generator (1M+ monthly users).
        </Sidenote>, and outside of that I like taking things apart to see why they work: why anything
        <a href="/essence-associativity">associative can be split in half</a>
        , how every trainer in
        <a href="/pokered-elo-1">Pokémon Red would rank</a>
        against each other, what's actually sitting inside
        <a href="/yakuza0-archaeology">Yakuza 0's data tables</a>
        .
      </p>
      <p>
        This site is where I write it down. Some of it is maths, some is ML systems, and a lot of it is
        <a href="/playbook">advice for students</a>
        trying to get into Australian tech<Sidenote n={2}>
          <b>First Class Honours</b>
          , Applied Data Science at Monash; thesis on bias in diffusion models. Once president of the Monash Association of Coding.
        </Sidenote>, written from not that long ago.
      </p>
    </div>
  </div>

  <figure class="plate">
    <div class="plate-stage">
      <AsciiField
        mode="plate"
        {plate}
        bind:running={plateRunning}
        describedby="plate-cap"
        count={750}
        decay={0.7}
        gain={3.4}
        ramp=" ·.:+*o%@"
        fontSize={12}
        lineH={14}
        spread={0} />
    </div>
    <figcaption>
      <span id="plate-cap">
        <b>Plate {ROMAN[plateAt]}.</b>
        {plate.caption}
        <span class="from">
          From <a href="/{plate.slug}/">{plate.title}</a>
          .
        </span>
      </span>
      <span class="plate-btns">
        <button class="pill" type="button" onclick={nextPlate}>next plate</button>
        <button class="pill" type="button" onclick={() => (plateRunning = !plateRunning)}>
          {plateRunning ? 'pause' : 'play'}
        </button>
      </span>
    </figcaption>
  </figure>

  <div class="col">
    <section class="block" aria-labelledby="recent-h">
      <h2 class="smallcaps" id="recent-h">Recently</h2>
      <div use:satinSelect={{ items: 'li' }}>
        <ol class="toc">
          {#each recent as p (p.path)}
            <li>
              <div class="row">
                <Specimen
                  seed={p.seed ?? p.path}
                  width={130}
                  height={96}
                  R={32}
                  cy={0.42}
                  fit={false}
                  leaves={false}
                  speed={2}
                  class="near-bloom" />
                <a href={p.path}><span class="t">{p.title}</span></a>
                <span class="leader"></span>
                <span class="meta">{monthYear(p.published ?? p.created)}</span>
              </div>
              {#if p.summary}<div class="sum">{p.summary}</div>{/if}
            </li>
          {/each}
        </ol>
      </div>
      <p class="all"><a href="/archive">All writing, by topic</a></p>
    </section>
    <p class="status">
      Currently: <span aria-live="polite">{status}</span>
      <button type="button" title="another one" aria-label="Another status" onclick={reroll}>↻</button>
    </p>
  </div>

  <section class="block about-grid" id="about" aria-label="About">
    <div>
      <h2 class="smallcaps">Trainer card</h2>
      <div class="tcard">
        <div class="tc-top">
          <span>Trainer Card</span>
          <b>No. {trainerCard.no}</b>
        </div>
        <div class="tc-window">
          <AsciiField
            mode="attractors"
            bind:running={fieldRunning}
            count={110}
            decay={0.7}
            gain={1.1}
            ramp=" ·∙.:;-=+*%#@"
            fontSize={11}
            lineH={13}
            spread={0.4} />
          <button class="tc-pause" type="button" onclick={() => (fieldRunning = !fieldRunning)}>
            {fieldRunning ? 'pause' : 'play'}
          </button>
        </div>
        <div class="tc-body">
          <img src={site.author.avatar} alt="Sai" width="84" height="84" />
          <div>
            <h3>Sai Kumar M.K.</h3>
            <p>{current.role} · {current.at}</p>
          </div>
        </div>
        <div class="tc-types">
          {#each trainerCard.types as t}<span>{t}</span>{/each}
        </div>
        <dl class="tc-stats">
          <div>
            <dt>Posts</dt>
            <dd>{posts.length}</dd>
          </div>
          <div>
            <dt>Dex</dt>
            <dd>{projects.length}</dd>
          </div>
          <div>
            <dt>Badges</dt>
            <dd>{trainerCard.badges.length}</dd>
          </div>
          <div>
            <dt>Since</dt>
            <dd>{trainerCard.since}</dd>
          </div>
        </dl>
        <div class="tc-foot">
          <div>
            <div class="badges" role="group" aria-label="Badges">
              {#each trainerCard.badges as b (b.id)}
                <button
                  class="badge stitched"
                  class:on={badgeId === b.id}
                  type="button"
                  aria-pressed={badgeId === b.id}
                  onclick={() => pickBadge(b.id)}>
                  {b.id}
                </button>
              {/each}
            </div>
            <div class="tc-detail" aria-live="polite">
              {#if badge}
                <b>{badge.role}</b>
                · {badge.period}
                <br />
                {badge.blurb}
                {#if badge.link}<a href={badge.link.href}>{badge.link.label}</a>
                  .{/if}
                {#if badge.org && rows.some(r => r.org === badge.org)}<a href="#experience">In Experience ↓</a>{/if}
              {:else}
                Pick a badge.
              {/if}
            </div>
          </div>
          <Embroidery
            class="tc-flower"
            width={150}
            height={128}
            speed={1.4}
            compose={(b, W, H) => {
              b.leaf(W * 0.1, H * 0.95, W * 0.45, H * 0.5, 16, 0.2)
              b.rose(W * 0.62, H * 0.6, Math.min(W, H) * 0.34, { petals: 13, turn: 0.8 })
            }} />
        </div>
      </div>
    </div>
    <div>
      <h2 class="smallcaps">Project dex · highlights</h2>
      <div class="dex">
        {#each highlights as p (p.id)}
          <a class="stitched" href="/dex#{p.id}">
            <Specimen seed={p.name} width={60} height={60} R={20} cy={0.5} leaves={false} speed={2} class="bloom" />
            <div class="no">No. {no(projects.indexOf(p))}</div>
            <div class="pn">{p.name}</div>
            <div class="pd">{p.description}</div>
          </a>
        {/each}
      </div>
      <p class="dex-all"><a href="/dex">All {projects.length} entries →</a></p>
    </div>
  </section>

  <section class="block col" id="experience" aria-labelledby="exp-h">
    <h2 class="exp-h" id="exp-h">Experience</h2>
    <p class="exp-lede">
      Currently <b>{current.role} at {current.at}</b>
      .
    </p>
    <div use:satinSelect={{ items: '.rec-head' }}>
      <div>
        {#each rows as r, i}
          <div class="rec" class:now={r.now} class:flash={flashOrg === r.org}>
            {#if r.pts.length > 1}
              <button
                class="rec-head"
                type="button"
                aria-expanded={open[i]}
                aria-controls="rec-{i}"
                onclick={() => (open[i] = !open[i])}>
                <span class="yr">{r.yr}</span>
                <span class="role">{r.role}</span>
                <span class="leader"></span>
                <span class="org">{r.at}</span>
                <span class="more" aria-hidden="true">+</span>
              </button>
              <div class="body" id="rec-{i}" hidden={!open[i]}>
                <ul>
                  {#each r.pts as pt}<li>{@html pt}</li>{/each}
                </ul>
              </div>
            {:else}
              <div class="rec-head">
                <span class="yr">{r.yr}</span>
                <span class="role">{r.role}</span>
                <span class="leader"></span>
                <span class="org">{r.at}</span>
                <span class="more"></span>
                {#if r.pts[0]}<span class="gist">{@html r.pts[0]}</span>{/if}
              </div>
            {/if}
          </div>
        {/each}
      </div>
    </div>
    <p class="rec-foot">
      The one-page version: <a href="/cv">printable CV</a>
      .
    </p>
  </section>
</div>

<style>
  .home {
    position: relative;
    display: flow-root;
    overflow-x: clip;
  }

  /* the spray sits in the margin column and off the right edge, never over the reading column */
  .spray {
    position: absolute;
    top: 1rem;
    left: calc(var(--measure) + var(--gap) - 3rem);
    width: 26rem;
    height: 16.5rem;
    z-index: 1;
    cursor: var(--pointer);
  }
  .spray :global(svg) {
    width: 100%;
    height: 100%;
  }
  @media (max-width: 59.99rem) {
    .spray {
      left: auto;
      right: -2rem;
      top: 0;
      width: 15rem;
      height: 9.5rem;
    }
  }
  @media (max-width: 34rem) {
    .spray {
      width: 11rem;
      height: 7rem;
      right: -2.5rem;
      top: 2.5rem;
    }
  }

  .hello {
    font-size: clamp(2.4rem, 5vw, 3.2rem);
    margin: 8.5rem 0 1.4rem;
    font-weight: 400;
    position: relative;
    z-index: 2;
  }
  @media (max-width: 59.99rem) {
    .hello {
      margin-top: 5rem;
    }
  }
  .hello em {
    color: var(--c1);
  }
  .lede p {
    margin: 0 0 1.1rem;
  }

  /* ---------- plate ---------- */
  figure.plate {
    margin: 5rem 0 3.5rem;
    max-width: calc(var(--measure) + var(--gap) + var(--margin));
  }
  .plate-stage {
    position: relative;
    height: 300px;
    border-top: 1px solid var(--rule);
    border-bottom: 1px solid var(--rule);
    background: color-mix(in srgb, var(--panel) 60%, transparent);
  }
  .plate-stage :global(canvas) {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    display: block;
    cursor: crosshair;
  }
  figure.plate figcaption {
    margin-top: 0.7rem;
    font-size: 15px;
    line-height: 1.5;
    color: var(--muted);
    display: flex;
    gap: 1rem;
    justify-content: space-between;
    align-items: baseline;
  }
  figure.plate figcaption b {
    font-weight: 500;
    color: var(--fg2);
    font-style: italic;
  }
  figure.plate figcaption .from {
    white-space: nowrap;
  }
  .plate-btns {
    display: flex;
    gap: 0.4rem;
    flex: none;
  }
  @media (max-width: 40rem) {
    figure.plate figcaption {
      flex-direction: column;
    }
    .plate-stage {
      height: 240px;
    }
    figure.plate figcaption .from {
      white-space: normal;
    }
  }

  section.block {
    margin: 3.5rem 0;
  }
  section.block > h2,
  section.block > div > h2 {
    margin: 0 0 0.6rem;
  }
  .all {
    margin-top: 1rem;
  }
  .status {
    font-style: italic;
    color: var(--muted);
    margin: 2.5rem 0;
    font-size: 17px;
  }
  .status button {
    font-style: normal;
    font-family: var(--mono);
    font-size: 12px;
    color: var(--c2);
    background: none;
    border: 0;
    cursor: var(--pointer);
  }

  /* ---------- trainer card + dex highlights ---------- */
  .stitched {
    position: relative;
  }
  .stitched::after {
    content: '';
    position: absolute;
    inset: 6px;
    border: 1.5px dashed var(--g1);
    border-radius: inherit;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.2s;
  }
  .stitched:hover::after,
  .stitched.on::after,
  .stitched:focus-visible::after {
    opacity: 1;
  }
  .stitched:focus-visible {
    outline-color: color-mix(in srgb, var(--r3) 45%, transparent);
  }
  .about-grid {
    display: grid;
    grid-template-columns: minmax(0, var(--measure)) minmax(0, 1fr);
    gap: var(--gap);
    align-items: start;
    scroll-margin-top: 4rem;
  }
  @media (max-width: 59.99rem) {
    .about-grid {
      grid-template-columns: 1fr;
    }
  }

  /* a woven card (twill texture); the attractors are sewn into its cloth and thin out toward the name */
  .tcard {
    border: 1px solid color-mix(in srgb, var(--fg2) 70%, transparent);
    border-radius: 14px;
    overflow: hidden;
    position: relative;
    background:
      repeating-linear-gradient(45deg, transparent 0 3px, color-mix(in srgb, var(--fg) 3.5%, transparent) 3px 4px),
      repeating-linear-gradient(-45deg, transparent 0 3px, color-mix(in srgb, var(--fg) 2.5%, transparent) 3px 4px),
      var(--panel);
    box-shadow:
      0 1px 0 var(--rule),
      0 14px 30px -22px color-mix(in srgb, var(--fg) 40%, transparent);
  }
  .tc-top {
    display: flex;
    justify-content: space-between;
    padding: 0.9rem 1.2rem 0.6rem;
    font-family: var(--mono);
    font-size: 11px;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: var(--muted);
  }
  .tc-top b {
    color: var(--r3);
    font-weight: 500;
  }
  .tc-window {
    position: relative;
    height: 170px;
    margin: -0.4rem 0 0;
  }
  .tc-window :global(canvas) {
    width: 100%;
    height: 100%;
    display: block;
    -webkit-mask-image: radial-gradient(120% 95% at 50% 30%, #000 45%, transparent 88%);
    mask-image: radial-gradient(120% 95% at 50% 30%, #000 45%, transparent 88%);
  }
  :global([data-theme='ivory']) .tc-window :global(canvas) {
    --c1: var(--r3);
    --c2: var(--g2);
  }
  .tc-pause {
    position: absolute;
    right: 1.2rem;
    top: 0.2rem;
    font-family: var(--mono);
    font-size: 10.5px;
    color: var(--muted);
    background: none;
    border: 0;
    padding: 0;
    cursor: var(--pointer);
  }
  .tc-pause:hover {
    color: var(--fg);
  }
  .tc-body {
    display: grid;
    grid-template-columns: 84px 1fr;
    gap: 1rem;
    padding: 0 1.2rem;
    position: relative;
    z-index: 1;
    margin-top: -64px;
    align-items: end;
  }
  .tc-body h3,
  .tc-body p {
    text-shadow:
      0 0 6px var(--panel),
      0 0 12px var(--panel),
      0 0 2px var(--panel);
  }
  .tc-body img {
    width: 84px;
    height: 84px;
    object-fit: cover;
    border-radius: 50%;
    border: 3px solid var(--panel);
    background: var(--bg);
    box-shadow: 0 0 0 1px var(--rule);
  }
  .tc-body h3 {
    font-weight: 400;
    font-size: 1.55rem;
    margin: 0;
    line-height: 1.05;
  }
  .tc-body p {
    margin: 0.15rem 0 0.2rem;
    font-size: 15px;
    color: var(--fg2);
  }
  .tc-types {
    display: flex;
    flex-wrap: wrap;
    gap: 0.3rem;
    padding: 0.8rem 1.2rem 0;
  }
  .tc-types span {
    font-family: var(--mono);
    font-size: 10px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    border-radius: 4px;
    padding: 0.1rem 0.5rem;
    color: var(--sel-ink);
    background: var(--r3);
  }
  .tc-types span:nth-child(2n) {
    background: var(--g2);
  }
  .tc-stats {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    margin: 0.9rem 1.2rem 0;
    border-top: 1px solid var(--rule);
    border-bottom: 1px solid var(--rule);
  }
  .tc-stats div {
    padding: 0.5rem 0 0.45rem;
  }
  .tc-stats div + div {
    border-left: 1px solid var(--rule);
    padding-left: 0.7rem;
  }
  .tc-stats dt {
    font-family: var(--mono);
    font-size: 9.5px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--muted);
  }
  .tc-stats dd {
    margin: 0;
    font-size: 1.15rem;
    line-height: 1.2;
  }
  .tc-foot {
    display: grid;
    grid-template-columns: 1fr 150px;
    align-items: end;
  }
  .tc-foot :global(.tc-flower) {
    width: 150px;
    height: 128px;
    display: block;
    margin: 0 0.2rem 0.2rem 0;
  }
  .badges {
    display: flex;
    gap: 0.45rem;
    padding: 0.9rem 1.2rem 0.4rem;
    flex-wrap: wrap;
  }
  .badge {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    border: 1px solid var(--fg2);
    background: var(--bg);
    display: grid;
    place-items: center;
    font-family: var(--mono);
    font-size: 9px;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--fg2);
    cursor: var(--pointer);
    padding: 0;
  }
  .badge.stitched::after {
    inset: 4px;
    border-radius: 50%;
  }
  .badge.on {
    background: var(--r3);
    color: var(--sel-ink);
    border-color: var(--r3);
  }
  .tc-detail {
    padding: 0.2rem 1.2rem 1.1rem;
    font-size: 15px;
    line-height: 1.45;
    color: var(--fg2);
    min-height: 4.4rem;
  }
  .tc-detail b {
    font-weight: 500;
    color: var(--fg);
  }

  .dex {
    display: grid;
    gap: 0.6rem;
  }
  .dex a {
    display: grid;
    grid-template-columns: 1fr 44px;
    gap: 0 0.6rem;
    text-decoration: none;
    border: 1px solid var(--rule);
    border-radius: 10px;
    padding: 0.75rem 0.95rem 0.85rem;
    background: var(--bg);
  }
  .dex a > :not(:global(.bloom)) {
    grid-column: 1;
  }
  .dex :global(.bloom) {
    grid-column: 2;
    grid-row: 1 / span 3;
    width: 44px;
    height: 44px;
    align-self: center;
  }
  .dex .no {
    font-family: var(--mono);
    font-size: 10.5px;
    color: var(--muted);
    letter-spacing: 0.1em;
  }
  .dex .pn {
    font-family: var(--mono);
    font-size: 13.5px;
    color: var(--fg);
    margin: 0.1rem 0 0.2rem;
  }
  .dex .pd {
    font-size: 15px;
    line-height: 1.45;
    color: var(--muted);
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .dex-all {
    font-size: 15px;
    margin: 0.7rem 0 0;
  }

  /* ---------- experience: the old portfolio page, rows open like drawers ---------- */
  #experience {
    scroll-margin-top: 4rem;
  }
  .exp-h {
    font-size: 1.9rem;
    font-weight: 400;
    margin: 0 0 0.5rem;
  }
  .exp-lede {
    margin: 0 0 1.4rem;
    color: var(--fg2);
  }
  .exp-lede b {
    font-weight: 500;
    color: var(--fg);
  }
  .rec {
    margin: 0 -0.9rem;
  }
  .rec-head {
    display: flex;
    flex-wrap: wrap;
    row-gap: 0;
    align-items: baseline;
    gap: 0 0.7rem;
    padding: 0.45rem 0.9rem;
    width: 100%;
    text-align: left;
    font: inherit;
    color: inherit;
    background: none;
    border: 0;
  }
  button.rec-head {
    cursor: var(--pointer);
  }
  .rec-head .yr {
    font-family: var(--mono);
    font-size: 12px;
    color: var(--muted);
    width: 6.2rem;
    flex: none;
  }
  .rec-head .role {
    color: var(--fg);
  }
  .rec-head .leader {
    flex: 1;
    border-bottom: 1px dotted color-mix(in srgb, var(--muted) 60%, transparent);
    transform: translateY(-0.3em);
    min-width: 1rem;
  }
  .rec-head .org {
    font-family: var(--mono);
    font-size: 12.5px;
    color: var(--muted);
    white-space: nowrap;
  }
  .rec-head .more {
    font-family: var(--mono);
    font-size: 12px;
    color: var(--c3);
    width: 0.8rem;
    transition: transform 0.2s;
  }
  .rec-head[aria-expanded='true'] .more {
    transform: rotate(45deg);
  }
  .rec-head .gist {
    flex-basis: 100%;
    padding-left: calc(6.2rem + 0.7rem);
    font-size: 15.5px;
    font-style: italic;
    color: var(--muted);
    line-height: 1.4;
  }
  .rec .body {
    padding: 0.1rem 0.9rem 0.8rem calc(6.2rem + 1.6rem);
    font-size: 16px;
    color: var(--fg2);
    line-height: 1.5;
  }
  .rec .body ul {
    margin: 0;
    padding-left: 1.1rem;
    list-style: disc;
  }
  .rec .body li {
    margin: 0.2rem 0;
  }
  .rec .body li::marker {
    color: var(--g1);
  }
  .rec .body :global(code) {
    font-family: var(--mono);
    font-size: 0.85em;
  }
  .rec.flash .role {
    text-decoration: underline dashed var(--g1);
    text-underline-offset: 4px;
  }
  .rec.now .role::after {
    content: 'now';
    font-family: var(--mono);
    font-size: 10px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--sel-ink);
    background: var(--r3);
    border-radius: 3px;
    padding: 0.05rem 0.35rem;
    margin-left: 0.5rem;
    vertical-align: 0.15em;
  }
  .rec.now .rec-head:global(.is-sel) .role::after {
    background: var(--sel-ink);
    color: var(--sel);
  }
  @media (max-width: 40rem) {
    .rec-head .yr {
      width: 100%;
    }
    .rec-head .leader {
      display: none;
    }
    .rec-head .gist {
      padding-left: 0;
    }
    .rec .body {
      padding-left: 0.9rem;
    }
  }
  .rec-foot {
    font-size: 15px;
    color: var(--muted);
    margin-top: 1rem;
  }

  @media (max-width: 40rem) {
    .tc-foot {
      grid-template-columns: 1fr 96px;
    }
    .tc-foot :global(.tc-flower) {
      width: 92px;
      height: 92px;
      margin: 0 0.5rem 0.5rem 0;
    }
    .badges {
      gap: 0.35rem;
    }
    .badge {
      width: 44px;
      height: 44px;
      font-size: 8px;
      letter-spacing: 0;
    }
    .tc-stats dd {
      font-size: 1rem;
    }
    .tc-stats div + div {
      padding-left: 0.5rem;
    }
  }
</style>
