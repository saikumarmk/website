<script lang="ts">
  import Head from '$lib/components/head.svelte'
  import ExperienceComponent from '$lib/components/portable-portfolio/experience.svelte'
  import ProjectComponent from '$lib/components/portable-portfolio/projects.svelte'
</script>

<Head />

<div class="max-w-3xl mx-auto px-4 py-8">
  <div class="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
    <h1 class="text-3xl font-bold">Portfolio - List View</h1>
    <div class="flex gap-2 flex-wrap">
      <a href="/portfolio" class="btn btn-secondary gap-2">
        <span class="i-heroicons-outline-clock w-5 h-5"></span>
        Timeline
      </a>
      <a href="/portfolio/projects" class="btn btn-primary gap-2">
        <span class="i-heroicons-outline-squares-2x2 w-5 h-5"></span>
        Project Dex
      </a>
    </div>
  </div>
</div>

<ExperienceComponent />
<ProjectComponent />

