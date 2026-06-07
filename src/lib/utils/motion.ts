import { browser } from '$app/environment'

export function prefersReducedMotion(): boolean {
  if (!browser) return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function isPageVisible(): boolean {
  if (!browser) return true
  return document.visibilityState === 'visible'
}
