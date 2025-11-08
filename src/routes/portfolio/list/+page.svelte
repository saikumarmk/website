<script lang="ts">
  import Head from '$lib/components/head.svelte'
  import ExperienceComponent from '$lib/components/portable-portfolio/experience.svelte'
  import ProjectComponent from '$lib/components/portable-portfolio/projects.svelte'
</script>

<Head />

<div class="max-w-3xl mx-auto px-4 py-8">
  <div class="flex justify-between items-center mb-8">
    <h1 class="text-3xl font-bold">Portfolio - List View</h1>
    <a href="/portfolio" class="btn btn-primary btn-sm">
      <span class="i-heroicons-outline-squares-2x2 w-4 h-4"></span>
      Visual View
    </a>
  </div>
</div>

<ExperienceComponent />
<ProjectComponent />

