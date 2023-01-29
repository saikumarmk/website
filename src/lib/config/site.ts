import type { SiteConfig } from '$lib/types/site'

const bio = ['Probably napping',
  'Software engineer!',
  'Data scientist!',
  'Learning Graph Theory!',
  'Watching a video about pokemon glitches',
  'Computing homology groups of dunce caps',
  'Playing around with data',
  'Finetuning a GPT model'
]

export const site: SiteConfig = {
  protocol: 'https://',
  domain: import.meta.env.URARA_SITE_PROTOCOL ?? import.meta.env.DEV ? 'http://' : 'https://',
  title: 'saikumarmk.com',
  subtitle: '',
  lang: 'en-US',
  author: {
    name: 'Sai kumar Murali krishnan',
    avatar: '/assets/maskable@192.png',
    status: '🔱',
    bio: bio[~~(Math.random() * bio.length)],
    metadata: [
      {
        text: 'GitHub',
        link: 'https://github.com/saikumarmk'
      }]
  },
  themeColor: '#252732'
}
