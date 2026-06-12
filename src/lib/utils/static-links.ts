/**
 * Links to non-HTML static files must bypass SvelteKit client-side routing.
 * Otherwise the app shell is rendered at e.g. /assets/resume.pdf and relative
 * ./_app/... URLs resolve under /assets/ (404s, "stripped site" symptom).
 */
export function isStaticDocument(href: string): boolean {
  return /\.(pdf|zip|docx?|xlsx?)$/i.test(href)
}

export function staticDocumentLinkAttrs(href: string): Record<string, string> {
  if (!isStaticDocument(href)) return {}
  return {
    target: '_blank',
    rel: 'noopener noreferrer',
    'data-sveltekit-reload': ''
  }
}
