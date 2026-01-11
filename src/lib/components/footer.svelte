<script lang="ts">
  import { onMount, onDestroy } from 'svelte'
  import { browser } from '$app/environment'
  import { site } from '$lib/config/site'
  
  const year = new Date().getFullYear()
  
  // Time on site tracker
  let timeOnSite = '00:00'
  let interval: ReturnType<typeof setInterval>
  
  function formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  
  onMount(() => {
    if (browser) {
      const sessionStart = Date.now()
      // Get stored total time
      const storedTime = parseInt(localStorage.getItem('totalTimeOnSite') || '0', 10)
      
      interval = setInterval(() => {
        const sessionElapsed = Math.floor((Date.now() - sessionStart) / 1000)
        timeOnSite = formatTime(storedTime + sessionElapsed)
      }, 1000)
      
      // Save time on page unload
      const saveTime = () => {
        const sessionElapsed = Math.floor((Date.now() - sessionStart) / 1000)
        localStorage.setItem('totalTimeOnSite', String(storedTime + sessionElapsed))
      }
      
      window.addEventListener('beforeunload', saveTime)
      
      return () => {
        clearInterval(interval)
        window.removeEventListener('beforeunload', saveTime)
        saveTime()
      }
    }
  })
  
  onDestroy(() => {
    if (interval) clearInterval(interval)
  })
</script>

<footer class="border-t border-base-content/10 bg-base-200/50 mt-auto">
  <div class="container mx-auto px-4 py-6 max-w-5xl">
    <!-- Main footer content -->
    <div class="flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
      <!-- Left side -->
      <div class="flex flex-wrap items-center justify-center md:justify-start gap-x-3 gap-y-2">
        <span class="opacity-70">© {year} {site.author.name}</span>
        
        <span class="opacity-30 hidden sm:inline">•</span>
        
        <!-- Status indicator -->
        <div class="flex items-center gap-1.5" title="All systems operational">
          <span class="relative flex h-2 w-2">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
            <span class="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
          </span>
          <span class="opacity-70 text-xs">Online</span>
        </div>
      </div>
      
      <!-- Center - Time on site -->
      <div class="flex items-center gap-1.5 text-xs" title="Time spent on this site (this session + previous)">
        <span class="i-heroicons-outline-clock w-4 h-4 opacity-60"></span>
        <span class="font-mono text-primary">{timeOnSite}</span>
        <span class="opacity-50">on site</span>
      </div>
      
      <!-- Right side - Social links -->
      <div class="flex items-center gap-3">
        <a 
          href="https://github.com/saikumarmk" 
          target="_blank" 
          rel="noopener noreferrer"
          class="opacity-60 hover:opacity-100 hover:text-primary transition-all"
          title="GitHub"
        >
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
          </svg>
        </a>
        <a 
          href="https://www.linkedin.com/in/saikumarmk/" 
          target="_blank" 
          rel="noopener noreferrer"
          class="opacity-60 hover:opacity-100 hover:text-primary transition-all"
          title="LinkedIn"
        >
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
          </svg>
        </a>
        <a 
          href="/assets/resume.pdf" 
          target="_blank"
          class="opacity-60 hover:opacity-100 hover:text-primary transition-all"
          title="Résumé"
        >
          <span class="i-heroicons-outline-document-text w-5 h-5"></span>
        </a>
      </div>
    </div>
    
    <!-- Bottom row -->
    <div class="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 mt-4 pt-4 border-t border-base-content/5 text-xs opacity-50">
      <span>Built with SvelteKit</span>
      <span>•</span>
      <a href="https://github.com/saikumarmk/website" target="_blank" rel="noopener" class="hover:text-primary hover:opacity-100 transition-colors">
        Source Code
      </a>
      <span>•</span>
      <a href="/archive" class="hover:text-primary hover:opacity-100 transition-colors">
        Blog
      </a>
      <span>•</span>
      <a href="/sitemap.xml" class="hover:text-primary hover:opacity-100 transition-colors">
        Sitemap
      </a>
    </div>
  </div>
</footer>
