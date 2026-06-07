import type { ThemeConfig, HeadConfig, HeaderConfig, FooterConfig, DateConfig, FeedConfig } from '../types/general'
import { assets } from './assets'

export const theme: ThemeConfig = [
  {
    name: 'cmyk',
    text: 'Light'
  },
  {
    name: 'dracula',
    text: 'Dark'
  }
]

export const head: HeadConfig = {}

export const header: HeaderConfig = {
  /** Enables navbar search control (⌘K / Ctrl+K opens `SearchModal` via `bind:searchModal`) */
  search: { provider: 'duckduckgo' },
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
      text: 'Blog',
      link: '/archive'
    },
    {
      text: 'Documents',
      children: [
        {
          text: 'Rizzume',
          link: assets.resume
        },
        {
          text: 'Thesis',
          link: assets.thesis
        }
      ]
    },

    {
      text: 'Playbook',
      link: '/playbook'
    },
    {
      text: 'Yggdrasil',
      link: '/growth/2026'
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
