import { test, expect } from './fixtures'

/** slides-example/+page.md: 7 `---`-separated segments (see slideSegmentCount in frontmatter pipeline). */
const SLIDES_EXAMPLE_COUNT = 7

test.describe('slide deck (mdsvex slides: true)', () => {
  test('article mode: all slide sections exist as stacked sections', async ({ page }) => {
    const res = await page.goto('/slides-example/', { waitUntil: 'domcontentloaded' })
    expect(res?.ok()).toBeTruthy()
    await expect(page.getByRole('heading', { name: /Research-native slides/i })).toBeVisible()
    const sections = page.locator('section.slide-section')
    await expect(sections).toHaveCount(SLIDES_EXAMPLE_COUNT)
  })

  test('deck mode: shell, region, and counter show total slide count', async ({ page }) => {
    const res = await page.goto('/slides-example/?mode=slides', { waitUntil: 'domcontentloaded' })
    expect(res?.ok()).toBeTruthy()
    await expect(page.locator('.deck-root.deck-slides')).toBeVisible()
    await expect(page.getByRole('region', { name: 'Slide deck' })).toBeVisible()
    const counter = page.locator('.slide-deck-counter')
    await expect(counter).toBeVisible()
    await expect(counter).toHaveText(new RegExp(`1\\s*/\\s*${SLIDES_EXAMPLE_COUNT}`))
  })

  test('deck mode: exactly one active slide section at a time', async ({ page }) => {
    await page.goto('/slides-example/?mode=slides&slide=0', { waitUntil: 'domcontentloaded' })
    await expect(page.locator('section.slide-section.slide-section--active')).toHaveCount(1)
    await expect(page.locator('section.slide-section.slide-section--deck')).toHaveCount(
      SLIDES_EXAMPLE_COUNT
    )
  })

  test('deck mode: active slide is a single segment (not full document in every slide)', async ({
    page
  }) => {
    await page.goto('/slides-example/?mode=slides&slide=1', { waitUntil: 'domcontentloaded' })
    const active = page.locator('section.slide-section.slide-section--active')
    await expect(active).toHaveAttribute('data-slide-index', '1')
    /* If remark split failed, every slide would include the title h1 — this catches that. */
    await expect(active.getByRole('heading', { name: /Research-native slides/i })).toHaveCount(0)
    await expect(active.getByRole('heading', { name: /Math and prose/i })).toBeVisible()
  })

  test('deck mode: first slide shows title slide content', async ({ page }) => {
    await page.goto('/slides-example/?mode=slides', { waitUntil: 'domcontentloaded' })
    await expect(page.locator('section.slide-section.slide-section--active')).toHaveAttribute(
      'data-slide-index',
      '0'
    )
    await expect(
      page.locator('section.slide-section.slide-section--active').getByRole('heading', {
        name: /Research-native slides/i
      })
    ).toBeVisible()
    /* Other slides must not expose their headings (catches stacked-opacity bugs). */
    await expect(
      page.locator('section[data-slide-index="1"]').getByRole('heading', { name: /Math and prose/i })
    ).toBeHidden()
    await expect(
      page.locator('section[data-slide-index="2"]').getByRole('heading', { name: /Code-heavy slide/i })
    ).toBeHidden()
  })

  test('keyboard Space: advances to slide 2 (Math and prose)', async ({ page }) => {
    await page.goto('/slides-example/?mode=slides&slide=0', { waitUntil: 'domcontentloaded' })
    await expect(page.locator('.slide-deck-counter')).toHaveText(/1\s*\/\s*7/)
    await page.keyboard.press(' ')
    await expect(page.locator('.slide-deck-counter')).toHaveText(/2\s*\/\s*7/)
    await expect(page.locator('section.slide-section.slide-section--active')).toHaveAttribute(
      'data-slide-index',
      '1'
    )
    await expect(
      page.locator('section.slide-section.slide-section--active').getByRole('heading', {
        name: /Math and prose/i
      })
    ).toBeVisible()
    await expect(
      page.locator('section[data-slide-index="0"]').getByRole('heading', {
        name: /Research-native slides/i
      })
    ).toBeHidden()
    await expect(
      page.locator('section[data-slide-index="2"]').getByRole('heading', { name: /Code-heavy slide/i })
    ).toBeHidden()
  })

  test('keyboard ArrowRight / ArrowLeft: navigate and URL slide param updates', async ({ page }) => {
    await page.goto('/slides-example/?mode=slides&slide=0', { waitUntil: 'domcontentloaded' })
    await expect(page.locator('.deck-root.deck-slides')).toBeVisible()
    await expect(page).toHaveURL(/[?&]slide=0(?:&|$)/)
    await page.keyboard.press('ArrowRight')
    await expect(page).toHaveURL(/[?&]slide=1(?:&|$)/)
    await expect(page.locator('.slide-deck-counter')).toHaveText(/2\s*\/\s*7/)
    await expect(page.locator('section.slide-section.slide-section--active')).toHaveAttribute(
      'data-slide-index',
      '1'
    )
    await expect(
      page.locator('section[data-slide-index="1"]').getByRole('heading', { name: /Math and prose/i })
    ).toBeVisible()
    await expect(
      page.locator('section[data-slide-index="0"]').getByRole('heading', {
        name: /Research-native slides/i
      })
    ).toBeHidden()
    await page.keyboard.press('ArrowLeft')
    await expect(page).toHaveURL(/[?&]slide=0(?:&|$)/)
    await expect(page.locator('.slide-deck-counter')).toHaveText(/1\s*\/\s*7/)
    await expect(page.locator('section.slide-section.slide-section--active')).toHaveAttribute(
      'data-slide-index',
      '0'
    )
    await expect(
      page.locator('section[data-slide-index="0"]').getByRole('heading', {
        name: /Research-native slides/i
      })
    ).toBeVisible()
    await expect(
      page.locator('section[data-slide-index="1"]').getByRole('heading', { name: /Math and prose/i })
    ).toBeHidden()
  })

  test('keyboard Home / End: jump to first and last slide', async ({ page }) => {
    await page.goto('/slides-example/?mode=slides&slide=3', { waitUntil: 'domcontentloaded' })
    await expect(page.locator('.deck-root.deck-slides')).toBeVisible()
    await page.keyboard.press('Home')
    await expect(page.locator('.slide-deck-counter')).toHaveText(/1\s*\/\s*7/)
    await expect(
      page.locator('section.slide-section.slide-section--active').getByRole('heading', {
        name: /Research-native slides/i
      })
    ).toBeVisible()
    await expect(
      page.locator('section[data-slide-index="3"]').getByRole('heading', {
        name: /Two columns \(HTML\)/i
      })
    ).toBeHidden()
    await page.keyboard.press('End')
    await expect(page.locator('.slide-deck-counter')).toHaveText(
      new RegExp(`${SLIDES_EXAMPLE_COUNT}\\s*/\\s*${SLIDES_EXAMPLE_COUNT}`)
    )
    await expect(
      page.locator('section.slide-section.slide-section--active').getByRole('heading', {
        name: /Next steps/i
      })
    ).toBeVisible()
    await expect(
      page.locator('section[data-slide-index="0"]').getByRole('heading', {
        name: /Research-native slides/i
      })
    ).toBeHidden()
  })

  test('initial URL slide=5 loads fifth segment (Stagger utility)', async ({ page }) => {
    await page.goto('/slides-example/?mode=slides&slide=4', { waitUntil: 'domcontentloaded' })
    await expect(page.locator('.slide-deck-counter')).toHaveText(/5\s*\/\s*7/)
    await expect(page.locator('section.slide-section.slide-section--active')).toHaveAttribute(
      'data-slide-index',
      '4'
    )
    await expect(
      page.locator('section.slide-section.slide-section--active').getByRole('heading', {
        name: /Stagger utility/i
      })
    ).toBeVisible()
    await expect(
      page.locator('section[data-slide-index="0"]').getByRole('heading', {
        name: /Research-native slides/i
      })
    ).toBeHidden()
    await expect(
      page.locator('section[data-slide-index="6"]').getByRole('heading', { name: /Next steps/i })
    ).toBeHidden()
  })

  test('fixed progress bar width reflects position (0% first, 100% last)', async ({ page }) => {
    await page.goto('/slides-example/?mode=slides&slide=0', { waitUntil: 'domcontentloaded' })
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
    await page.goto('/slides-example/?mode=slides', { waitUntil: 'networkidle' })
    await expect(page.locator('.deck-root.deck-slides')).toBeVisible()
    expect(thrown, thrown.join('; ')).toEqual([])
  })
})
