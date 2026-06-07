<script lang="ts">
import { experience as experienceStore } from '$lib/stores/portfolio'
import { get } from 'svelte/store'
import BrandImage from '$lib/components/ui/BrandImage.svelte'
import { reveal } from '$lib/actions/reveal'
import ProjectDexPage from './projects/+page.svelte'

  type PortfolioView = 'experience' | 'dex'
  let activeView = $state<PortfolioView>('experience')

  const allExperience = get(experienceStore)

  function companyTenure(durations: string[]): string {
    if (!durations.length) return ''
    if (durations.length === 1) return durations[0]
    return `${durations[durations.length - 1].split('-')[0].trim()} - ${durations[0].includes('Current') ? 'Current' : durations[0].split('-').at(-1)?.trim()}`
  }
</script>

<svelte:head>
  <title>Portfolio | saikumarmk.com</title>
</svelte:head>

<div class="portfolio-page site-editorial-page">
  <div class="wrap py-20">
    <div class="text-center mb-12" use:reveal={{ direction: 'up', duration: 600 }}>
      <p class="portfolio-eyebrow mb-3">portfolio</p>
      <h1 class="text-5xl font-bold mb-4">Experience & projects</h1>
      <p class="text-lg opacity-70 mb-8">Experience, projects, and skills</p>

      <div class="join">
        <button
          class="btn join-item gap-2"
          class:btn-primary={activeView === 'experience'}
          class:btn-ghost={activeView !== 'experience'}
          onclick={() => (activeView = 'experience')}
        >
          <span class="i-heroicons-outline-clock w-5 h-5"></span>
          Experience
        </button>
        <button
          class="btn join-item gap-2"
          class:btn-primary={activeView === 'dex'}
          class:btn-ghost={activeView !== 'dex'}
          onclick={() => (activeView = 'dex')}
        >
          <span class="i-heroicons-outline-squares-2x2 w-5 h-5"></span>
          Project Dex
        </button>
      </div>
    </div>

    {#if activeView === 'experience'}
    <div class="experience-list">
      {#each allExperience as company, idx}
        <section class="xp-company" use:reveal={{ direction: 'up', delay: idx * 70, duration: 500 }}>
          <div class="xp-head">
            <BrandImage src={company.img} alt={company.company} class="xp-logo" fallbackText={company.company} />
            <div>
              <h2>{company.company}</h2>
              <p>{company.tags.join(' / ')} · {companyTenure(company.positions.map(position => position.duration))}</p>
            </div>
          </div>
          <div class="xp-roles">
            {#each company.positions as position}
              <article class="xp-role">
                <div class="xp-role-top">
                  <h3>{position.position}</h3>
                  <time>{position.duration}</time>
                </div>
                {#if position.listItems?.length}
                  <ul>
                    {#each position.listItems as item}
                      <li>{item}</li>
                    {/each}
                  </ul>
                {:else if position.description}
                  <p>{position.description}</p>
                {/if}
                <div class="xp-links">
                  {#each position.badges ?? [] as badge}
                    <span>{badge}</span>
                  {/each}
                  {#each position.buttons ?? [] as button}
                    <a href={button.href} target="_blank" rel="noopener noreferrer">{button.label} ↗</a>
                  {/each}
                </div>
              </article>
            {/each}
          </div>
        </section>
      {/each}
      </div>
    {:else}
      <div class="dex-shell">
        <ProjectDexPage />
      </div>
    {/if}
  </div>
</div>

<style>
  .portfolio-page {
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

  .wrap {
    max-width: 1180px;
    margin: 0 auto;
    padding-inline: clamp(20px, 5vw, 84px);
  }

  :global(.portfolio-page .btn-primary) {
    background: var(--accent);
    border-color: var(--accent);
    color: var(--accent-ink);
  }

  :global(.portfolio-page .btn-ghost) {
    color: var(--muted);
  }

  .portfolio-eyebrow {
    color: var(--accent);
    font-family: var(--mono);
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.25em;
    text-transform: uppercase;
  }

  .portfolio-page h1 {
    font-family: var(--sans);
    letter-spacing: -0.04em;
  }

  .experience-list {
    display: flex;
    flex-direction: column;
    gap: 40px;
  }

  .xp-head {
    display: flex;
    align-items: center;
    gap: 14px;
    margin-bottom: 16px;
  }

  :global(.xp-logo) {
    width: 46px;
    height: 46px;
    flex: none;
    border-radius: 999px;
    border: 1px solid var(--line-strong);
    background: var(--panel-2);
    object-fit: cover;
  }

  .xp-head h2 {
    font-family: var(--mono);
    font-size: 19px;
    font-weight: 700;
    color: var(--fg);
  }

  .xp-head p {
    color: var(--dim);
    font-size: 13px;
  }

  .xp-roles {
    border-left: 1px solid var(--line);
    margin-left: 23px;
    padding-left: 30px;
    display: flex;
    flex-direction: column;
    gap: 22px;
  }

  .xp-role {
    position: relative;
  }

  .xp-role::before {
    content: "";
    position: absolute;
    left: -34.5px;
    top: 6px;
    width: 9px;
    height: 9px;
    border-radius: 50%;
    background: var(--accent);
    box-shadow: 0 0 0 4px var(--bg);
  }

  .xp-role-top {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 16px;
    flex-wrap: wrap;
  }

  .xp-role h3 {
    font-family: var(--mono);
    font-size: 15.5px;
    font-weight: 700;
    color: var(--fg);
  }

  .xp-role time {
    color: var(--dim);
    font-size: 12.5px;
    white-space: nowrap;
  }

  .xp-role ul {
    list-style: none;
    margin: 10px 0 0;
    display: flex;
    flex-direction: column;
    gap: 7px;
  }

  .xp-role li,
  .xp-role p {
    color: var(--fg-2);
    font-size: 14px;
    line-height: 1.6;
    max-width: 70ch;
  }

  .xp-role li {
    position: relative;
    padding-left: 20px;
  }

  .xp-role li::before {
    content: "›";
    position: absolute;
    left: 2px;
    color: var(--accent);
    font-weight: 700;
  }

  .xp-links {
    display: flex;
    flex-wrap: wrap;
    gap: 10px 14px;
    margin-top: 12px;
    align-items: center;
  }

  .xp-links span {
    border: 1px solid var(--line-strong);
    border-radius: 999px;
    color: var(--muted);
    font-family: var(--mono);
    font-size: 11px;
    padding: 2px 9px;
  }

  .xp-links a {
    color: var(--muted);
    border-bottom: 1px solid var(--line-strong);
    font-family: var(--mono);
    font-size: 12.5px;
    transition: color .15s, border-color .15s;
  }

  .xp-links a:hover {
    color: var(--accent);
    border-color: var(--accent);
  }

  .dex-shell {
    --p: inherit;
    --pc: inherit;
    --b1: inherit;
    --b2: inherit;
    --b3: inherit;
    --bc: inherit;
    --er: 0 74% 58%;
  }

  :global(.dex-shell .pokedex-container) {
    min-height: auto;
    padding-top: 3rem;
    padding-bottom: 0;
  }
</style>
