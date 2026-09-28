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
  { title: 'Home', path: '/', summary: 'The front page: recent writing and what I work on', content: '', type: 'page' },
  { title: 'Writing', path: '/archive', summary: 'Everything, by topic', content: '', type: 'page' },
  {
    title: 'The Playbook',
    path: '/playbook',
    summary:
      'The grad/intern series: timelines, résumé, interviews, and hiring at major tech employers (e.g. Amazon, Atlassian, Google).',
    content: '',
    type: 'page'
  },
  { title: 'Project Dex', path: '/dex', summary: 'Every project, one entry each', content: '', type: 'page' },
  { title: 'Yggdrasil', path: '/growth/2026', summary: 'The 2026 skill tree and learning roadmap', content: '', type: 'page' },
  { title: 'About', path: '/#about', summary: 'Who I am', content: '', type: 'page' },
  { title: 'Experience', path: '/#experience', summary: 'Roles and research', content: '', type: 'page' }
] as const
