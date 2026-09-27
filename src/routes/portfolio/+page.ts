import { redirect } from '@sveltejs/kit'
import { building } from '$app/environment'

export const prerender = true

export function load() {
  // While prerendering, +page.svelte writes a meta refresh instead: the crawler would follow a
  // redirect to "/#experience" and emit a stray "#experience.html", which the service worker then precaches.
  if (!building) redirect(308, '/#experience')
}
