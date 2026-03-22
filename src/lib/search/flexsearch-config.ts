/** Shared between prerender (serialize) and client (import). Must stay in sync. */
export const FLEXSEARCH_DOCUMENT_OPTIONS = {
  document: {
    id: 'path',
    index: ['title', 'summary', 'content', 'tags'],
    store: ['path', 'title', 'summary', 'tags', 'created']
  },
  tokenize: 'forward' as const,
  resolution: 9
}

export const STATIC_SEARCH_PAGES = [
  {
    title: 'The Grad/Intern Playbook',
    path: '/playbook',
    summary:
      'Hub for the grad/intern guide: timelines, résumé, interviews, and hiring at major tech employers (e.g. Amazon, Atlassian, Google).',
    content: '',
    type: 'page'
  },
  { title: 'About', path: '/about', summary: 'Learn more about me', content: '', type: 'page' },
  { title: 'Portfolio', path: '/portfolio', summary: 'View my work and projects', content: '', type: 'page' },
  { title: 'Project Dex', path: '/portfolio/projects', summary: 'Browse all projects in Pokedex style', content: '', type: 'page' },
  { title: 'Yggdrasil 2026', path: '/growth/2026', summary: 'Interactive skill tree and learning roadmap', content: '', type: 'page' },
  { title: 'Archive', path: '/archive', summary: 'Browse all posts by tag and year', content: '', type: 'page' }
] as const
