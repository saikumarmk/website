<script lang="ts">
  import { site } from '$lib/config/site'
  import { projects } from '$lib/config/portfolio'
  import TrainerBadgeMedal from '$lib/components/about/TrainerBadgeMedal.svelte'

  let { postCount = 0 }: { postCount?: number } = $props()

  const projectCount = projects.length

  type BadgeKind = 'monash' | 'mac' | 'playbook' | 'canva'

  type Badge = {
    id: BadgeKind
    label: string
    slot: string
    role: string
    period: string
    blurb: string
    href?: string
    external?: boolean
  }

  const badges: Badge[] = [
    {
      id: 'monash',
      label: 'Monash',
      slot: '001',
      role: 'BSci (Hons) Applied Data Science',
      period: '2019 → 2023',
      blurb: 'First Class Honours · thesis on bias mitigation in diffusion models (90/100).'
    },
    {
      id: 'mac',
      label: 'MAC',
      slot: '002',
      role: 'President · Monash Association of Coding',
      period: '2021 → 2022',
      blurb: 'Grew past 1,000 members; Tech Careers Evening, MACathon, mock interviews.'
    },
    {
      id: 'playbook',
      label: 'Playbook',
      slot: '003',
      role: 'Grad / intern guide',
      period: 'living doc',
      blurb: 'Everything I wish someone had told me about breaking into tech in Australia.',
      href: '/playbook'
    },
    {
      id: 'canva',
      label: 'Canva',
      slot: '004',
      role: 'Sr. Applied Scientist',
      period: '2023 → now',
      blurb: 'Photo & video generative models — research through to production.',
      href: 'https://www.canva.com/',
      external: true
    }
  ]

  const lockedSlots = ['005', '006', '007', '008']
  const types = [
    { label: 'ML', tone: 'ml' },
    { label: 'HPC', tone: 'hpc' },
    { label: 'Research', tone: 'research' },
    { label: 'Maths', tone: 'maths' },
    { label: 'Reverse Eng', tone: 'reverse' }
  ] as const

  const secretClasses = [
    'PKMN Trainer',
    'Ruin Maniac',
    'Scientist',
    'Bird Keeper',
    'Cooltrainer',
    'Elite Four hopeful',
    'Diffusion Specialist',
    'Ace Trainer'
  ]

  const sparkleOffsets = [
    { x: '12%', y: '18%', d: '0ms' },
    { x: '68%', y: '10%', d: '60ms' },
    { x: '78%', y: '52%', d: '120ms' },
    { x: '22%', y: '62%', d: '180ms' },
    { x: '48%', y: '28%', d: '90ms' },
    { x: '85%', y: '34%', d: '150ms' }
  ]

  let selectedBadge = $state<BadgeKind | null>(null)
  let trainerClass = $state('Applied Scientist')
  let secretIndex = $state(0)
  let shinyBurst = $state(false)
  let tiltX = $state(0)
  let tiltY = $state(0)
  let holoX = $state(50)
  let holoY = $state(50)
  let cardEl: HTMLElement | undefined = $state()
  let reduceMotion = $state(false)

  let activeBadge = $derived(badges.find(b => b.id === selectedBadge) ?? null)

  function selectBadge(id: BadgeKind) {
    selectedBadge = selectedBadge === id ? null : id
  }

  function cycleTrainerClass() {
    secretIndex = (secretIndex + 1) % secretClasses.length
    trainerClass = secretClasses[secretIndex]
  }

  function onAvatarDblClick() {
    if (reduceMotion) return
    shinyBurst = true
    window.setTimeout(() => (shinyBurst = false), 1400)
  }

  function onCardMove(e: MouseEvent) {
    if (reduceMotion || !cardEl) return
    const rect = cardEl.getBoundingClientRect()
    const px = (e.clientX - rect.left) / rect.width
    const py = (e.clientY - rect.top) / rect.height
    tiltX = (py - 0.5) * -6
    tiltY = (px - 0.5) * 8
    holoX = px * 100
    holoY = py * 100
  }

  function resetTilt() {
    tiltX = 0
    tiltY = 0
    holoX = 50
    holoY = 50
  }

  $effect(() => {
    if (typeof window === 'undefined') return
    reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  })
</script>

<article
  class="trainer-card"
  class:shiny-burst={shinyBurst}
  bind:this={cardEl}
  style="--tilt-x: {tiltX}deg; --tilt-y: {tiltY}deg; --holo-x: {holoX}%; --holo-y: {holoY}%;"
  onmousemove={onCardMove}
  onmouseleave={resetTilt}
>
  <div class="tc-holo" aria-hidden="true"></div>

  <header class="tc-bar">
    <span class="tc-bar-left">◖ Trainer Card</span>
    <span class="tc-bar-right">No. 025</span>
  </header>

  <div class="tc-body">
    <div class="tc-portrait-col">
      <button
        type="button"
        class="tc-photo"
        onclick={onAvatarDblClick}
        title="Double-click for a surprise"
        aria-label="Trainer portrait — double-click for a surprise"
      >
        <img src={site.author.avatar} alt="Sai" class="tc-avatar" />
        {#if shinyBurst}
          <span class="tc-shiny-flash" aria-hidden="true">✦ SHINY ENCOUNTER ✦</span>
          <div class="tc-sparkles" aria-hidden="true">
            {#each sparkleOffsets as spark}
              <span
                class="tc-spark"
                style="left: {spark.x}; top: {spark.y}; animation-delay: {spark.d};"
              >✦</span>
            {/each}
          </div>
        {/if}
      </button>
    </div>

    <div class="tc-main">
      {#if activeBadge}
        <div class="tc-detail">
          <div class="tc-detail-mark" aria-hidden="true">
            <TrainerBadgeMedal kind={activeBadge.id} compact />
          </div>
          <div class="tc-detail-copy">
            <button type="button" class="tc-back" onclick={() => (selectedBadge = null)}>← card</button>
            <p class="tc-detail-slot">Badge {activeBadge.slot}</p>
            <h3 class="tc-detail-title">{activeBadge.label}</h3>
            <p class="tc-detail-role">{activeBadge.role}</p>
            <p class="tc-detail-period">{activeBadge.period}</p>
          </div>
          <p class="tc-detail-blurb">{activeBadge.blurb}</p>
          {#if activeBadge.href}
            <a
              class="tc-detail-link"
              href={activeBadge.href}
              target={activeBadge.external ? '_blank' : undefined}
              rel={activeBadge.external ? 'noopener noreferrer' : undefined}
            >
              Open {activeBadge.label} {activeBadge.external ? '↗' : '→'}
            </a>
          {/if}
        </div>
      {:else}
        <h3 class="tc-name">Sai Kumar M.K.</h3>
        <p class="tc-title">Sr. Applied Scientist · Canva Video Studio</p>

        <div class="tc-stats">
          <div class="tc-stat">
            <span class="n">{postCount}</span>
            <span class="l">posts</span>
          </div>
          <div class="tc-stat">
            <span class="n">{projectCount}</span>
            <span class="l">projects</span>
          </div>
          <div class="tc-stat">
            <span class="n">2.5</span>
            <span class="l">yrs @ Canva</span>
          </div>
        </div>

        <p class="tc-sub">Types</p>
        <div class="tc-types">
          {#each types as type}
            <span class="tc-type-plate tc-type-{type.tone}">
              <span class="tc-type-label">{type.label}</span>
            </span>
          {/each}
        </div>

      {/if}
    </div>
  </div>

  <div class="tc-badges-wrap">
    <p class="tc-sub badges-heading">Badge case</p>
    <div class="tc-badge-track" role="list">
      {#each badges as badge, i (badge.id)}
        {#if i > 0}
          <span class="tc-track-connector" aria-hidden="true"></span>
        {/if}
        <button
          type="button"
          class="tc-gym-badge"
          class:active={selectedBadge === badge.id}
          onclick={() => selectBadge(badge.id)}
          aria-pressed={selectedBadge === badge.id}
          title={badge.label}
        >
          <TrainerBadgeMedal kind={badge.id} />
          <span class="tc-gym-label">{badge.label}</span>
        </button>
      {/each}

      <span class="tc-track-gap" aria-hidden="true"></span>

      {#each lockedSlots as slot}
        <div class="tc-gym-badge locked" title="More to come">
          <TrainerBadgeMedal kind="locked" locked />
          <span class="tc-gym-slot">{slot}</span>
        </div>
      {/each}
    </div>
  </div>

  <footer class="tc-footer">
    <button type="button" class="tc-id" onclick={cycleTrainerClass} title="Click to cycle trainer class">
      ID · SAIKUMARMK · {trainerClass} · MONASH '23 → CANVA
    </button>
  </footer>
</article>

<style>
  .trainer-card {
    --tc-r: 16px;
    position: relative;
    border: 1px solid color-mix(in srgb, var(--site-accent) 38%, var(--site-line-strong));
    border-radius: var(--tc-r);
    background:
      linear-gradient(180deg, rgba(255, 255, 255, 0.035), transparent 34%),
      linear-gradient(135deg, color-mix(in srgb, var(--site-panel) 92%, #201738), var(--site-bg-tint));
    box-shadow:
      0 22px 56px -34px rgba(0, 0, 0, 0.9),
      0 0 0 1px rgba(255, 255, 255, 0.025) inset;
    overflow: hidden;
    transform: perspective(900px) rotateX(var(--tilt-x)) rotateY(var(--tilt-y));
    transition: transform 0.2s ease-out;
  }

  .trainer-card::before {
    content: '';
    position: absolute;
    inset: 8px;
    border: 1px solid color-mix(in srgb, var(--site-accent) 18%, transparent);
    border-radius: 11px;
    pointer-events: none;
    z-index: 1;
  }

  .tc-holo {
    position: absolute;
    inset: 0;
    pointer-events: none;
    background:
      radial-gradient(
        circle at var(--holo-x) var(--holo-y),
        color-mix(in srgb, var(--site-accent) 28%, transparent) 0%,
        transparent 42%
      ),
      linear-gradient(
        115deg,
        transparent 30%,
        color-mix(in srgb, var(--site-accent) 12%, transparent) 45%,
        transparent 60%
      );
    opacity: 0.28;
    mix-blend-mode: screen;
    z-index: 0;
  }

  .trainer-card.shiny-burst {
    animation: tc-pulse 0.45s ease-out;
  }

  @keyframes tc-pulse {
    0% { filter: brightness(1); }
    40% { filter: brightness(1.35) saturate(1.2); }
    100% { filter: brightness(1); }
  }

  .tc-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 20px;
    background:
      linear-gradient(90deg, color-mix(in srgb, var(--site-accent) 18%, transparent), transparent 55%),
      rgba(0, 0, 0, 0.22);
    border-bottom: 1px solid color-mix(in srgb, var(--site-accent) 22%, var(--site-line));
    font-family: var(--site-mono);
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    position: relative;
    z-index: 1;
  }

  .tc-bar-left { color: var(--site-accent); }
  .tc-bar-right { color: var(--site-dim); }

  .tc-body {
    display: grid;
    grid-template-columns: minmax(140px, 200px) 1fr;
    gap: clamp(16px, 3vw, 28px);
    padding: 24px;
    align-items: start;
    position: relative;
    z-index: 1;
  }

  .tc-main {
    min-height: 160px;
  }

  @media (max-width: 640px) {
    .tc-body { grid-template-columns: 1fr; }
  }

  .tc-portrait-col { display: flex; flex-direction: column; }

  .tc-photo {
    position: relative;
    border: 1px solid color-mix(in srgb, var(--site-accent) 20%, var(--site-line-strong));
    border-radius: 10px;
    background:
      linear-gradient(135deg, rgba(255, 255, 255, 0.08), transparent 38%),
      radial-gradient(circle at 50% 35%, color-mix(in srgb, var(--site-accent) 16%, transparent), transparent 70%);
    aspect-ratio: 1;
    overflow: hidden;
    padding: 0;
    cursor: pointer;
  }

  .tc-avatar {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .trainer-card.shiny-burst .tc-avatar {
    animation: tc-shimmer 0.9s ease-out;
    filter: saturate(1.35) hue-rotate(-8deg);
  }

  @keyframes tc-shimmer {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.04); }
  }

  .tc-shiny-flash {
    position: absolute;
    inset: auto 8px 8px;
    font-family: var(--site-mono);
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 1px;
    color: var(--site-accent-ink);
    background: var(--site-accent);
    padding: 4px 8px;
    border-radius: 999px;
    animation: tc-pop 0.5s ease-out;
  }

  @keyframes tc-pop {
    from { opacity: 0; transform: translateY(8px) scale(0.9); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }

  .tc-sparkles {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }

  .tc-spark {
    position: absolute;
    font-size: 14px;
    color: var(--site-accent);
    text-shadow: 0 0 8px var(--site-accent);
    animation: tc-spark-float 1.1s ease-out forwards;
    opacity: 0;
  }

  @keyframes tc-spark-float {
    0% { opacity: 0; transform: scale(0.6) translateY(10px); }
    25% { opacity: 1; }
    100% { opacity: 0; transform: scale(1.4) translateY(-32px) rotate(25deg); }
  }

  .tc-name {
    font-family: var(--site-mono);
    font-weight: 700;
    font-size: clamp(1.1rem, 2.5vw, 1.45rem);
    letter-spacing: -0.5px;
    margin: 0 0 4px;
    color: var(--site-fg);
  }

  .tc-title {
    font-family: var(--site-mono2);
    color: var(--site-accent);
    font-size: 13px;
    margin: 0 0 16px;
  }

  .tc-stats {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
    margin-bottom: 18px;
  }

  .tc-stat {
    border: 1px solid color-mix(in srgb, var(--site-accent) 14%, var(--site-line));
    border-radius: 6px;
    padding: 10px 8px;
    background: rgba(0, 0, 0, 0.16);
    text-align: center;
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.035);
  }

  .tc-stat .n {
    display: block;
    font-family: var(--site-mono);
    font-weight: 700;
    font-size: 1.25rem;
    color: color-mix(in srgb, var(--site-accent) 86%, white);
  }

  .tc-stat .l {
    display: block;
    font-family: var(--site-mono);
    font-size: 9px;
    letter-spacing: 1px;
    text-transform: uppercase;
    color: var(--site-dim);
    margin-top: 3px;
  }

  .tc-sub {
    font-family: var(--site-mono);
    font-size: 10px;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    color: var(--site-dim);
    margin: 0 0 8px;
  }

  .tc-sub.badges-heading {
    padding: 0 18px;
    margin-bottom: 12px;
  }

  .tc-types {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 14px;
  }

  .tc-type-plate {
    --type-a: var(--site-accent);
    --type-b: color-mix(in srgb, var(--site-accent) 55%, #000);
    --type-rim: color-mix(in srgb, var(--site-accent) 70%, #fff);
    --type-ink: #f7f4ff;
    position: relative;
    min-width: 64px;
    padding: 7px 12px 7px 14px;
    border: 1px solid color-mix(in srgb, var(--type-rim) 42%, transparent);
    border-radius: 4px;
    background:
      linear-gradient(90deg, var(--type-rim) 0 4px, transparent 4px),
      linear-gradient(180deg, rgba(255, 255, 255, 0.08), transparent 42%),
      linear-gradient(145deg, color-mix(in srgb, var(--type-a) 58%, #101018), var(--type-b));
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.18),
      inset 0 -2px 0 rgba(0, 0, 0, 0.18);
    clip-path: polygon(8px 0, 100% 0, calc(100% - 8px) 100%, 0 100%);
    transform: skewX(-8deg);
  }

  .tc-type-label {
    display: block;
    transform: skewX(8deg);
    font-family: var(--site-mono);
    text-transform: uppercase;
    letter-spacing: 0.8px;
    color: var(--type-ink);
    text-shadow: 0 1px 0 rgba(0, 0, 0, 0.35);
  }

  .tc-type-label {
    font-size: 10.5px;
    font-weight: 700;
    line-height: 1.1;
  }

  .tc-type-ml {
    --type-a: #6358c8;
    --type-b: #2b2755;
    --type-rim: #a79dff;
    --type-ink: #f0edff;
  }

  .tc-type-hpc {
    --type-a: #bd6a32;
    --type-b: #55301b;
    --type-rim: #ef9d64;
    --type-ink: #fff1e5;
  }

  .tc-type-research {
    --type-a: #2f8c64;
    --type-b: #183f30;
    --type-rim: #72d8a8;
    --type-ink: #eafff4;
  }

  .tc-type-maths {
    --type-a: #3c5da8;
    --type-b: #202f5a;
    --type-rim: #8ba6ee;
    --type-ink: #edf2ff;
  }

  .tc-type-reverse {
    --type-a: #6846a0;
    --type-b: #30214d;
    --type-rim: #ad86e6;
    --type-ink: #f6efff;
  }

  .tc-detail {
    position: relative;
    min-height: 170px;
    border: 1px solid color-mix(in srgb, var(--site-accent) 24%, var(--site-line));
    border-radius: 12px;
    padding: 14px 16px 14px 64px;
    background:
      linear-gradient(135deg, rgba(255, 255, 255, 0.055), transparent 38%),
      color-mix(in srgb, var(--site-panel-2) 60%, transparent);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);
    animation: tc-fade 0.2s ease-out;
  }

  .tc-detail-mark {
    position: absolute;
    left: 12px;
    top: 14px;
  }

  .tc-detail-copy {
    min-width: 0;
  }

  @keyframes tc-fade {
    from { opacity: 0; transform: translateX(8px); }
    to { opacity: 1; transform: translateX(0); }
  }

  .tc-back {
    border: 0;
    background: transparent;
    font-family: var(--site-mono);
    font-size: 11px;
    color: var(--site-dim);
    padding: 0;
    margin-bottom: 10px;
    cursor: pointer;
  }

  .tc-back:hover { color: var(--site-accent); }

  .tc-detail-slot {
    font-family: var(--site-mono);
    font-size: 10px;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    color: var(--site-dim);
    margin: 0 0 6px;
  }

  .tc-detail-title {
    font-family: var(--site-sans);
    font-size: 1.35rem;
    font-weight: 700;
    letter-spacing: -0.03em;
    margin: 0 0 6px;
    color: var(--site-fg);
  }

  .tc-detail-role {
    font-family: var(--site-mono);
    font-size: 13px;
    color: var(--site-accent);
    margin: 0 0 4px;
  }

  .tc-detail-period {
    font-family: var(--site-mono);
    font-size: 11px;
    color: var(--site-dim);
    margin: 0 0 12px;
  }

  .tc-detail-blurb {
    font-family: var(--site-mono2);
    font-size: 14px;
    line-height: 1.65;
    color: var(--site-fg-2);
    margin: 0 0 14px;
  }

  .tc-detail-link {
    font-family: var(--site-mono);
    font-size: 12px;
    font-weight: 700;
    color: var(--site-accent);
    text-decoration: none;
  }

  .tc-detail-link:hover { text-decoration: underline; }

  .tc-badges-wrap {
    padding: 12px 0 4px;
    position: relative;
    z-index: 1;
  }

  .tc-badge-track {
    display: flex;
    align-items: flex-end;
    justify-content: center;
    flex-wrap: wrap;
    gap: 2px 0;
    padding: 8px 14px 12px;
    background:
      linear-gradient(180deg, rgba(255, 255, 255, 0.02), transparent),
      color-mix(in srgb, var(--site-panel-2) 45%, transparent);
    border-top: 1px solid var(--site-line);
    border-bottom: 1px solid var(--site-line);
  }

  .tc-track-connector {
    width: 18px;
    height: 3px;
    margin-bottom: 34px;
    background:
      linear-gradient(90deg, transparent, var(--site-accent) 18%, color-mix(in srgb, var(--site-accent) 45%, transparent));
    border-radius: 999px;
    flex: none;
    opacity: 0.85;
  }

  .tc-track-gap {
    width: 14px;
    height: 3px;
    margin: 0 8px 34px;
    background: repeating-linear-gradient(
      90deg,
      var(--site-line-strong) 0 5px,
      transparent 5px 10px
    );
    flex: none;
  }

  .tc-gym-badge {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    width: 64px;
    padding: 0;
    border: 0;
    background: transparent;
    cursor: pointer;
    flex: none;
    transition: transform 0.15s ease;
  }

  .tc-gym-label,
  .tc-gym-slot {
    font-family: var(--site-mono);
    font-size: 8px;
    letter-spacing: 0.9px;
    text-transform: uppercase;
    color: var(--site-dim);
    max-width: 64px;
    text-align: center;
    line-height: 1.2;
  }

  .tc-gym-badge:hover,
  .tc-gym-badge.active {
    transform: translateY(-3px);
  }

  .tc-gym-badge.active .tc-gym-label {
    color: var(--site-accent);
    text-shadow: 0 0 12px color-mix(in srgb, var(--site-accent) 45%, transparent);
  }

  .tc-gym-badge.locked {
    cursor: default;
  }

  .tc-footer {
    border-top: 1px dashed var(--site-line-strong);
    position: relative;
    z-index: 1;
  }

  .tc-id {
    width: 100%;
    border: 0;
    background: transparent;
    font-family: var(--site-mono);
    font-size: 10px;
    color: var(--site-dim);
    letter-spacing: 1px;
    text-align: center;
    padding: 12px 16px;
    cursor: pointer;
    transition: color 0.15s;
  }

  .tc-id:hover { color: var(--site-accent); }

  @media (prefers-reduced-motion: reduce) {
    .trainer-card { transform: none; transition: none; }
    .tc-spark,
    .trainer-card.shiny-burst .tc-avatar,
    .tc-shiny-flash,
    .tc-detail { animation: none; }
    .tc-gym-badge:hover,
    .tc-gym-badge.active { transform: none; }
  }
</style>
