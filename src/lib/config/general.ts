import type { ThemeConfig, HeadConfig, HeaderConfig, FooterConfig, DateConfig, FeedConfig } from '$lib/types/general'

export const theme: ThemeConfig = [
  {
    name: 'light',
    text: 'ð Light'
  },
  {
    name: 'dark',
    text: 'ð Dark'
  },
  {
    name: 'cupcake',
    text: 'ð§ Cupcake'
  },
  {
    name: 'bumblebee',
    text: 'ð Bumblebee'
  },
  {
    name: 'emerald',
    text: 'â³ï¸ Emerald'
  },
  {
    name: 'corporate',
    text: 'ð¢ Corporate'
  },
  {
    name: 'valentine',
    text: 'ð¸ Valentine'
  },
  {
    name: 'synthwave',
    text: 'ð Synthwave'
  },
  {
    name: 'retro',
    text: 'ð Retro'
  },
  {
    name: 'cyberpunk',
    text: 'ð Cyberpunk'
  },
  {
    name: 'halloween',
    text: 'ð Halloween'
  },
  {
    name: 'garden',
    text: 'ð¡ Garden'
  },
  {
    name: 'forest',
    text: 'ð² Forest'
  },
  {
    name: 'aqua',
    text: 'ð¦ Aqua'
  },
  {
    name: 'lofi',
    text: 'ð¶ Lo-Fi'
  },
  {
    name: 'pastel',
    text: 'ð Pastel'
  },
  {
    name: 'fantasy',
    text: 'ð£ Fantasy'
  },
  {
    name: 'wirefream',
    text: 'ð± Wireframe'
  },
  {
    name: 'black',
    text: 'ð¤ Black'
  },
  {
    name: 'luxury',
    text: 'ð° Luxury'
  },
  {
    name: 'dracula',
    text: 'ð§ Dracula'
  },
  {
    name: 'cmyk',
    text: 'ð¨ï¸ CMYK'
  },
  {
    name: 'autumn',
    text: 'ð Autumn'
  },
  {
    name: 'business',
    text: 'ðï¸ Business'
  },
  {
    name: 'acid',
    text: 'ð§ï¸ Acid'
  },
  {
    name: 'lemonade',
    text: 'ð Lemonade'
  },
  {
    name: 'night',
    text: 'ð Night'
  },
  {
    name: 'coffee',
    text: 'â Coffee'
  },
  {
    name: 'winter',
    text: 'âï¸ Winter'
  }
]

export const head: HeadConfig = {}

export const header: HeaderConfig = {
  nav: [
    {
      text: 'About',
      link: '/about'
    },
    {
      text: 'Projects',
      link: '/projects'
    },
    {
      text: 'RÃ©sumÃ©',
      link: '/assets/resume.pdf'
    },
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
