import type { SiteConfig } from '$lib/types/site'

const bio = ['Probably napping',
  'Software Engineer!',
  'Machine Learning Engineer!',
  'Learning Graph Theory!',
  'Watching a video about pokemon glitches',
  'Writing about coding',
  'Messing around with a Latent Diffusion Model',
  'Playing around with data',
  'Finetuning a GPT model',
  'Listening to an Ado song',
  'Listening to  踊'
]

export const site: SiteConfig = {
  protocol: 'https://',
  domain: import.meta.env.URARA_SITE_PROTOCOL ?? import.meta.env.DEV ? 'http://' : 'https://',
  title: 'saikumarmk.com',
  subtitle: '',
  lang: 'en-US',
  author: {
    name: 'Sai',
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
