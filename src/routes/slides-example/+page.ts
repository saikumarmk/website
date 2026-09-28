import { redirect } from '@sveltejs/kit'
import type { PageLoad } from './$types'

/** Old URL for the example deck. No `?` in Location: static hosts can't write that path, so `/cool-stuff/deck/` adds `?present`. */
export const load: PageLoad = () => {
  redirect(307, '/cool-stuff/deck/')
}
