<script lang="ts">
  import { onMount } from 'svelte'
  import AsciiParticles from '$lib/components/pretext/AsciiParticles.svelte'
  import TrainerCard from '$lib/components/about/TrainerCard.svelte'
  import { reveal } from '$lib/actions/reveal'
  import { assets } from '$lib/config/assets'
  let { data }: { data: { res?: Urara.Post[] } } = $props()
  let allPosts = $derived((data.res ?? []).filter(post => !post.flags?.includes('unlisted')))
  let postCount = $derived(allPosts.length)

  let currentSection = $state(0)
  let mounted = $state(false)
  let mouseX = $state(0)
  let mouseY = $state(0)

  const sections = [
    { id: 'hero', label: 'Intro', icon: 'i-heroicons-outline-user' },
    { id: 'research', label: 'Research', icon: 'i-heroicons-outline-beaker' },
    { id: 'advice', label: 'Advice', icon: 'i-heroicons-outline-light-bulb' },
    { id: 'contact', label: 'Contact', icon: 'i-heroicons-outline-chat-bubble-left-right' }
  ]

  let mouseRaf = 0
  let pendingMouse: { x: number; y: number } | null = null

  function handleMouseMove(e: MouseEvent) {
    pendingMouse = { x: e.clientX, y: e.clientY }
    if (mouseRaf) return
    mouseRaf = requestAnimationFrame(() => {
      mouseRaf = 0
      if (pendingMouse) {
        mouseX = pendingMouse.x
        mouseY = pendingMouse.y
        pendingMouse = null
      }
    })
  }

  function scrollToSection(index: number) {
    const section = document.getElementById(sections[index].id)
    section?.scrollIntoView({ behavior: 'smooth' })
  }

  onMount(() => {
    mounted = true

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const index = sections.findIndex(s => s.id === entry.target.id)
          if (index !== -1) currentSection = index
        }
      })
    }, { threshold: 0.5 })

    sections.forEach(section => {
      const el = document.getElementById(section.id)
      if (el) observer.observe(el)
    })

    return () => {
      observer.disconnect()
      if (mouseRaf) cancelAnimationFrame(mouseRaf)
    }
  })
</script>

<svelte:head>
  <title>About Me | saikumarmk.com</title>
</svelte:head>

<svelte:window onmousemove={handleMouseMove} />

<div class="about-page site-editorial-page flex relative">
  <div class="hidden lg:flex lg:w-1/2 lg:fixed lg:left-0 lg:top-0 lg:h-screen relative items-center justify-center overflow-hidden">
    <div class="absolute inset-0 bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10"></div>

    <div class="absolute inset-0 opacity-10 ascii-grid"
      style="
        background-image:
          linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px);
        background-size: 50px 50px;
      "
    ></div>

    {#if mounted}
      <div class="absolute inset-0 z-10">
        <AsciiParticles {mouseX} {mouseY} />
      </div>
    {/if}
  </div>

  <div class="w-full lg:w-1/2 lg:ml-auto relative">
    <div class="sticky top-[4.125rem] z-30 border-b about-sticky-nav">
      <div class="flex justify-center gap-2 p-4">
        {#each sections as section, i}
          <button
            onclick={() => scrollToSection(i)}
            class="btn btn-sm btn-circle transition-all duration-300"
            class:btn-primary={currentSection === i}
            class:btn-ghost={currentSection !== i}
            class:scale-110={currentSection === i}
            title={section.label}>
            <span class="{section.icon} w-4 h-4"></span>
          </button>
        {/each}
      </div>
    </div>

    <section id="hero" class="py-12 lg:py-16 px-6 lg:px-12">
      <div use:reveal={{ direction: 'right', duration: 700 }}>
        <h1 class="text-4xl lg:text-5xl font-bold mb-4">
          Hi, I'm <span class="text-primary">Sai</span>
        </h1>
        <p class="text-lg lg:text-xl opacity-80 mb-4">
          Machine Learning Engineer working on generative AI at Canva
        </p>

        <div class="prose max-w-none mb-6 opacity-85">
          <p>
            I'm a graduate from Monash University, having completed my honours year in Applied Data Science, with my thesis on
            "Bias Modelling Mitigation in Diffusion Models". I was also the former president of the Monash Association of Coding (MAC),
            where we saw record growth to over 1000 members, more significant flagship events such as our Tech Careers Evening and MACathon,
            mock interviews, and more frequent events.
          </p>
          <p>
            Separate from my university experience, I also interned at Canva, a beginner-friendly web design company. I'll be returning
            there as a Machine Learning Engineer (MLE), focusing on generative AI in text-to-image models such as Stable Diffusion, Imagen,
            Midjourney, and so on. My interests lie in the intersection of natural language processing and computer vision, specifically in
            the form of diffusion-based text-to-image models, which my thesis is based on; however, I am interested in all areas of machine learning.
          </p>
          <p>
            If you have any questions about my experiences at Canva or want to explore my personal projects and blog pieces, feel free to reach out.
            You can contact me via email (linked in my resume), on LinkedIn using my full name, or find me on Discord at Theorvolt.
            Also, remember to check out my GitHub. Happy reading!
          </p>
        </div>

        <div class="flex gap-3 flex-wrap items-center">
          <a href={assets.resume} class="btn btn-primary gap-2">
            <span class="i-heroicons-outline-document-text w-5 h-5"></span>
            Résumé
          </a>
          <a href="https://github.com/saikumarmk" target="_blank" class="btn btn-outline gap-2">
            <span class="i-heroicons-outline-code-bracket w-5 h-5"></span>
            GitHub
          </a>
          <a href="/playbook" class="btn btn-outline gap-2">
            <span class="i-heroicons-outline-book-open w-5 h-5"></span>
            My Guide
          </a>
        </div>
      </div>
    </section>

    <section id="research" class="py-12 lg:py-16 px-6 lg:px-12 about-panel">
      <div use:reveal={{ direction: 'up', duration: 700 }}>
        <div class="flex items-center gap-3 mb-4">
          <span class="i-heroicons-outline-beaker w-8 h-8 text-primary"></span>
          <h2 class="text-3xl font-bold">On Industry Research</h2>
        </div>

        <div class="prose max-w-none">
          <p>
            Over the summer of 2023, I had the unique opportunity of doing a Machine Learning Engineering internship at Canva.
            The project involved researching AI safety techniques for AI image generation, and unlike an ordinary project,
            my objective was to present my findings by the end of the internship. My project was more akin to industrial research
            and development (R&D), as there was no signposting for my project, only the discoveries I made. Industry research roles
            fall under titles like Applied Scientist, Machine Learning Engineer, or Research Engineer. Industry research deviates from
            research in Academia, as you'll ultimately be researching techniques and results that contribute towards a product;
            in the case of Canva, an online design platform, it would be relating to image generation, or more generally; to design.
          </p>
          <p>
            Adobe is in a similar space, where they employ research engineers and applied scientists, who work on applications such as
            Adobe Firefly (a generative AI application relating to photo editing and generation). In general terms, an Applied Scientist
            works on researching, experimenting, and presenting proof of concept ideas, and if given the go-ahead, a Machine Learning
            Engineer will then work to productionise that idea. A Research engineer will do some amount of experimental and production work.
          </p>
          <p>
            Openings for these roles are scarce, with very few openings for undergraduates as they look to hire Masters by Research or
            PhD students who have either a catalogue of published work or expertise on a topic that won't be found in any undergraduate
            curriculum. An honours year is a great start for these roles, as you'll be synthesising a piece on a topic you'd have
            researched and experimented with.
          </p>
          <p>
            In academia, you have more control of the research topic, while the driving force of industrial R&D is that somewhere down
            the line, the decision to invest in research yields a profit. There is still an aspect of freedom in what you're able to research,
            but with the expectation that you produce novel results that can be turned into a product. Some other examples of industrial
            research include Google's DeepMind, which has developed some of its large-scale AI but has considerable research output,
            and OpenAI, whose premise involves rapid deployment of discoveries across text, image, audio, and so on.
          </p>
        </div>
      </div>
    </section>

    <section id="advice" class="py-12 lg:py-16 px-6 lg:px-12">
      <div use:reveal={{ direction: 'up', duration: 700 }}>
        <div class="flex items-center gap-3 mb-4">
          <span class="i-heroicons-outline-light-bulb w-8 h-8 text-primary"></span>
          <h2 class="text-3xl font-bold">My Advice to New Students</h2>
        </div>

        <div class="prose max-w-none">
          <p>
            Compared to high school, your actions have much more weight and are more noticeable. If you want to make the most of
            university, attend events outside of classes, and don't focus exclusively on your grades, you gain little if you spend
            all your time on it. Student clubs and teams are the highlight of university, you can learn much from everyone around you.
            I got introduced to my former club by talking to the former president about resumes, and the effect of having a more
            experienced community to look over your shoulders and guide you is immense, so make many friends.
          </p>
          <p>
            When it comes to opportunities, whether they're internships, graduate roles, or research experiences, be proactive,
            if you're hesitant about applying somewhere, just do it, and do it early, and work alongside your peers to help each other
            with these opportunities. Even if you don't feel you'd get selected for an opportunity, the practice and experience gained
            from applying are invaluable and help for future applications.
          </p>
          <p>
            Additionally, use university courses not to make yourself more employable, but to study courses that are intellectually
            stimulating or interesting for you; you have a lot of time outside of class to develop yourself as a candidate. But most
            importantly, don't rush university, you'll have time to learn more about what you want to do with the countless opportunities
            presented.
          </p>
        </div>

        <div class="mt-6 alert alert-success">
          <span class="i-heroicons-outline-book-open w-6 h-6"></span>
          <div>
            <h3 class="font-bold">Want more detailed advice?</h3>
            <p class="text-sm">
              Check out my <a href="/playbook" class="link link-primary font-semibold">Grad/Intern Playbook</a>
              for comprehensive guidance on landing your first tech role.
            </p>
          </div>
        </div>
      </div>
    </section>

    <section id="contact" class="py-12 lg:py-16 px-6 lg:px-12 about-panel">
      <div class="w-full" use:reveal={{ direction: 'up', duration: 700 }}>
        <div class="flex items-center gap-3 mb-4">
          <span class="i-heroicons-outline-chat-bubble-left-right w-8 h-8 text-primary"></span>
          <h2 class="text-3xl font-bold">Let's Connect</h2>
        </div>
        <p class="opacity-70 mb-6 max-w-xl">
          Have questions about my experiences at Canva, want to discuss ML research, or looking for career advice?
          Feel free to reach out!
        </p>

        <div class="mb-8 max-w-3xl">
          <TrainerCard {postCount} />
        </div>

        <div class="flex flex-col gap-3 max-w-md mb-6">
          <a href="https://github.com/saikumarmk" target="_blank" class="btn btn-primary gap-2 justify-start">
            <span class="i-heroicons-outline-code-bracket w-5 h-5"></span>
            GitHub: @saikumarmk
          </a>
          <a href={assets.resume} target="_blank" class="btn btn-outline gap-2 justify-start">
            <span class="i-heroicons-outline-document-text w-5 h-5"></span>
            Download Résumé
          </a>
        </div>

        <div class="text-sm opacity-70 space-y-1">
          <p>Email available in résumé</p>
          <p>LinkedIn: Search "Sai Kumar Monash"</p>
          <p>Discord: Theorvolt</p>
        </div>
      </div>
    </section>
  </div>
</div>

<style>
  .about-page {
    --panel: var(--site-panel);
    --line: var(--site-line);
    --accent: var(--site-accent);
    --fg: var(--site-fg);
    --fg-2: var(--site-fg-2);
    --muted: var(--site-muted);
    --sans: var(--site-sans);
    --mono2: var(--site-mono2);
    color: var(--fg);
    font-family: var(--mono2);
  }

  .about-page :global(h1),
  .about-page :global(h2),
  .about-page :global(h3) {
    font-family: var(--sans);
    letter-spacing: -0.035em;
  }

  .about-sticky-nav {
    border-color: var(--line);
    background-color: color-mix(in srgb, var(--site-bg) 92%, transparent);
  }

  .about-panel {
    background: color-mix(in srgb, var(--panel) 72%, transparent);
    border-block: 1px solid var(--line);
  }

  .about-page :global(.prose) {
    color: var(--fg-2);
  }

  .about-page :global(.prose p) {
    color: var(--fg-2);
  }

  @supports (backdrop-filter: blur(8px)) {
    @media (prefers-reduced-motion: no-preference) {
      .about-sticky-nav {
        backdrop-filter: blur(12px);
        background-color: color-mix(in srgb, var(--site-bg) 78%, transparent);
      }
    }
  }

  @media (prefers-reduced-motion: no-preference) {
    .ascii-grid {
      animation: grid-move 20s linear infinite;
    }
  }

  @keyframes grid-move {
    0% { transform: translate(0, 0); }
    100% { transform: translate(50px, 50px); }
  }
</style>
