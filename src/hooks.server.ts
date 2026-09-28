import type { Handle, HandleServerError } from '@sveltejs/kit'
import { building } from '$app/environment'
import { site } from '$lib/config/site'

export const handle: Handle = async ({ event, resolve }) =>
  await resolve(event, {
    transformPageChunk: ({ html }) => html.replace('<html lang="en">', `<html lang="${site.lang ?? 'en'}">`)
  })

export const handleError: HandleServerError = ({ error, event, status }) => {
  // /og/ images are drawn after prerendering (scripts/og.mjs), so the crawler always finds them missing
  if (building && status === 404 && event.url.pathname.startsWith('/og/')) return
  console.error(status === 404 ? `[404] ${event.request.method} ${event.url.pathname}` : error)
}
