/**
 * Canonical static asset URLs mirrored from `urara/assets/` → `static/assets/`.
 * Import this instead of hardcoding `/assets/...` in components.
 */
export const assets = {
  resume: '/assets/resume.pdf',
  thesis: '/assets/honours_thesis.pdf',
  canvaLogo: '/assets/canva.png',
  canvaWordmark: '/assets/logo-canva-white.svg',
  digicorLogo: '/assets/digicor.jpg',
  monashLogo: '/assets/monash.jpeg'
} as const

/** Fallback when a PDF mirror is missing (e.g. before Urara build). */
export const resumeFallbackHref = '/about'
