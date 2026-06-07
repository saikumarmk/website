import type { Page } from '@playwright/test'
import fs from 'node:fs'
import path from 'node:path'

export type PerfMetric = {
  browser: string
  scenario: string
  metric: string
  value: number
  unit: string
  meta?: Record<string, unknown>
}

const metrics: PerfMetric[] = []

export function record(metric: Omit<PerfMetric, 'browser'> & { browser?: string }, browser: string) {
  metrics.push({ ...metric, browser: metric.browser ?? browser })
}

export function getMetrics() {
  return [...metrics]
}

export function writePerfReport() {
  const dir = path.join('test-results', 'perf')
  fs.mkdirSync(dir, { recursive: true })

  const stamp = new Date().toISOString().replace(/[:.]/g, '-')
  const out = path.join(dir, `report-${stamp}.json`)
  fs.writeFileSync(out, JSON.stringify(metrics, null, 2))

  const byBrowser = new Map<string, PerfMetric[]>()
  for (const m of metrics) {
    const list = byBrowser.get(m.browser) ?? []
    list.push(m)
    byBrowser.set(m.browser, list)
  }

  console.log('\n=== Browser perf summary ===')
  for (const [browser, rows] of byBrowser) {
    console.log(`\n[${browser}]`)
    for (const row of rows) {
      const meta = row.meta ? ` ${JSON.stringify(row.meta)}` : ''
      console.log(`  ${row.scenario} / ${row.metric}: ${row.value.toFixed(2)}${row.unit}${meta}`)
    }
  }
  console.log(`\nWrote ${out}\n`)

  return out
}

export function resetMetrics() {
  metrics.length = 0
}

/** Normalize motion/background/transition for comparable cross-browser numbers. */
export async function preparePerfPage(page: Page) {
  await page.emulateMedia({ reducedMotion: 'reduce' })

  await page.addInitScript(() => {
    localStorage.setItem('bg-mode', 'none')
    localStorage.setItem('route-transition-policy', 'none')
  })

  await page.goto('/', { waitUntil: 'load' })

  await page.evaluate(async () => {
    if ('serviceWorker' in navigator) {
      const regs = await navigator.serviceWorker.getRegistrations()
      await Promise.all(regs.map(r => r.unregister()))
    }
    const keys = await caches.keys()
    await Promise.all(keys.map(k => caches.delete(k)))
  })
}

export async function measureSpaNavigation(
  page: Page,
  linkText: RegExp | string,
  expectedPath: string
): Promise<number> {
  const link = page.getByRole('link', { name: linkText }).first()
  await link.waitFor({ state: 'visible' })

  const start = Date.now()
  await link.click()
  await page.waitForURL(`**${expectedPath}**`, { waitUntil: 'commit' })
  await page.locator('.layout-transition').waitFor({ state: 'visible' })
  await page.waitForLoadState('domcontentloaded')
  return Date.now() - start
}

export type ScrollSample = {
  p50: number
  p95: number
  jankFrames: number
  maxGap: number
  frameCount: number
}

export async function sampleScrollFramePacing(
  page: Page,
  targetPath: string,
  steps = 12,
  stepPx = 240
): Promise<ScrollSample> {
  await page.goto(targetPath, { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(300)

  return page.evaluate(
    async ({ steps, stepPx }) => {
      const gaps: number[] = []
      let last = performance.now()
      let running = true
      let frameCount = 0

      const sampler = (now: number) => {
        if (!running) return
        gaps.push(now - last)
        last = now
        frameCount++
        requestAnimationFrame(sampler)
      }
      requestAnimationFrame(sampler)

      for (let i = 1; i <= steps; i++) {
        window.scrollTo({ top: i * stepPx, behavior: 'auto' })
        await new Promise<void>(r => requestAnimationFrame(() => requestAnimationFrame(() => r())))
      }

      await new Promise<void>(r => setTimeout(r, 200))
      running = false

      const sorted = [...gaps].sort((a, b) => a - b)
      const p50 = sorted[Math.floor(sorted.length * 0.5)] ?? 0
      const p95 = sorted[Math.floor(sorted.length * 0.95)] ?? 0
      const jankFrames = gaps.filter(g => g > 32).length
      const maxGap = sorted.at(-1) ?? 0

      return { p50, p95, jankFrames, maxGap, frameCount }
    },
    { steps, stepPx }
  )
}

export async function measureSearchModalReady(page: Page): Promise<{ openMs: number; indexReadyMs: number; resultMs: number }> {
  await page.goto('/', { waitUntil: 'domcontentloaded' })

  const openStart = Date.now()
  await page.getByRole('button', { name: 'search' }).click()
  await page.locator('[role="dialog"][aria-modal="true"]').waitFor({ state: 'visible' })
  const openMs = Date.now() - openStart

  const indexStart = Date.now()
  const input = page.locator('#search-title')
  await input.waitFor({ state: 'visible' })
  await input.waitFor({ state: 'attached' })
  await page.waitForFunction(() => {
    const el = document.querySelector('#search-title') as HTMLInputElement | null
    return el && !el.disabled
  }, { timeout: 30_000 })
  const indexReadyMs = Date.now() - indexStart

  const resultStart = Date.now()
  await input.fill('About')
  await page.locator('[role="dialog"][aria-modal="true"] a[href="/about"]').waitFor({ state: 'visible', timeout: 10_000 })
  const resultMs = Date.now() - resultStart

  return { openMs, indexReadyMs, resultMs }
}

export async function measureLightboxAttach(page: Page, postPath: string): Promise<{ attachMs: number; openMs: number }> {
  await page.goto(postPath, { waitUntil: 'domcontentloaded' })

  const attachStart = Date.now()
  await page.waitForFunction(() => {
    const img = document.querySelector('.urara-prose img.lightbox-enabled, .prose img.lightbox-enabled')
    return !!img
  }, { timeout: 15_000 })
  const attachMs = Date.now() - attachStart

  const openStart = Date.now()
  await page.locator('.urara-prose img.lightbox-enabled, .prose img.lightbox-enabled').first().click()
  await page.getByRole('button', { name: 'Close lightbox' }).first().waitFor({ state: 'visible' })
  const openMs = Date.now() - openStart

  return { attachMs, openMs }
}
