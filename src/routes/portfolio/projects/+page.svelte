<script lang="ts">
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import { projects } from '$lib/config/portfolio';
  import TechBadge from '$lib/components/projects/TechBadge.svelte';
  import { getTechColors } from '$lib/config/tech-colors';
  import Head from '$lib/components/head.svelte';
  import { title as storedTitle } from '$lib/stores/title';

  storedTitle.set('Projects');

  // Category/subtitle for each project
  const categoryMap: Record<string, string> = {
    'pokered-tournament': 'Tournament Simulator',
    'monash-handbook-scraper': 'Web Scraper',
    'unit-dashboard': 'Data Visualization',
    'vicroads-transport-api': 'API Wrapper',
    'tungsten': 'Math Library',
    'neochomp': 'LED Matrix Renderer',
    'maidenless': 'AI Text Generator',
    'uwucode': 'Programming Language',
    'setools': 'Data Visualization',
    'voltchip': 'Web Emulator',
    'acmonaghan': 'CV Website',
    'mini-melbourne-3d': '3D Transport Viz',
    'skirtor': 'Astrophysics Viz',
    'monash-handbook-plus': 'University Handbook Tool',
    'saikumarmk-website': 'Personal Website'
  };

  let selectedProject: string | null = null;
  let currentDescriptionPage = 0;
  let displayedText = '';
  let fullText = '';
  let isTyping = false;
  let typingInterval: NodeJS.Timeout | null = null;

  // Split description into pages (by sentences)
  function getDescriptionPages(description: string): string[] {
    // Split by periods, but keep the period with the sentence
    const sentences = description.match(/[^.!?]+[.!?]+/g) || [description];
    
    // Group sentences into pages of 2-3 sentences each
    const pages: string[] = [];
    for (let i = 0; i < sentences.length; i += 2) {
      const page = sentences.slice(i, i + 2).join(' ').trim();
      if (page) pages.push(page);
    }
    
    return pages.length > 0 ? pages : [description];
  }

  // Typing effect
  function startTyping(text: string) {
    // Clear any existing typing animation
    if (typingInterval) {
      clearInterval(typingInterval);
    }
    
    fullText = text;
    displayedText = '';
    isTyping = true;
    
    let index = 0;
    const speed = 30; // milliseconds per character
    
    typingInterval = setInterval(() => {
      if (index < fullText.length) {
        displayedText = fullText.slice(0, index + 1);
        index++;
      } else {
        isTyping = false;
        if (typingInterval) {
          clearInterval(typingInterval);
          typingInterval = null;
        }
      }
    }, speed);
  }

  // Reset page when changing projects
  $: if (selectedProject) {
    currentDescriptionPage = 0;
    const project = projects.find(p => p.id === selectedProject);
    if (project) {
      const pages = getDescriptionPages(project.description || '');
      startTyping(pages[0]);
    }
  }

  // Handle Escape key to close modal
  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape' && selectedProject) {
      selectedProject = null;
      if (typingInterval) {
        clearInterval(typingInterval);
        typingInterval = null;
      }
    }
  }

  // Cleanup when modal closes
  $: if (!selectedProject && typingInterval) {
    clearInterval(typingInterval);
    typingInterval = null;
    isTyping = false;
  }

  function nextPage() {
    currentDescriptionPage++;
    const project = projects.find(p => p.id === selectedProject);
    if (project) {
      const pages = getDescriptionPages(project.description || '');
      startTyping(pages[currentDescriptionPage]);
    }
  }

  // Prevent body scroll when modal is open
  $: if (browser) {
    if (selectedProject) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }

  onMount(() => {
    window.addEventListener('keydown', handleKeydown);
    return () => {
      window.removeEventListener('keydown', handleKeydown);
      document.body.style.overflow = '';
    };
  });

</script>

<Head />

<svelte:head>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous">
  <link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap" rel="stylesheet">
</svelte:head>

<div class="pokedex-container">
  <!-- Header -->
  <div class="pokedex-header">
    <h1 class="pokedex-title">PROJECT DEX</h1>
    <p class="pokedex-subtitle">Select a project to view details</p>
    
    <!-- Navigation -->
    <div class="flex justify-center gap-2 flex-wrap mt-6">
      <a href="/portfolio" class="btn btn-secondary gap-2">
        <span class="i-heroicons-outline-clock w-5 h-5"></span>
        Timeline
      </a>
      <a href="/portfolio/list" class="btn btn-ghost gap-2">
        <span class="i-heroicons-outline-list-bullet w-5 h-5"></span>
        List View
      </a>
    </div>
  </div>

  <!-- Grid of project squares (always visible) -->
  <div class="pokedex-grid">
    {#each projects as project, idx}
        <button
          class="pokedex-square"
          class:selected={selectedProject === project.id}
          on:click={() => selectedProject = selectedProject === project.id ? null : project.id}
          aria-label="View {project.name}">
          <div class="square-id">
            {String(idx + 1).padStart(3, '0')}
          </div>
          <div class="square-sprite">
            <img src={project.img} alt={project.name} class="project-sprite" />
          </div>
        </button>
    {/each}
  </div>
</div>

<!-- Modal Overlay (Pokedex popup) -->
{#if selectedProject}
  {@const project = projects.find(p => p.id === selectedProject)}
  {#if project}
    {@const idx = projects.findIndex(p => p.id === selectedProject)}
    {@const pages = getDescriptionPages(project.description || '')}
    {@const isLastPage = currentDescriptionPage >= pages.length - 1}
    <div 
      class="modal-overlay" 
      on:click={() => selectedProject = null}
      on:keydown={(e) => e.key === 'Enter' && (selectedProject = null)}
      role="button"
      tabindex="0"
      aria-label="Close modal">
      <div 
        class="pokedex-modal" 
        on:click|stopPropagation
        on:keydown|stopPropagation
        role="dialog"
        aria-modal="true">
        <!-- Close button -->
        <button class="close-button" on:click={() => selectedProject = null} aria-label="Close">
          ✕
        </button>

        <div class="modal-content">
          <div class="details-grid">
            <!-- Left: Project Logo -->
            <div class="sprite-container">
              <img src={project.img} alt={project.name} class="project-logo" />
            </div>

            <!-- Right: Project Info -->
            <div class="info-container">
              <!-- Title Card -->
              <div class="title-card">
                <div class="title-name">
                  <span class="title-number">{String(idx + 1).padStart(3, '0')}</span>
                  <span class="title-text">{project.name}</span>
                </div>
                <div class="title-divider"></div>
                <div class="title-category">
                  {categoryMap[project.id] || 'Project'}
                </div>
              </div>

            <!-- Tech Stack -->
            <div class="tech-stack">
              <h3 class="stack-label">TECH STACK</h3>
              <div class="badges-grid">
                {#each project.badges || [] as badge}
                  <TechBadge name={badge} colors={getTechColors(badge)} />
                {/each}
              </div>
            </div>
            </div>
          </div>

          <!-- Description Box -->
          <div class="description-frame">
            <div class="frame-border-left"></div>
            <div class="frame-content">
              <p class="description-text">{displayedText}</p>
              
              {#if isLastPage}
                <!-- Show buttons on last page -->
                <div class="project-buttons">
                  {#if project.link}
                    <a href={project.link} target="_blank" rel="noopener noreferrer" class="project-link">
                      <span class="i-heroicons-outline-arrow-top-right-on-square w-5 h-5"></span>
                      GitHub
                    </a>
                  {/if}
                  {#if project.buttons}
                    {#each project.buttons as button}
                      <a href={button.href} target="_blank" rel="noopener noreferrer" class="project-link project-link-secondary">
                        <span class="i-heroicons-outline-arrow-top-right-on-square w-5 h-5"></span>
                        {button.label}
                      </a>
                    {/each}
                  {/if}
                </div>
              {/if}
            </div>
            <div class="frame-border-right">
              <!-- Floating arrow on right side (only show if not last page and not typing) -->
              {#if !isLastPage && !isTyping}
                <button class="side-arrow-container" on:click={nextPage} aria-label="Next page">
                  <div class="floating-arrow">
                    <svg width="12" height="9" viewBox="0 0 12 9" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect width="12" height="1" fill="white"/>
                      <rect y="1" width="1" height="1" fill="white"/>
                      <rect x="11" y="1" width="1" height="1" fill="white"/>
                      <rect y="2" width="1" height="1" fill="white"/>
                      <rect x="11" y="2" width="1" height="1" fill="white"/>
                      <rect x="1" y="3" width="1" height="1" fill="white"/>
                      <rect x="10" y="3" width="1" height="1" fill="white"/>
                      <rect x="2" y="4" width="1" height="1" fill="white"/>
                      <rect x="9" y="4" width="1" height="1" fill="white"/>
                      <rect x="3" y="5" width="1" height="1" fill="white"/>
                      <rect x="8" y="5" width="1" height="1" fill="white"/>
                      <rect x="4" y="6" width="1" height="1" fill="white"/>
                      <rect x="7" y="6" width="1" height="1" fill="white"/>
                      <rect x="5" y="7" width="2" height="1" fill="white"/>
                      <rect x="6" y="8" width="1" height="1" fill="white"/>
                    </svg>
                  </div>
                </button>
              {/if}
            </div>
          </div>
        </div>
      </div>
    </div>
  {/if}
{/if}

<style>
  .pokedex-container {
    min-height: 100vh;
    padding: 8rem 2rem;
    max-width: 1400px;
    margin: 0 auto;
  }

  .pokedex-header {
    text-align: center;
    margin-bottom: 4rem;
  }

  .pokedex-title {
    font-family: 'Press Start 2P', monospace;
    font-size: 3rem;
    color: var(--p);
    text-shadow: 4px 4px 0 rgba(0, 0, 0, 0.2);
    margin-bottom: 1rem;
  }

  .pokedex-subtitle {
    font-family: 'Press Start 2P', monospace;
    font-size: 0.875rem;
    opacity: 0.7;
  }

  @media (max-width: 768px) {
    .pokedex-title {
      font-family: 'pokemondppt', monospace;
      font-size: 1.75rem;
    }

    .pokedex-subtitle {
      font-family: 'pokemondppt', monospace;
      font-size: 0.875rem;
    }

    .pokedex-header {
      margin-bottom: 2rem;
    }
  }

  /* Grid Layout */
  .pokedex-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 1rem;
    margin-top: 3rem;
  }

  .pokedex-square {
    aspect-ratio: 1;
    background: var(--b2);
    border: 3px solid transparent;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
    display: grid;
    grid-template-rows: 1fr 2fr;
    padding-bottom: 1rem;
  }

  .pokedex-square:hover {
    border-color: hsl(var(--er) / 0.5);
    transform: translateY(-4px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  }

  .pokedex-square.selected {
    border-color: hsl(var(--er));
    background: var(--b3);
    box-shadow: 0 0 20px hsl(var(--er) / 0.5);
  }

  .square-id {
    font-family: 'Press Start 2P', monospace;
    font-size: 1.25rem;
    color: var(--bc);
    opacity: 0.5;
    display: flex;
    justify-content: flex-end;
    padding: 0.75rem;
  }

  @media (max-width: 768px) {
    .square-id {
      font-family: 'pokemondppt', monospace;
      font-size: 1rem;
    }
  }

  .square-sprite {
    display: flex;
    justify-content: center;
    align-items: center;
    padding-left: 1rem;
  }

  .project-sprite {
    width: 80px;
    height: 80px;
    object-fit: contain;
    image-rendering: auto;
  }

  /* Modal Overlay */
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(4px);
    z-index: 1000;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 2rem;
    animation: fadeIn 0.2s ease-out;
    overflow-y: auto;
  }

  @media (max-width: 768px) {
    .modal-overlay {
      padding: 1rem;
      align-items: flex-start;
      padding-top: 2rem;
    }
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  .pokedex-modal {
    background: transparent;
    border: none;
    border-radius: 16px;
    max-width: 1200px;
    width: 100%;
    max-height: none;
    overflow: visible;
    position: relative;
    animation: slideUp 0.3s ease-out;
  }

  @keyframes slideUp {
    from {
      transform: translateY(100px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  .close-button {
    position: absolute;
    top: 1.5rem;
    right: 1.5rem;
    width: 48px;
    height: 48px;
    background: hsl(var(--er));
    color: white;
    border: 2px solid white;
    border-radius: 8px;
    font-size: 1.25rem;
    line-height: 1;
    cursor: pointer;
    z-index: 10;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
    font-family: Arial, sans-serif;
    font-weight: bold;
    padding: 0;
  }

  .close-button:hover {
    background: hsl(var(--er) / 0.8);
    transform: scale(1.05);
  }

  .modal-content {
    padding: 3rem;
    background: #f8f8f8;
    background-size: 40px 40px;
    background-position: 0 0;
    background-image:
      linear-gradient(to right, #d8d8d8 1px, transparent 1px),
      linear-gradient(to bottom, #d8d8d8 1px, transparent 1px);
    border: 4px solid #333;
    border-radius: 16px;
    box-shadow: 8px 8px 0 rgba(0, 0, 0, 0.2);
  }

  @media (max-width: 768px) {
    /* Switch to pokemondppt font on mobile to prevent overflow */
    .title-name {
      font-family: 'pokemondppt', monospace;
      flex-direction: column;
      align-items: flex-start;
      gap: 0.5rem;
      padding: 1rem;
    }

    .title-text {
      font-size: 1.125rem;
    }

    .title-number {
      font-size: 1rem;
    }

    .title-category {
      font-family: 'pokemondppt', monospace;
      font-size: 0.875rem;
      padding: 0.75rem 1rem;
    }

    .stack-label {
      font-family: 'pokemondppt', monospace;
      font-size: 0.75rem;
    }

    .modal-content {
      padding: 1.5rem 1rem;
    }

    .close-button {
      width: 40px;
      height: 40px;
      font-size: 1.25rem;
    }

    .description-text {
      font-size: 0.875rem;
      line-height: 1.6;
      min-height: 120px;
    }

    .sprite-container {
      padding: 2rem;
    }

    .project-logo {
      max-height: 150px;
    }

    .project-link {
      font-size: 1rem;
      padding: 0.5rem 0.75rem;
    }

    .project-buttons {
      flex-direction: column;
      gap: 0.5rem;
    }

    .project-link {
      width: 100%;
      justify-content: center;
    }

    .frame-content {
      padding: 1.5rem;
    }
  }

  .details-grid {
    display: grid;
    grid-template-columns: 1fr 2fr;
    gap: 3rem;
    margin-bottom: 3rem;
  }

  @media (max-width: 768px) {
    .details-grid {
      grid-template-columns: 1fr;
      gap: 2rem;
    }
  }

  .sprite-container {
    display: flex;
    justify-content: center;
    align-items: center;
    background: white;
    border-radius: 16px;
    padding: 3rem;
    padding-left: 4rem;
    border: 3px solid #333;
    box-shadow: 4px 4px 0 rgba(0, 0, 0, 0.1);
  }

  .project-logo {
    max-width: 100%;
    max-height: 200px;
    object-fit: contain;
  }

  /* Title Card */
  .title-card {
    background: white;
    border: 2px solid #333;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 8px 8px 0 rgba(0, 0, 0, 0.2);
    margin-bottom: 2rem;
  }

  .title-name {
    background: hsl(var(--er));
    color: white;
    padding: 1.5rem;
    display: flex;
    align-items: center;
    gap: 2rem;
    font-family: 'Press Start 2P', monospace;
    text-shadow: 2px 2px 0 rgba(0, 0, 0, 0.3);
  }

  .title-number {
    font-size: 1.5rem;
  }

  .title-text {
    font-size: 1.75rem;
    text-transform: uppercase;
  }

  .title-divider {
    height: 4px;
    background: hsl(var(--er) / 0.7);
  }

  .title-category {
    background: white;
    color: #333;
    padding: 1rem 1.5rem;
    text-align: right;
    font-family: 'Press Start 2P', monospace;
    font-size: 1.125rem;
    text-shadow: 1px 1px 0 rgba(0, 0, 0, 0.1);
  }

  /* Tech Stack */
  .tech-stack {
    margin-top: 2rem;
  }

  .stack-label {
    font-family: 'Press Start 2P', monospace;
    font-size: 0.875rem;
    margin-bottom: 1rem;
    color: var(--bc);
    opacity: 0.7;
  }

  .badges-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  /* Description Frame */
  .description-frame {
    display: grid;
    grid-template-columns: 16px 1fr 16px;
    background: white;
    border: 3px solid #333;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 4px 4px 0 rgba(0, 0, 0, 0.1);
    margin-top: 2rem;
  }

  .frame-border-left,
  .frame-border-right {
    background: hsl(var(--er));
    min-height: 160px;
  }

  .frame-border-left {
    border-right: 1px solid hsl(var(--er) / 0.8);
  }

  .frame-border-right {
    border-left: 1px solid hsl(var(--er) / 0.8);
    position: relative;
    display: flex;
    flex-direction: column-reverse;
    align-items: center;
    padding-bottom: 1rem;
  }

  .side-arrow-container {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 0.25rem;
    background: transparent;
    border: none;
    cursor: pointer;
  }

  .floating-arrow {
    animation: float 1.5s ease-in-out infinite;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  @keyframes float {
    0% { transform: translateY(0); }
    50% { transform: translateY(4px); }
    100% { transform: translateY(0); }
  }

  .arrow-container {
    display: none;
  }

  .frame-content {
    background: #fafafa;
    padding: 2rem;
    color: #333;
  }

  .description-text {
    font-family: 'pokemondppt', monospace;
    font-size: 1.5rem;
    line-height: 2;
    margin-bottom: 1.5rem;
    color: #333;
    word-wrap: break-word;
    overflow-wrap: break-word;
    min-height: 180px;
  }

  .project-buttons {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
  }

  .project-link {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    font-family: 'pokemondppt', monospace;
    font-size: 1.5rem;
    color: white;
    background: hsl(var(--er));
    text-decoration: none;
    padding: 0.5rem 1rem;
    border: 2px solid hsl(var(--er));
    border-radius: 4px;
    transition: all 0.2s;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .project-link:hover {
    background: hsl(var(--er) / 0.9);
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }

  .project-link-secondary {
    background: hsl(var(--p));
    border-color: hsl(var(--p));
  }

  .project-link-secondary:hover {
    background: hsl(var(--p) / 0.9);
  }
</style>
