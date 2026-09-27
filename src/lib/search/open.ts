/** The search modal lives in the root layout; anything else asks it to open with this event. */
export const SEARCH_EVENT = 'site:search'

export function openSearch(query = '') {
  dispatchEvent(new CustomEvent<{ query: string }>(SEARCH_EVENT, { detail: { query } }))
}
