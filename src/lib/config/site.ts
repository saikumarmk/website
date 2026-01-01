import type { SiteConfig } from '$lib/types/site'
import pokemonData from '../../resources/pokemonClasses.json'


function generateRandomBio(): string {
  const bioList = [
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
    'Finetuning a GPT model',
    'Listening to an Ado song',
    'Listening to 踊'
  ];

  const randomBio = bioList[Math.floor(Math.random() * bioList.length)];
  const randomPokemon = pokemonData[Math.floor(Math.random() * pokemonData.length)];
  const isShiny = Math.random() < 0.1; // 10% chance for shiny
  const shinyClass = isShiny ? 'shiny' : '';


  return `${randomBio} <span class="pokesprite pokemon ${shinyClass} ${randomPokemon}"></span>`;
}
export const site: SiteConfig = {
  protocol: 'https://',
  domain: import.meta.env.URARA_SITE_PROTOCOL ?? import.meta.env.DEV ? 'http://' : 'https://',
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
