<script lang="ts">
  import { onDestroy, onMount } from 'svelte'
  import { site } from '$lib/config/site'
  import { homeContent } from '$lib/config/home'
  import { assets } from '$lib/config/assets'
  import { getReadingTime } from '$lib/utils/reading-time'
  import Head from '$lib/components/head.svelte'
  import BrandImage from '$lib/components/ui/BrandImage.svelte'

  let { data }: { data: { res?: Urara.Post[] } } = $props()
  let allPosts = $derived((data.res ?? []).filter(post => !post.flags?.includes('unlisted')))
  let wordIndex = $state(0)
  let nowIndex = $state(0)
  let nowText = $state('')
  let nowTimer: ReturnType<typeof setInterval> | undefined
  let nowTypeTimer: ReturnType<typeof setTimeout> | undefined

  const { rotatingFocus, interests, appCards, statusMessages } = homeContent

  function isLearningNote(post: Urara.Post): boolean {
    return (
      post.path?.startsWith('/growth/2026/') ||
      post.tags?.includes('yggdrasil') ||
      post.tags?.includes('learning-note') ||
      (post as any).growth !== undefined
    )
  }

  function postDate(post: Urara.Post): Date {
    return new Date(post.published ?? post.created)
  }

  let blogPosts = $derived(allPosts.filter(post => !isLearningNote(post)))
  let latestPosts = $derived(blogPosts.slice(0, 5))
  let tagCount = $derived.by(() => {
    const tags = new Set<string>()
    allPosts.forEach(post => post.tags?.forEach(tag => tags.add(tag)))
    return tags.size
  })

  function typeNowLine(index: number, reduceMotion: boolean) {
    const line = statusMessages[index]
    if (reduceMotion) {
      nowText = line
      return
    }

    let char = 0
    const typeNext = () => {
      nowText = line.slice(0, char)
      char += 1
      if (char <= line.length) {
        nowTypeTimer = setTimeout(typeNext, 28)
      }
    }
    typeNext()
  }

  onMount(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    typeNowLine(nowIndex, reduce)
    if (!reduce) {
      nowTimer = setInterval(() => {
        if (nowTypeTimer) clearTimeout(nowTypeTimer)
        const current = nowText
        let char = current.length
        const eraseNext = () => {
          nowText = current.slice(0, char)
          char -= 1
          if (char >= 0) {
            nowTypeTimer = setTimeout(eraseNext, 12)
            return
          }
      nowIndex = (nowIndex + 1) % statusMessages.length
          typeNowLine(nowIndex, reduce)
        }
        eraseNext()
      }, 7200)
    }
  })

  onDestroy(() => {
    if (nowTimer) clearInterval(nowTimer)
    if (nowTypeTimer) clearTimeout(nowTypeTimer)
  })
</script>

<Head />

<svelte:head>
  <title>Sai | saikumarmk.com</title>
</svelte:head>

<div class="editorial-page site-editorial-page">
  <header class="editorial-hero wrap">
    <div class="hero-eyebrow">
      Senior Applied Scientist <span class="dim">@</span>
      <img class="canva-logo" src={assets.canvaWordmark} alt="Canva" />
      <span class="dim">·</span> building AI-assisted video software
    </div>

    <h1 class="huge">Hi, I'm <span>Sai.</span></h1>
    <button class="kinetic-line" onclick={() => (wordIndex = (wordIndex + 1) % rotatingFocus.length)}>
      I train <span>{rotatingFocus[wordIndex]}</span>
    </button>

    <div class="now-line"><span>~/now ▸</span><output>{nowText}</output><i aria-hidden="true"></i></div>

    <p class="lede">
      ...and I write about <b>how the sausage gets made</b>: machine learning, the tech-career maze,
      reverse-engineering side quests, and the craft of software. A growing archive, one overgrown skill tree,
      and a Pokédex of projects.
    </p>

    <div class="hero-actions">
      <a class="editorial-btn primary" href="/archive">Read the blog</a>
      <a class="editorial-btn" href="/about">About me</a>
      <a class="editorial-btn" href="https://github.com/saikumarmk" target="_blank" rel="noopener noreferrer">GitHub ↗</a>
      {#if site.author.avatar}
        <img class="hero-avatar" src={site.author.avatar} alt="Sai" />
      {/if}
    </div>

    <div class="metarow">
      <div><span>Focus</span><strong>photo + video <em>generative models</em></strong></div>
      <div><span>Based</span><strong>Australia · ex-Monash</strong></div>
      <div><span>Writing</span><strong>ML · careers · software</strong></div>
      <div><span>Output</span><strong><em>{allPosts.length}</em> posts · {tagCount} tags</strong></div>
    </div>
  </header>

  <section class="section wrap">
    <div class="section-head">
      <div><span class="eyebrow">pinned</span><h2>Start here</h2></div>
      <a class="section-link" href="/portfolio">everything I've made →</a>
    </div>
    <div class="pins">
      <a class="pin" href="/playbook">
        <span>Guide</span><h3>The Grad/Intern Playbook</h3>
        <p>A field guide for students breaking into tech: timelines, skills, resumes, and landing the offer.</p>
        <b>Read the guide →</b>
      </a>
      <a class="pin" href="/portfolio">
        <span>Work</span><h3>Portfolio & Project Dex</h3>
        <p>Experience at Canva, research, and open source laid out as a compact project-forward index.</p>
        <b>Open the Dex →</b>
      </a>
      <a class="pin" href={assets.thesis} target="_blank" rel="noopener noreferrer">
        <span>Research</span><h3>Honours Thesis</h3>
        <p>Bias modelling mitigation in diffusion models. First Class Honours, Monash 2023.</p>
        <b>Read the PDF →</b>
      </a>
    </div>
  </section>

  <section class="section wrap">
    <div class="section-head">
      <div><span class="eyebrow">playground</span><h2>Things you can actually click</h2></div>
      <a class="section-link" href="/portfolio">all projects →</a>
    </div>
    <div class="apps">
      {#each appCards as app}
        <a class="app-card" href={app.href} target={app.external ? '_blank' : undefined} rel={app.external ? 'noopener noreferrer' : undefined}>
          <div class="app-thumb">
            <BrandImage src={app.image} alt={app.title} class="h-full w-full object-contain p-4" fallbackText={app.title} />
          </div>
          <div class="app-body">
            <div class="app-top"><span>{app.title}</span><small>live ↗</small></div>
            <p>{app.summary}</p>
            <b>#{app.kind}</b>
          </div>
        </a>
      {/each}
    </div>
  </section>

  <section class="section wrap">
    <div class="section-head">
      <div><span class="eyebrow">latest</span><h2>Fresh from the blog</h2></div>
      <a class="section-link" href="/archive">full archive →</a>
    </div>
    <div class="feed">
      {#each latestPosts as post}
        {@const date = postDate(post)}
        <a class="post-row" href={post.path}>
          <span class="post-date"><b>{date.getDate()}</b>{date.toLocaleDateString('en-US', { month: 'short' })}</span>
          <span class="post-main">
            <strong>{post.title || post.path.slice(1)}</strong>
            {#if post.summary}<span>{post.summary}</span>{/if}
            <span class="post-tags">
              {#each (post.tags ?? []).slice(0, 3) as tag}
                <em>#{tag}</em>
              {/each}
            </span>
          </span>
          <span class="post-meta">{getReadingTime(post.html) ?? 'read'} →</span>
        </a>
      {/each}
    </div>
  </section>

  <section class="section wrap">
    <div class="colset">
      <div>
        <div class="section-head"><h2>Elsewhere</h2></div>
        <div class="links-grid">
          <a href="https://github.com/saikumarmk" target="_blank" rel="noopener noreferrer">GitHub <span>@saikumarmk ↗</span></a>
          <a href="https://www.linkedin.com/in/saikumarmk/" target="_blank" rel="noopener noreferrer">LinkedIn <span>in/saikumarmk ↗</span></a>
          <a href="/atom.xml">RSS / atom <span>subscribe ⚛</span></a>
          <a href="https://saikumarmk.github.io/monash-handbook-plus/graph" target="_blank" rel="noopener noreferrer">Unit Graph <span>monash units ↗</span></a>
        </div>
      </div>
      <div>
        <div class="section-head"><h2>Currently into</h2></div>
        <div class="interests">
          {#each interests as interest}
            <span>{interest}</span>
          {/each}
        </div>
      </div>
    </div>
  </section>

  <footer class="editorial-footer wrap">
    <div>
      <strong>saikumarmk<span>.com</span></strong>
      <p>Built with SvelteKit. Math by KaTeX, diagrams by Mermaid, and sprites by a deeply unreasonable love of Pokémon.</p>
    </div>
    <nav>
      <a href="/about">About</a>
      <a href="/portfolio">Portfolio</a>
      <a href="/archive">Archive</a>
      <a href="/playbook">Playbook</a>
    </nav>
  </footer>
</div>

<style>
  .editorial-page {
    --bg: var(--site-bg);
    --bg-tint: var(--site-bg-tint);
    --panel: var(--site-panel);
    --panel-2: var(--site-panel-2);
    --line: var(--site-line);
    --line-strong: var(--site-line-strong);
    --fg: var(--site-fg);
    --fg-2: var(--site-fg-2);
    --muted: var(--site-muted);
    --dim: var(--site-dim);
    --accent: var(--site-accent);
    --accent-ink: var(--site-accent-ink);
    --mono: var(--site-mono);
    --mono2: var(--site-mono2);
    --sans: var(--site-sans);
  }
  .wrap { max-width: 1180px; margin: 0 auto; padding-inline: clamp(20px, 5vw, 84px); }
  .editorial-hero { padding-block: clamp(56px, 11vh, 150px) clamp(40px, 6vh, 80px); }
  .hero-eyebrow, .eyebrow { font-family: var(--mono); font-size: 12px; letter-spacing: 2px; text-transform: uppercase; color: var(--accent); }
  .hero-eyebrow { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin-bottom: 22px; }
  .canva-logo {
    width: 62px;
    height: auto;
    opacity: 0.95;
  }
  .dim { color: var(--dim); }
  .huge { font-family: var(--sans); font-size: clamp(2.7rem, 9vw, 7rem); line-height: .94; letter-spacing: -.045em; font-weight: 800; margin-bottom: 20px; }
  .huge span, .kinetic-line span, .metarow em, .editorial-footer span { color: var(--accent); font-style: normal; }
  .kinetic-line { display: block; border: 0; padding: 0; background: transparent; font-family: var(--sans); font-size: clamp(1.35rem, 4vw, 2.5rem); color: var(--fg-2); cursor: pointer; margin-bottom: 30px; }
  .now-line { display: inline-flex; gap: 12px; align-items: center; border: 1px solid var(--line-strong); border-left: 3px solid var(--accent); border-radius: 8px; padding: 11px 16px; margin-bottom: 24px; background: color-mix(in srgb, var(--panel) 60%, transparent); }
  .now-line span { color: var(--accent); font-weight: 700; }
  .now-line output { min-width: min(58vw, 38ch); }
  .now-line i { width: 7px; height: 1.15em; background: var(--accent); animation: caret-blink 1s steps(1) infinite; }
  @keyframes caret-blink { 50% { opacity: 0; } }
  .lede { max-width: 60ch; color: var(--muted); line-height: 1.75; margin-bottom: 28px; }
  .lede b { color: var(--fg-2); font-weight: 500; }
  .hero-actions { display: flex; gap: 12px; flex-wrap: wrap; align-items: center; }
  .hero-avatar { width: 50px; height: 50px; border-radius: 999px; border: 2px solid var(--accent); object-fit: cover; }
  .editorial-btn { font-family: var(--mono); font-weight: 700; display: inline-flex; align-items: center; gap: 9px; padding: 11px 17px; border-radius: 8px; border: 1px solid var(--line-strong); color: var(--fg); transition: .15s; }
  .editorial-btn:hover, .section-link:hover { color: var(--accent); border-color: var(--accent); transform: translateY(-1px); }
  .editorial-btn.primary { background: var(--accent); color: var(--accent-ink); border-color: var(--accent); }
  .metarow { display: flex; gap: 34px; flex-wrap: wrap; margin-top: 44px; padding-top: 26px; border-top: 1px solid var(--line); }
  .metarow span { display: block; font-family: var(--mono); font-size: 11px; letter-spacing: 1.5px; text-transform: uppercase; color: var(--dim); }
  .metarow strong { display: block; margin-top: 5px; color: var(--fg-2); font-size: 14px; font-weight: 500; }
  .section { padding-top: 84px; }
  .section-head { display: flex; justify-content: space-between; align-items: end; gap: 20px; margin-bottom: 26px; flex-wrap: wrap; }
  .section-head h2 { font-family: var(--sans); font-size: clamp(20px, 3vw, 30px); letter-spacing: -.03em; margin-top: 12px; }
  .section-link { font-family: var(--mono); font-size: 13px; color: var(--muted); transition: .15s; }
  .pins, .apps { display: grid; gap: 18px; }
  .pins { grid-template-columns: repeat(3, 1fr); }
  .pin, .app-card { border: 1px solid var(--line); border-radius: 18px; background: color-mix(in srgb, var(--panel) 78%, transparent); transition: .15s; }
  .pin { padding: 24px; }
  .pin:hover, .app-card:hover { border-color: color-mix(in srgb, var(--accent) 55%, transparent); transform: translateY(-3px); }
  .pin span { font-family: var(--mono); font-size: 11px; letter-spacing: 1.5px; text-transform: uppercase; color: var(--accent); }
  .pin h3 { font-family: var(--sans); font-size: 19px; margin: 14px 0 8px; }
  .pin p, .app-body p { color: var(--muted); font-size: 14px; line-height: 1.55; }
  .pin b { display: inline-block; margin-top: 16px; font-family: var(--mono); color: var(--accent); font-size: 13px; }
  .apps { grid-template-columns: repeat(2, 1fr); }
  .app-card { display: grid; grid-template-columns: 152px 1fr; overflow: hidden; }
  .app-thumb { min-height: 124px; background: var(--panel-2); display: grid; place-items: center; }
  .app-body { padding: 16px 18px; }
  .app-top { display: flex; justify-content: space-between; gap: 10px; font-family: var(--mono); font-weight: 700; }
  .app-top small { color: var(--dim); font-size: 11px; }
  .app-body b, .post-tags em, .interests span { display: inline-flex; border: 1px solid color-mix(in srgb, var(--accent) 45%, transparent); color: var(--accent); border-radius: 999px; padding: 3px 10px; font-family: var(--mono); font-size: 11px; font-style: normal; }
  .feed { display: flex; flex-direction: column; }
  .post-row { display: grid; grid-template-columns: 64px 1fr auto; gap: 20px; padding: 16px 12px; border-radius: 12px; border: 1px solid transparent; transition: .15s; }
  .post-row:hover { background: var(--panel); border-color: var(--line); transform: translateX(4px); }
  .post-date { text-align: right; color: var(--dim); text-transform: uppercase; font-family: var(--mono); font-size: 12px; }
  .post-date b { display: block; color: var(--fg-2); font-size: 18px; }
  .post-main strong { display: block; font-family: var(--mono); color: var(--fg); }
  .post-main span:not(.post-tags) { display: block; color: var(--muted); font-size: 14px; margin-top: 5px; }
  .post-tags { display: flex; gap: 7px; flex-wrap: wrap; margin-top: 10px; }
  .post-meta { color: var(--dim); font-family: var(--mono); font-size: 12px; white-space: nowrap; }
  .colset { display: grid; grid-template-columns: 1fr 1fr; gap: clamp(28px, 5vw, 56px); }
  .links-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
  .links-grid a { display: flex; flex-direction: column; gap: 2px; border: 1px solid var(--line); border-radius: 12px; padding: 13px 15px; color: var(--fg-2); transition: .15s; }
  .links-grid a:hover { color: var(--accent); border-color: var(--accent); transform: translateX(3px); }
  .links-grid span { color: var(--dim); font-size: 11px; }
  .interests { display: flex; flex-wrap: wrap; gap: 9px; }
  .editorial-footer { border-top: 1px solid var(--line); margin-top: 84px; padding-block: 44px 60px; display: flex; justify-content: space-between; gap: 32px; flex-wrap: wrap; color: var(--dim); }
  .editorial-footer strong { font-family: var(--mono); color: var(--fg); }
  .editorial-footer p { max-width: 48ch; font-size: 13px; margin-top: 12px; }
  .editorial-footer nav { display: flex; gap: 18px; flex-wrap: wrap; font-family: var(--mono); font-size: 13px; }
  .editorial-footer a:hover { color: var(--accent); }
  @media (max-width: 880px) { .pins, .apps, .colset { grid-template-columns: 1fr; } }
  @media (max-width: 560px) { .app-card, .post-row { grid-template-columns: 1fr; } .post-date { text-align: left; } .post-meta { display: none; } }
</style>
