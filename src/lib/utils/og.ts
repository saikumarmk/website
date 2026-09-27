/** Link previews and flower favicons, drawn after `vite build` by scripts/og.mjs (so absent in dev). */
export const ogImage = (path: string, suffix = '') => `/og/${path.replace(/^\/+|\/+$/g, '')}${suffix}.png`

export const siteOgImage = '/og/site.png'
