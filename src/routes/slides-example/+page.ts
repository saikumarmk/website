import { redirect } from '@sveltejs/kit'
import type { PageLoad } from './$types'

/** Legacy URL: deck + kitchen sink now live on `/cool-stuff`. */
export const load: PageLoad = () => {
  throw redirect(307, '/cool-stuff?mode=slides')
}
