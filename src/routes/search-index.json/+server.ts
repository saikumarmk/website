import type { RequestHandler } from './$types'
import { json } from '@sveltejs/kit'
import { buildSearchIndexJson } from '$lib/utils/search-index-data'

export const prerender = true
export const trailingSlash = 'never'

// Plaintext from raw markdown (?raw glob) + pre-serialized FlexSearch chunks (no client add() loop).
export const GET: RequestHandler = async () => {
  return json(buildSearchIndexJson())
}


