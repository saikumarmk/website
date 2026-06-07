import { browser } from '$app/environment'
import { prefersReducedMotion } from '$lib/utils/motion'

export type RouteTransitionPolicy = 'auto' | 'vt' | 'fade' | 'none'

const STORAGE_KEY = 'route-transition-policy'
const QUERY_KEY = 'routeTransition'

const VALID: RouteTransitionPolicy[] = ['auto', 'vt', 'fade', 'none']

function parsePolicy(value: string | null): RouteTransitionPolicy | null {
  if (value && (VALID as string[]).includes(value)) return value as RouteTransitionPolicy
  return null
}

/** Read transition policy from `?routeTransition=` or localStorage (`route-transition-policy`). */
export function getRouteTransitionPolicy(): RouteTransitionPolicy {
  if (!browser) return 'auto'

  const fromQuery = parsePolicy(new URLSearchParams(window.location.search).get(QUERY_KEY))
  if (fromQuery) return fromQuery

  return parsePolicy(localStorage.getItem(STORAGE_KEY)) ?? 'auto'
}

export function setRouteTransitionPolicy(policy: RouteTransitionPolicy): void {
  if (!browser) return
  localStorage.setItem(STORAGE_KEY, policy)
}

export function supportsViewTransitionApi(): boolean {
  return browser && typeof document.startViewTransition === 'function'
}

export function shouldUseViewTransition(): boolean {
  if (!browser || prefersReducedMotion()) return false

  const policy = getRouteTransitionPolicy()
  if (policy === 'none' || policy === 'fade') return false
  if (policy === 'vt') return supportsViewTransitionApi()
  return supportsViewTransitionApi()
}

export function shouldAnimateFade(): boolean {
  if (!browser || prefersReducedMotion()) return false

  const policy = getRouteTransitionPolicy()
  if (policy === 'none') return false
  if (policy === 'fade') return true
  if (policy === 'vt') return false
  return !shouldUseViewTransition()
}
