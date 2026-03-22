import { test, expect } from './fixtures'

/** `urara/cool-stuff/+page.md`: `---`-separated segments (see remark-slide-split). */
const SLIDES_EXAMPLE_COUNT = 12

const counter = (n: number) => new RegExp(`${n}\\s*/\\s*${SLIDES_EXAMPLE_COUNT}`)

test.describe('slide deck (mdsvex slides: true)', () => {
  test('article mode: all slide sections exist as stacked sections', async ({ page }) => {
    const res = await page.goto('/cool-stuff/', { waitUntil: 'domcontentloaded' })
    expect(res?.ok()).toBeTruthy()
    await expect(page.getByRole('heading', { name: /This site in one deck/i })).toBeVisible()
    const sections = page.locator('section.slide')
    await expect(sections).toHaveCount(SLIDES_EXAMPLE_COUNT)
  })

  test('deck mode: shell, region, and counter show total slide count', async ({ page }) => {
    const res = await page.goto('/cool-stuff/?mode=slides', { waitUntil: 'domcontentloaded' })
    expect(res?.ok()).toBeTruthy()
    await expect(page.locator('.deck-root.deck-slides')).toBeVisible()
    await expect(page.getByRole('region', { name: 'Slide deck' })).toBeVisible()
    const ctr = page.locator('.slide-deck-counter')
    await expect(ctr).toBeVisible()
    await expect(ctr).toHaveText(counter(1))
  })

  test('deck mode: exactly one active slide section at a time', async ({ page }) => {
    await page.goto('/cool-stuff/?mode=slides&slide=0', { waitUntil: 'domcontentloaded' })
    await expect(page.locator('section.slide.active')).toHaveCount(1)
    await expect(page.locator('section.slide')).toHaveCount(SLIDES_EXAMPLE_COUNT)
  })

  test('deck mode: active slide is a single segment (not full document in every slide)', async ({
    page
  }) => {
    await page.goto('/cool-stuff/?mode=slides&slide=1', { waitUntil: 'domcontentloaded' })
    const active = page.locator('section.slide.active')
    await expect(active).toHaveAttribute('data-slide', '1')
    await expect(active.getByRole('heading', { name: /This site in one deck/i })).toHaveCount(0)
    await expect(active.getByRole('heading', { name: /Quick links/i })).toBeVisible()
  })

  test('deck mode: first slide shows title slide content', async ({ page }) => {
    await page.goto('/cool-stuff/?mode=slides', { waitUntil: 'domcontentloaded' })
    await expect(page.locator('section.slide.active')).toHaveAttribute('data-slide', '0')
    await expect(
      page.locator('section.slide.active').getByRole('heading', {
        name: /This site in one deck/i
      })
    ).toBeVisible()
    await expect(
      page.locator('section[data-slide="1"]').getByRole('heading', { name: /Quick links/i })
    ).toBeHidden()
    await expect(
      page.locator('section[data-slide="2"]').getByRole('heading', {
        name: /Navigation & main pages/i
      })
    ).toBeHidden()
  })

  test('keyboard Space: advances to slide 2 (Quick links)', async ({ page }) => {
    await page.goto('/cool-stuff/?mode=slides&slide=0', { waitUntil: 'domcontentloaded' })
    await expect(page.locator('.slide-deck-counter')).toHaveText(counter(1))
    await page.keyboard.press(' ')
    await expect(page.locator('.slide-deck-counter')).toHaveText(counter(2))
    await expect(page.locator('section.slide.active')).toHaveAttribute('data-slide', '1')
    await expect(
      page.locator('section.slide.active').getByRole('heading', {
        name: /Quick links/i
      })
    ).toBeVisible()
    await expect(
      page.locator('section[data-slide="0"]').getByRole('heading', {
        name: /This site in one deck/i
      })
    ).toBeHidden()
    await expect(
      page.locator('section[data-slide="2"]').getByRole('heading', {
        name: /Navigation & main pages/i
      })
    ).toBeHidden()
  })

  test('keyboard ArrowRight / ArrowLeft: navigate and URL slide param updates', async ({ page }) => {
    await page.goto('/cool-stuff/?mode=slides&slide=0', { waitUntil: 'domcontentloaded' })
    await expect(page.locator('.deck-root.deck-slides')).toBeVisible()
    await expect(page).toHaveURL(/[?&]slide=0(?:&|$)/)
    await page.keyboard.press('ArrowRight')
    await expect(page).toHaveURL(/[?&]slide=1(?:&|$)/)
    await expect(page.locator('.slide-deck-counter')).toHaveText(counter(2))
    await expect(page.locator('section.slide.active')).toHaveAttribute('data-slide', '1')
    await expect(
      page.locator('section[data-slide="1"]').getByRole('heading', { name: /Quick links/i })
    ).toBeVisible()
    await expect(
      page.locator('section[data-slide="0"]').getByRole('heading', {
        name: /This site in one deck/i
      })
    ).toBeHidden()
    await page.keyboard.press('ArrowLeft')
    await expect(page).toHaveURL(/[?&]slide=0(?:&|$)/)
    await expect(page.locator('.slide-deck-counter')).toHaveText(counter(1))
    await expect(page.locator('section.slide.active')).toHaveAttribute('data-slide', '0')
    await expect(
      page.locator('section[data-slide="0"]').getByRole('heading', {
        name: /This site in one deck/i
      })
    ).toBeVisible()
    await expect(
      page.locator('section[data-slide="1"]').getByRole('heading', { name: /Quick links/i })
    ).toBeHidden()
  })

  test('keyboard Home / End: jump to first and last slide', async ({ page }) => {
    await page.goto('/cool-stuff/?mode=slides&slide=3', { waitUntil: 'domcontentloaded' })
    await expect(page.locator('.deck-root.deck-slides')).toBeVisible()
    await page.keyboard.press('Home')
    await expect(page.locator('.slide-deck-counter')).toHaveText(counter(1))
    await expect(
      page.locator('section.slide.active').getByRole('heading', {
        name: /This site in one deck/i
      })
    ).toBeVisible()
    await expect(
      page.locator('section[data-slide="3"]').getByRole('heading', {
        name: /Features/i
      })
    ).toBeHidden()
    await page.keyboard.press('End')
    await expect(page.locator('.slide-deck-counter')).toHaveText(
      new RegExp(`${SLIDES_EXAMPLE_COUNT}\\s*/\\s*${SLIDES_EXAMPLE_COUNT}`)
    )
    await expect(
      page.locator('section.slide.active').getByRole('heading', {
        name: /Next steps/i
      })
    ).toBeVisible()
    await expect(
      page.locator('section[data-slide="0"]').getByRole('heading', {
        name: /This site in one deck/i
      })
    ).toBeHidden()
  })

  test('initial URL slide=9 loads Stagger utility segment', async ({ page }) => {
    await page.goto('/cool-stuff/?mode=slides&slide=9', { waitUntil: 'domcontentloaded' })
    await expect(page.locator('.slide-deck-counter')).toHaveText(counter(10))
    await expect(page.locator('section.slide.active')).toHaveAttribute('data-slide', '9')
    await expect(
      page.locator('section.slide.active').getByRole('heading', {
        name: /Stagger utility/i
      })
    ).toBeVisible()
    await expect(
      page.locator('section[data-slide="0"]').getByRole('heading', {
        name: /This site in one deck/i
      })
    ).toBeHidden()
    await expect(
      page.locator('section[data-slide="11"]').getByRole('heading', { name: /Next steps/i })
    ).toBeHidden()
  })

  test('fixed progress bar width reflects position (0% first, 100% last)', async ({ page }) => {
    await page.goto('/cool-stuff/?mode=slides&slide=0', { waitUntil: 'domcontentloaded' })
    await expect(page.locator('.deck-root.deck-slides')).toBeVisible()
    const bar = page.locator('.slide-deck-progress-bar')
    await expect(bar).toBeAttached()
    const w0 = await bar.evaluate(el => (el as HTMLElement).style.width)
    await page.keyboard.press('End')
    const wLast = await bar.evaluate(el => (el as HTMLElement).style.width)
    expect(w0).toMatch(/^0%$/)
    expect(wLast).toMatch(/^100%$/)
  })

  test('no uncaught errors after hydration in deck mode', async ({ page }) => {
    const thrown: string[] = []
    page.on('pageerror', err => thrown.push(err.message))
    await page.goto('/cool-stuff/?mode=slides', { waitUntil: 'networkidle' })
    await expect(page.locator('.deck-root.deck-slides')).toBeVisible()
    expect(thrown, thrown.join('; ')).toEqual([])
  })

  test('deck mode: no ReferenceError for layout embeds (SlabTitle / Mermaid) on client', async ({
    page
  }) => {
    const thrown: string[] = []
    page.on('pageerror', err => thrown.push(err.message))
    await page.goto('/cool-stuff/?mode=slides&slide=4', { waitUntil: 'networkidle' })
    await expect(page.locator('section.slide.active')).toHaveAttribute('data-slide', '4')
    await expect(
      page.locator('section.slide.active').getByRole('heading', { name: /Diagrams & code embeds/i })
    ).toBeVisible()
    await expect(page.locator('.deck-root.deck-slides')).toBeVisible()
    const bad = thrown.filter(
      m => /SlabTitle is not defined|Mermaid is not defined|PythonCode is not defined/i.test(m)
    )
    expect(bad, bad.join('; ')).toEqual([])
  })

  test('deck mode: Diagrams & code embeds follows Features and Mermaid renders SVG diagrams', async ({
    page
  }) => {
    const thrown: string[] = []
    page.on('pageerror', err => thrown.push(err.message))

    await page.goto('/cool-stuff/?mode=slides&slide=3', { waitUntil: 'networkidle' })
    await expect(page.locator('section.slide.active')).toHaveAttribute('data-slide', '3')
    await expect(
      page.locator('section.slide.active').getByRole('heading', { name: /^Features$/i })
    ).toBeVisible()

    await page.keyboard.press('ArrowRight')
    await expect(page).toHaveURL(/[?&]slide=4(?:&|$)/)
    await expect(page.locator('section.slide.active')).toHaveAttribute('data-slide', '4')
    await expect(
      page.locator('section.slide.active').getByRole('heading', { name: /Diagrams & code embeds/i })
    ).toBeVisible()

    const diagramSlide = page.locator('section.slide[data-slide="4"]')
    // Two <Mermaid> blocks on this slide; each should produce an <svg> after client render.
    await expect(diagramSlide.locator('.mermaid svg')).toHaveCount(2, { timeout: 25_000 })
    expect(thrown, thrown.join('; ')).toEqual([])
  })

  test('legacy /slides-example redirects to cool-stuff deck', async ({ page }) => {
    await page.goto('/slides-example/', { waitUntil: 'domcontentloaded' })
    await expect(page).toHaveURL(/\/cool-stuff\/?\?mode=slides/)
  })
})
