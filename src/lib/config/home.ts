export type HomeAppCard = {
  title: string
  href: string
  summary: string
  kind: string
  image: string
  external?: boolean
}

export const homeContent = {
  rotatingFocus: ['video models', 'diffusion systems', 'photo effects'],
  statusMessages: [
    'Probably napping',
    'Applied Scientist of sorts',
    'Machine Learning Engineer!',
    'Learning Graph Theory!',
    'Watching a video about pokemon glitches',
    'Writing about coding',
    'Acquiring drip',
    'Learning some Measure Theory',
    'Messing around with a Latent Diffusion Model',
    'Bouldering (maybe)',
    'Playing a JRPG',
    'Listening to an Ado song',
    'Listening to 踊',
    'Improving the site into a proper workshop.',
    'Reverse-engineering Yakuza 0 data tables.',
    'Stress-testing SvelteKit, one route at a time.',
    'Catching edge cases before they evolve.'
  ],
  interests: [
    'diffusion models',
    'video generation',
    'reinforcement learning',
    'HPC / distributed training',
    'reverse engineering',
    'Yakuza / RGG',
    'Pokémon data',
    'measure theory',
    'literate programming',
    'C',
    'Python',
    'tech-career writing'
  ],
  appCards: [
    {
      title: 'transit.saikumarmk.com',
      href: 'https://transit.saikumarmk.com/',
      summary: "Melbourne's public transit network visualised in 3D with routes, stops, and city-scale movement.",
      kind: 'dataviz',
      image: '/assets/projects/minimelbnew.webp',
      external: true
    },
    {
      title: 'Poké Tournament',
      href: 'https://saikumarmk.github.io/poketournament/',
      summary: 'A Pokémon tournament simulator for settling match-up arguments with a bracket instead of vibes.',
      kind: 'fun',
      image: '/assets/red.png',
      external: true
    },
    {
      title: 'Monash Unit Graph',
      href: 'https://saikumarmk.github.io/monash-handbook-plus/graph',
      summary: 'Every Monash unit as a prerequisite graph — ~5200 nodes of handbook chaos.',
      kind: 'dataviz',
      image: '/assets/monash-handbook-plus-logo.png',
      external: true
    }
  ] satisfies HomeAppCard[]
} as const
