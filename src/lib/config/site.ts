import type { SiteConfig } from '$lib/types/site'

const bio = ['Probably napping',
  'Software engineer!',
  'Data scientist!',
  'Learning Graph Theory!',
  'Watching a video about pokemon glitches',
  'Computing homology groups of dunce caps',
  'Playing around with data'
]

export const site: SiteConfig = {
  protocol: 'https://',
  domain: (import.meta.env.URARA_SITE_DOMAIN as string) ?? 'urara-demo.netlify.app',
  title: 'saikumarmk.com',
  subtitle: 'Sweet & Powerful SvelteKit Blog Template',
  lang: 'en-US',
  author: {
    name: 'Sai kumar Murali krishnan',
    photo: '/assets/maskable@192.png',
    status: '🔱',
    bio: bio[~~(Math.random() * bio.length)],
    metadata: [
      {
        text: 'saikumarmk',
        icon: 'i-simple-icons-github',
        link: 'https://github.com/saikumarmk'
      }]
  },
  themeColor: '#3D4451'
}
