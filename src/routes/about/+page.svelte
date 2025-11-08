<script lang="ts">
  import { onMount } from 'svelte'
  import { fly, fade } from 'svelte/transition'
  
  let currentSection = 0
  let mounted = false
  let mouseX = 0
  let mouseY = 0
  
  const sections = [
    { id: 'hero', label: 'Intro', icon: 'i-heroicons-outline-user' },
    { id: 'research', label: 'Research', icon: 'i-heroicons-outline-beaker' },
    { id: 'advice', label: 'Advice', icon: 'i-heroicons-outline-light-bulb' },
    { id: 'contact', label: 'Contact', icon: 'i-heroicons-outline-chat-bubble-left-right' }
  ]
  
  function handleMouseMove(e: MouseEvent) {
    mouseX = e.clientX
    mouseY = e.clientY
  }
  
  function scrollToSection(index: number) {
    const section = document.getElementById(sections[index].id)
    section?.scrollIntoView({ behavior: 'smooth' })
  }
  
  onMount(() => {
    mounted = true
    
    // Intersection observer for section tracking
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
    
    return () => observer.disconnect()
  })
</script>

<svelte:head>
  <title>About Me | saikumarmk.com</title>
</svelte:head>

<svelte:window on:mousemove={handleMouseMove} />

<div class="flex min-h-screen relative">
  <!-- Left Side - Animated Background -->
  <div class="hidden lg:flex lg:w-1/2 lg:fixed lg:left-0 lg:top-0 lg:h-screen lg:w-1/2 relative bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 items-center justify-center overflow-hidden">
    <!-- Animated gradient mesh background -->
    <div class="absolute inset-0">
      {#if mounted}
        <!-- Large gradient orbs -->
        {#each Array(8) as _, i}
          <div 
            class="absolute rounded-full blur-3xl"
            style="
              width: {150 + Math.random() * 250}px;
              height: {150 + Math.random() * 250}px;
              left: {Math.random() * 100}%;
              top: {Math.random() * 100}%;
              background: radial-gradient(circle, 
                hsl({(i * 45) % 360}, 70%, 60%) 0%,
                transparent 70%
              );
              animation: float-blob {5 + Math.random() * 5}s ease-in-out infinite;
              animation-delay: -{Math.random() * 3}s;
              opacity: 0.3;
            "
          />
        {/each}
        
        <!-- Grid pattern overlay -->
        <div class="absolute inset-0 opacity-10" 
          style="
            background-image: 
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px);
            background-size: 50px 50px;
            animation: grid-move 20s linear infinite;
          "
        />
        
        <!-- Particles -->
        {#each Array(30) as _, i}
          <div 
            class="absolute w-1 h-1 bg-white rounded-full"
            style="
              left: {Math.random() * 100}%;
              top: {Math.random() * 100}%;
              animation: particle-float {10 + Math.random() * 20}s linear infinite;
              animation-delay: -{Math.random() * 10}s;
              opacity: {0.2 + Math.random() * 0.3};
            "
          />
        {/each}
      {/if}
    </div>
    
    <!-- Cursor-following gradient spotlight -->
    {#if mounted}
      <div 
        class="absolute w-96 h-96 rounded-full blur-3xl transition-all duration-1000 ease-out pointer-events-none"
        style="
          left: {mouseX / window.innerWidth * 100}%;
          top: {mouseY / window.innerHeight * 100}%;
          transform: translate(-50%, -50%);
          background: radial-gradient(circle, 
            rgba(var(--p), 0.3) 0%,
            transparent 70%
          );
        "
      />
    {/if}
    
    <!-- Placeholder for future animation -->
    <div class="relative z-10 w-full h-full flex items-center justify-center">
      <!-- Animation will go here later -->
    </div>
  </div>
  
  <!-- Right Side - Scrollable Content -->
  <div class="w-full lg:w-1/2 lg:ml-auto relative">
    <!-- Sticky Navigation -->
    <div class="sticky top-0 z-50 bg-base-100/80 backdrop-blur-lg border-b border-base-content/10">
      <div class="flex justify-center gap-2 p-4">
        {#each sections as section, i}
          <button
            on:click={() => scrollToSection(i)}
            class="btn btn-sm btn-circle"
            class:btn-primary={currentSection === i}
            class:btn-ghost={currentSection !== i}
            title={section.label}>
            <span class="{section.icon} w-4 h-4"></span>
          </button>
        {/each}
      </div>
    </div>
    
    <!-- Hero Section -->
    <section id="hero" class="min-h-screen flex items-center p-8 lg:p-12">
      {#if mounted}
        <div in:fly={{ x: 50, duration: 800 }}>
          <!-- Mobile avatar -->
          <div class="lg:hidden mb-8">
            <div class="avatar">
              <div class="w-24 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                <div class="bg-gradient-to-br from-primary to-secondary w-full h-full flex items-center justify-center text-4xl">
                  👨‍💻
                </div>
              </div>
            </div>
          </div>
          
          <h1 class="text-5xl lg:text-6xl font-bold mb-6">
            Hi, I'm <span class="text-primary">Sai</span>
          </h1>
          <p class="text-xl lg:text-2xl opacity-80 mb-6">
            Machine Learning Engineer working on generative AI at Canva
          </p>
          <div class="prose prose-lg max-w-none opacity-70 mb-8">
            <p>
              I'm a graduate from Monash University, having completed my honours year in 
              <a href="https://handbook.monash.edu/current/courses/S3003" target="_blank" class="link link-primary">Applied Data Science</a>, 
              with my thesis on <a href="/assets/honours_thesis.pdf" target="_blank" class="link link-primary">"Bias Modelling Mitigation in Diffusion Models"</a>. 
              I was also the former president of the Monash Association of Coding (MAC), where we saw record growth to over 1000 members, 
              more significant flagship events such as our Tech Careers Evening and MACathon, mock interviews, and more frequent events.
            </p>
            <p>
              Separate from my university experience, I also interned at Canva, a beginner-friendly web design company. 
              I'll be returning there as a Machine Learning Engineer (MLE), focusing on generative AI in text-to-image models 
              such as Stable Diffusion, Imagen, Midjourney, and so on. My interests lie in the intersection of natural language processing 
              and computer vision, specifically in the form of diffusion-based text-to-image models, which my thesis is based on; 
              however, I am interested in all areas of machine learning.
            </p>
            <p>
              If you have any questions about my experiences at Canva or want to explore my personal projects and blog pieces, feel free to reach out. 
              You can contact me via email (linked in my resume), on LinkedIn using my full name, or find me on Discord at Theorvolt. 
              Also, remember to check out my GitHub, where you can explore my other works at 
              <a href="https://github.com/saikumarmk/" target="_blank" class="link link-primary">saikumarmk</a>.
            </p>
            <p class="font-semibold">Happy reading!</p>
          </div>
          
          <div class="flex gap-3 flex-wrap">
            <a href="/assets/resume.pdf" class="btn btn-primary gap-2">
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
      {/if}
    </section>
    
    <!-- On Industry Research Section -->
    <section id="research" class="min-h-screen p-8 lg:p-12 bg-base-200">
      {#if mounted}
        <div in:fly={{ x: 50, duration: 800, delay: 200 }}>
          <div class="flex items-center gap-3 mb-6">
            <span class="i-heroicons-outline-beaker w-10 h-10 text-primary"></span>
            <h2 class="text-4xl font-bold">On Industry Research</h2>
          </div>
          
          <div class="prose prose-lg max-w-none">
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
      {/if}
    </section>
    
    <!-- Advice Section -->
    <section id="advice" class="min-h-screen p-8 lg:p-12">
      {#if mounted}
        <div in:fly={{ x: 50, duration: 800, delay: 200 }}>
          <div class="flex items-center gap-3 mb-6">
            <span class="i-heroicons-outline-light-bulb w-10 h-10 text-primary"></span>
            <h2 class="text-4xl font-bold">My Advice to New Students</h2>
          </div>
          
          <div class="prose prose-lg max-w-none">
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
          
          <div class="mt-8 alert alert-success">
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
      {/if}
    </section>
    
    <!-- Contact Section -->
    <section id="contact" class="min-h-screen flex items-center p-8 lg:p-12 bg-base-200">
      {#if mounted}
        <div class="w-full" in:fly={{ x: 50, duration: 800, delay: 200 }}>
          <div class="flex items-center gap-3 mb-6">
            <span class="i-heroicons-outline-chat-bubble-left-right w-10 h-10 text-primary"></span>
            <h2 class="text-4xl font-bold">Let's Connect</h2>
          </div>
          <p class="text-lg opacity-70 mb-8 max-w-xl">
            Have questions about my experiences at Canva, want to discuss ML research, or looking for career advice? 
            Feel free to reach out!
          </p>
          
          <div class="flex flex-col gap-4 max-w-md mb-8">
            <a href="https://github.com/saikumarmk" target="_blank" class="btn btn-lg btn-primary gap-2 justify-start">
              <span class="i-heroicons-outline-code-bracket w-5 h-5"></span>
              GitHub: @saikumarmk
            </a>
            <a href="/assets/resume.pdf" target="_blank" class="btn btn-lg btn-outline gap-2 justify-start">
              <span class="i-heroicons-outline-document-text w-5 h-5"></span>
              Download Résumé
            </a>
          </div>
          
          <div class="text-sm opacity-70 space-y-2">
            <p>📧 Email available in résumé</p>
            <p>💼 LinkedIn: Search "Sai Kumar Monash"</p>
            <p>💬 Discord: Theorvolt</p>
          </div>
        </div>
      {/if}
    </section>
  </div>
</div>

<style>
  @keyframes float-blob {
    0%, 100% { 
      transform: translate(0, 0) scale(1);
    }
    33% {
      transform: translate(30px, -30px) scale(1.1);
    }
    66% {
      transform: translate(-20px, 20px) scale(0.9);
    }
  }
  
  @keyframes grid-move {
    0% {
      transform: translate(0, 0);
    }
    100% {
      transform: translate(50px, 50px);
    }
  }
  
  @keyframes particle-float {
    0% {
      transform: translateY(0) translateX(0);
      opacity: 0;
    }
    10% {
      opacity: 0.5;
    }
    90% {
      opacity: 0.5;
    }
    100% {
      transform: translateY(-100vh) translateX(50px);
      opacity: 0;
    }
  }
  
</style>

