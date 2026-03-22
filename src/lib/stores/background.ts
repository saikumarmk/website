import { browser } from '$app/environment'
import { writable } from 'svelte/store'

const saved = browser ? localStorage.getItem('bg-mode') : null
const initial = (saved === 'three' || saved === 'poke') ? saved : 'none'

export const backgroundMode = writable<'none' | 'three' | 'poke'>(initial)

backgroundMode.subscribe(value => {
  if (browser) {
    localStorage.setItem('bg-mode', value)
  }
})