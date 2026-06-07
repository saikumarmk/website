import { test } from '@playwright/test'
import {
  preparePerfPage,
  measureSpaNavigation,
  sampleScrollFramePacing,
  measureSearchModalReady,
  measureLightboxAttach,
  record,
  resetMetrics,
  writePerfReport
} from './helpers'

const NAV_ROUTES: { name: RegExp | string; path: string }[] = [
  { name: 'About Me', path: '/about' },
  { name: 'Portfolio', path: '/portfolio' },
  { name: /^Blog$/i, path: '/archive' }
]

const DIRECT_ROUTES = ['/growth/2026/', '/playbook/']

test.describe.configure({ mode: 'serial' })

test.beforeAll(() => {
  resetMetrics()
})

test.afterAll(() => {
  writePerfReport()
})

test('navigation: header tab swaps', async ({ page }, testInfo) => {
  const browser = testInfo.project.name
  await preparePerfPage(page)

  // warm-up
  await page.goto('/about/', { waitUntil: 'domcontentloaded' })
  await page.goto('/', { waitUntil: 'domcontentloaded' })

  for (const route of NAV_ROUTES) {
    const ms = await measureSpaNavigation(page, route.name, route.path)
    record({
      scenario: 'navigation',
      metric: route.path,
      value: ms,
      unit: 'ms'
    }, browser)
  }

  for (const routePath of DIRECT_ROUTES) {
    const start = Date.now()
    await page.goto(routePath, { waitUntil: 'domcontentloaded' })
    await page.locator('.layout-transition').waitFor({ state: 'visible' })
    record({
      scenario: 'navigation',
      metric: routePath,
      value: Date.now() - start,
      unit: 'ms',
      meta: { kind: 'direct' }
    }, browser)
  }
})

test('scroll: about page frame pacing', async ({ page }, testInfo) => {
  const browser = testInfo.project.name
  await preparePerfPage(page)

  const sample = await sampleScrollFramePacing(page, '/about/', 14, 220)
  record({ scenario: 'scroll', metric: 'about_p50', value: sample.p50, unit: 'ms', meta: { frameCount: sample.frameCount } }, browser)
  record({ scenario: 'scroll', metric: 'about_p95', value: sample.p95, unit: 'ms' }, browser)
  record({ scenario: 'scroll', metric: 'about_jank_frames', value: sample.jankFrames, unit: 'frames' }, browser)
  record({ scenario: 'scroll', metric: 'about_max_gap', value: sample.maxGap, unit: 'ms' }, browser)
})

test('scroll: archive page frame pacing', async ({ page }, testInfo) => {
  const browser = testInfo.project.name
  await preparePerfPage(page)

  const sample = await sampleScrollFramePacing(page, '/archive/', 10, 280)
  record({ scenario: 'scroll', metric: 'archive_p50', value: sample.p50, unit: 'ms', meta: { frameCount: sample.frameCount } }, browser)
  record({ scenario: 'scroll', metric: 'archive_p95', value: sample.p95, unit: 'ms' }, browser)
  record({ scenario: 'scroll', metric: 'archive_jank_frames', value: sample.jankFrames, unit: 'frames' }, browser)
})

test('interaction: search modal', async ({ page }, testInfo) => {
  const browser = testInfo.project.name
  await preparePerfPage(page)

  const timings = await measureSearchModalReady(page)
  record({ scenario: 'search', metric: 'open', value: timings.openMs, unit: 'ms' }, browser)
  record({ scenario: 'search', metric: 'index_ready', value: timings.indexReadyMs, unit: 'ms' }, browser)
  record({ scenario: 'search', metric: 'first_result', value: timings.resultMs, unit: 'ms' }, browser)
})

test('interaction: lightbox attach and open', async ({ page }, testInfo) => {
  const browser = testInfo.project.name
  await preparePerfPage(page)

  const timings = await measureLightboxAttach(page, '/the-story-of-setool/')
  record({ scenario: 'lightbox', metric: 'attach_handlers', value: timings.attachMs, unit: 'ms' }, browser)
  record({ scenario: 'lightbox', metric: 'open_overlay', value: timings.openMs, unit: 'ms' }, browser)
})
