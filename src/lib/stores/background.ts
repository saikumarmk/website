// Enhanced background.ts
import { writable } from 'svelte/store'

const saved = typeof localStorage !== 'undefined' ? localStorage.getItem('bg-mode') : null
const initial = (saved === 'three' || saved === 'poke') ? saved : 'none'

export const backgroundMode = writable<'none' | 'three' | 'poke'>(initial)


backgroundMode.subscribe(value => {
    if (typeof localStorage !== 'undefined') {
        localStorage.setItem('bg-mode', value)
    }
})