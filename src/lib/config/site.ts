import type { SiteConfig } from '$lib/types/site'
import { homeContent } from './home'
import pokemonData from '../../resources/pokemonClasses.json'


function generateRandomBio(): string {
  const randomBio = homeContent.statusMessages[Math.floor(Math.random() * homeContent.statusMessages.length)];
  const randomPokemon = pokemonData[Math.floor(Math.random() * pokemonData.length)];
  const isShiny = Math.random() < 0.1; // 10% chance for shiny
  const shinyClass = isShiny ? 'shiny' : '';


  return `${randomBio} <span class="pokesprite pokemon ${shinyClass} ${randomPokemon}"></span>`;
}
export const site: SiteConfig = {
  protocol: import.meta.env.SITE_PROTOCOL ?? 'https://',
  domain: import.meta.env.SITE_DOMAIN ?? 'www.saikumarmk.com',
  title: 'saikumarmk.com',
  subtitle: '',
  lang: 'en-US',
  author: {
    name: 'Sai',
    avatar: '/assets/sai_red.webp',
    status: '',
    bio: generateRandomBio(),
    metadata: [
      {
        text: 'GitHub',
        link: 'https://github.com/saikumarmk'
      }]
  },
  themeColor: '#252732'
}
