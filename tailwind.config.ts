import typography from '@tailwindcss/typography'
import daisyui from 'daisyui'

// Same colours as the Sampler tokens in src/styles/sampler.css, so leftover DaisyUI pieces don't clash.
const ivory = {
  primary: '#3d4c9e',
  'primary-content': '#f5f1e7',
  secondary: '#146e78',
  'secondary-content': '#f5f1e7',
  accent: '#b03d78',
  'accent-content': '#f5f1e7',
  neutral: '#22212b',
  'neutral-content': '#f5f1e7',
  'base-100': '#f5f1e7',
  'base-200': '#eee8da',
  'base-300': '#ddd5c5',
  'base-content': '#22212b',
  info: '#00688f',
  success: '#146e78',
  warning: '#84621c',
  error: '#a33f73'
}

const ink = {
  primary: '#c2aff5',
  'primary-content': '#15141b',
  secondary: '#84cbd3',
  'secondary-content': '#15141b',
  accent: '#e99bc6',
  'accent-content': '#15141b',
  neutral: '#ece8de',
  'neutral-content': '#15141b',
  'base-100': '#15141b',
  'base-200': '#1c1b24',
  'base-300': '#2d2b36',
  'base-content': '#ece8de',
  info: '#52b4da',
  success: '#84cbd3',
  warning: '#d6b25c',
  error: '#e99bc6'
}

export default {
  content: ['./src/**/*.{html,md,js,svelte,ts}'],
  plugins: [typography, daisyui],
  daisyui: { themes: [{ ivory }, { ink }] }
}
