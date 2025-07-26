import type { ThemeConfig, HeadConfig, HeaderConfig, FooterConfig, DateConfig, FeedConfig } from '$lib/types/general'

export const theme: ThemeConfig = [
  {
    name: 'cmyk',
    text: 'Light'
  },
  {
    name: 'dracula',
    text: 'Dark'
  },
  {
    name: 'retro',
    text: 'Retro'
  },
  {
    name: 'pastel',
    text: 'Pastel'
  },
  {
    name: 'black',
    text: 'Black'
  }
]

export const head: HeadConfig = {}

export const header: HeaderConfig = {
  nav: [
    {
      text: 'About Me',
      link: '/about'
    },
    {
      text: 'Portfolio',
      link: '/portfolio'
    },
    {
      text: 'Documents',
      children: [
        {
          text: 'Rizzume',
          link: '/assets/resume.pdf'
        },
        {
          text: 'Thesis',
          link: '/assets/honours_thesis.pdf'
        }
      ]
    },

    {
      text: 'The Playbook',
      children: [
        {
          text: 'FAQ',
          link: '/guide-to-tech-faq'
        },
        {
          text: 'Part 1. Timeline',
          link: '/guide-to-tech-1'
        },
        {
          text: 'Part 2. Improving',
          link: '/guide-to-tech-2'
        },
        {
          text: 'Part 2.5. Résumé',
          link: '/guide-to-tech-2.5'
        },
        {
          text: 'Part 3. Applying',
          link: '/guide-to-tech-3'
        }

      ]
    },

    {
      text: 'Monash Unit Graph',
      children: [
        {
          text: '2D Graph',
          link: '/monash-graph-2d'
        },
        {
          text: '3D Graph',
          link: '/monash-graph-3d'
        }
      ]
    }
  ]
}

export const footer: FooterConfig = {
  nav: [
    {
      text: 'Feed',
      link: '/atom.xml'
    },
    {
      text: 'Sitemap',
      link: '/sitemap.xml'
    }
  ]
}

export const date: DateConfig = {
  locales: 'en-UK',
  options: {
    year: '2-digit',
    weekday: 'long',
    month: 'short',
    day: 'numeric'
  }
}

export const feed: FeedConfig = {}
