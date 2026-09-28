import type { Page } from '@playwright/test'
import { test, expect } from './fixtures'

/** `src/routes/(posts)/cool-stuff/+page.md`: `---`-separated segments (see remark-slide-split). */
const SLIDES_EXAMPLE_COUNT = 12

const counter = (n: number) => new RegExp(`^${n}\\s*/\\s*${SLIDES_EXAMPLE_COUNT}$`)
const active = (page: Page) => page.locator('section.slide.active')
const deckN = (page: Page) => page.locator('.deck-n')

/** The deck labels its slides on mount, so this doubles as a hydration check in reading mode. */
async function hydrated(page: Page) {
  await expect(page.locator('section.slide').first()).toHaveAttribute('aria-roledescription', 'slide')
}

test.describe('slide deck (mdsvex slides: true)', () => {
  test('reading mode: all slide sections are stacked, with a present cue', async ({ page }) => {
    const res = await page.goto('/cool-stuff/', { waitUntil: 'domcontentloaded' })
    expect(res?.ok()).toBeTruthy()
    await expect(page.getByRole('heading', { name: /This site in one deck/i })).toBeVisible()
    await expect(page.locator('section.slide')).toHaveCount(SLIDES_EXAMPLE_COUNT)
    await expect(page.locator('.deck-go')).toBeVisible()
    await expect(page.locator('.deck-ui')).toBeHidden()
    await hydrated(page)
    await expect(page.locator('section.slide.active')).toHaveCount(0)
  })

  test('?present: region, counter and one active slide', async ({ page }) => {
    await page.goto('/cool-stuff/?present', { waitUntil: 'domcontentloaded' })
    // attached, not visible: every slide is position: fixed, so the region itself has no box
    await expect(page.getByRole('region', { name: 'Slide deck' })).toBeAttached()
    await expect(deckN(page)).toHaveText(counter(1))
    await expect(deckN(page)).toHaveAttribute('aria-live', 'polite')
    await expect(active(page)).toHaveCount(1)
    await expect(active(page)).toHaveAttribute('data-slide', '0')
    await expect(page.locator('section.slide')).toHaveCount(SLIDES_EXAMPLE_COUNT)
  })

  test('legacy ?mode=slides&slide=N still enters the deck and is rewritten to ?present', async ({ page }) => {
    await page.goto('/cool-stuff/?mode=slides&slide=9', { waitUntil: 'domcontentloaded' })
    await expect(deckN(page)).toHaveText(counter(10))
    await expect(active(page)).toHaveAttribute('data-slide', '9')
    await expect(active(page).getByRole('heading', { name: /Stagger utility/i })).toBeVisible()
    await expect(page).toHaveURL(/\?present&slide=9$/)
  })

  test('inactive slides are inert and hidden; the active one has focus', async ({ page }) => {
    await page.goto('/cool-stuff/?present&slide=1', { waitUntil: 'domcontentloaded' })
    await expect(active(page)).toHaveAttribute('data-slide', '1')
    await expect(active(page).getByRole('heading', { name: /Quick links/i })).toBeVisible()
    await expect(active(page).getByRole('heading', { name: /This site in one deck/i })).toHaveCount(0)
    await expect(page.locator('section[data-slide="0"]')).toHaveJSProperty('inert', true)
    await expect(page.locator('section[data-slide="2"]')).toHaveJSProperty('inert', true)
    await expect(active(page)).toHaveJSProperty('inert', false)
    await expect(page.locator('section[data-slide="0"]').getByRole('heading', { name: /This site in one deck/i })).toBeHidden()
    await expect(active(page)).toBeFocused()
  })

  test('one key press moves exactly one slide; URL follows', async ({ page }) => {
    await page.goto('/cool-stuff/?present&slide=3', { waitUntil: 'domcontentloaded' })
    await expect(deckN(page)).toHaveText(counter(4))
    await page.keyboard.press('ArrowRight')
    await expect(deckN(page)).toHaveText(counter(5))
    await expect(page).toHaveURL(/\?present&slide=4$/)
    await page.keyboard.press('ArrowLeft')
    await page.keyboard.press('ArrowLeft')
    await expect(deckN(page)).toHaveText(counter(3))
    await page.keyboard.press(' ')
    await expect(deckN(page)).toHaveText(counter(4))
    await page.keyboard.press('PageDown')
    await expect(deckN(page)).toHaveText(counter(5))
  })

  test('Home / End jump, and the thread fills from 0% to 100%', async ({ page }) => {
    await page.goto('/cool-stuff/?present&slide=3', { waitUntil: 'domcontentloaded' })
    const bar = page.locator('.deck-thread b')
    await expect(deckN(page)).toHaveText(counter(4))
    await page.keyboard.press('Home')
    await expect(deckN(page)).toHaveText(counter(1))
    await expect(page).toHaveURL(/\?present$/)
    expect(await bar.evaluate(el => (el as HTMLElement).style.width)).toBe('0%')
    await page.keyboard.press('End')
    await expect(deckN(page)).toHaveText(counter(SLIDES_EXAMPLE_COUNT))
    await expect(active(page).getByRole('heading', { name: /Next steps/i })).toBeVisible()
    expect(await bar.evaluate(el => (el as HTMLElement).style.width)).toBe('100%')
    await expect(page.locator('.deck-thread i')).toHaveCount(SLIDES_EXAMPLE_COUNT)
  })

  test('p presents from the slide in view; Esc exits in place and restores scroll and focus', async ({ page }) => {
    await page.goto('/cool-stuff/', { waitUntil: 'domcontentloaded' })
    await hydrated(page)
    const target = page.locator('section[data-slide="3"]')
    await target.evaluate(el => el.scrollIntoView({ block: 'start', behavior: 'instant' }))
    const y = await page.evaluate(() => scrollY)
    await page.keyboard.press('p')
    await expect(active(page)).toHaveAttribute('data-slide', '3')
    await expect(page).toHaveURL(/\?present&slide=3$/)
    await page.keyboard.press('Escape')
    await expect(page.locator('.deck-ui')).toBeHidden()
    await expect(page.locator('section.slide.active')).toHaveCount(0)
    await expect(page).toHaveURL(/\/cool-stuff\/$/)
    expect(Math.abs((await page.evaluate(() => scrollY)) - y)).toBeLessThan(4)
    await expect(page.locator('section[data-slide="0"]')).toHaveJSProperty('inert', false)
  })

  test('present button: Esc returns focus to it; Space on a button does not advance', async ({ page }) => {
    await page.goto('/cool-stuff/', { waitUntil: 'domcontentloaded' })
    await hydrated(page)
    await page.locator('.deck-go').click()
    await expect(deckN(page)).toHaveText(counter(1))
    await page.locator('.deck-x').focus()
    await page.keyboard.press(' ')
    await expect(page.locator('.deck-ui')).toBeHidden()
    await expect(page.locator('.deck-go')).toBeFocused()
  })

  test('keys typed in a form field or with a modifier are ignored', async ({ page }) => {
    await page.goto('/cool-stuff/', { waitUntil: 'domcontentloaded' })
    await hydrated(page)
    await page.evaluate(() => {
      const i = document.createElement('input')
      i.id = 'e2e-field'
      document.querySelector('.post-prose')!.prepend(i)
    })
    await page.locator('#e2e-field').focus()
    await page.keyboard.press('p')
    await expect(page.locator('.deck-ui')).toBeHidden()
    await page.locator('#e2e-field').blur()
    await page.keyboard.press('Alt+p')
    await expect(page.locator('.deck-ui')).toBeHidden()
  })

  test('no uncaught errors after hydration while presenting', async ({ page }) => {
    const thrown: string[] = []
    page.on('pageerror', err => thrown.push(err.message))
    await page.goto('/cool-stuff/?present', { waitUntil: 'networkidle' })
    await expect(deckN(page)).toBeVisible()
    expect(thrown, thrown.join('; ')).toEqual([])
  })

  test('Diagrams & code embeds follows Features and Mermaid renders SVG diagrams', async ({ page }) => {
    const thrown: string[] = []
    page.on('pageerror', err => thrown.push(err.message))

    await page.goto('/cool-stuff/?present&slide=3', { waitUntil: 'networkidle' })
    await expect(active(page)).toHaveAttribute('data-slide', '3')
    await expect(active(page).getByRole('heading', { name: /^Features$/i })).toBeVisible()

    await page.keyboard.press('ArrowRight')
    await expect(page).toHaveURL(/[?&]slide=4(?:&|$)/)
    await expect(active(page)).toHaveAttribute('data-slide', '4')
    await expect(active(page).getByRole('heading', { name: /Diagrams & code embeds/i })).toBeVisible()

    // Two <Mermaid> blocks on this slide; each should produce an <svg> after client render.
    await expect(page.locator('section.slide[data-slide="4"] .mermaid svg')).toHaveCount(2, { timeout: 25_000 })
    const bad = thrown.filter(m => /is not defined/i.test(m))
    expect(bad, bad.join('; ')).toEqual([])
    expect(thrown, thrown.join('; ')).toEqual([])
  })

  test('/cool-stuff/deck and /slides-example hand off to ?present', async ({ page }) => {
    await page.goto('/cool-stuff/deck/', { waitUntil: 'domcontentloaded' })
    await expect(page).toHaveURL(/\/cool-stuff\/\?present/, { timeout: 15_000 })
    await expect(deckN(page)).toHaveText(counter(1))

    await page.goto('/slides-example/', { waitUntil: 'domcontentloaded' })
    await expect(page).toHaveURL(/\/cool-stuff\/\?present/, { timeout: 15_000 })
  })
})
