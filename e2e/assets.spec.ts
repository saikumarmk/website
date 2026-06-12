import { test, expect } from './fixtures'
import { assets } from '../src/lib/config/assets'

test.describe('static assets', () => {
  test('résumé PDF is served', async ({ request }) => {
    const res = await request.get(assets.resume)
    expect(res.ok(), `${assets.resume} → HTTP ${res.status()}`).toBeTruthy()
    expect(res.headers()['content-type']).toMatch(/pdf/i)
  })

  test('thesis PDF is served', async ({ request }) => {
    const res = await request.get(assets.thesis)
    expect(res.ok(), `${assets.thesis} → HTTP ${res.status()}`).toBeTruthy()
    expect(res.headers()['content-type']).toMatch(/pdf/i)
  })

  test('Canva logo is served', async ({ request }) => {
    const res = await request.get(assets.canvaLogo)
    expect(res.ok(), `${assets.canvaLogo} → HTTP ${res.status()}`).toBeTruthy()
  })

  test('Canva wordmark SVG is served', async ({ request }) => {
    const res = await request.get(assets.canvaWordmark)
    expect(res.ok(), `${assets.canvaWordmark} → HTTP ${res.status()}`).toBeTruthy()
    expect(res.headers()['content-type']).toMatch(/svg/i)
  })

  test('résumé links bypass SvelteKit client routing', async ({ page }) => {
    await page.goto('/about/', { waitUntil: 'domcontentloaded' })
    const link = page.getByRole('link', { name: /^Résumé$/i }).first()
    await expect(link).toHaveAttribute('href', assets.resume)
    await expect(link).toHaveAttribute('data-sveltekit-reload', '')
    await expect(link).toHaveAttribute('target', '_blank')
  })
})

test.describe('portfolio images', () => {
  test('portfolio timeline shows Canva brand image', async ({ page }) => {
    const res = await page.goto('/portfolio/', { waitUntil: 'domcontentloaded' })
    expect(res?.ok()).toBeTruthy()

    const canvaImg = page.locator('img[alt="Canva"]').first()
    await expect(canvaImg).toBeVisible({ timeout: 10_000 })
    await expect(canvaImg).toHaveAttribute('src', assets.canvaLogo)
  })
})

test.describe('about page mobile', () => {
  test.use({ viewport: { width: 390, height: 844 } })

  test('about bio renders prose without horizontal overflow', async ({ page }) => {
    await page.goto('/about/', { waitUntil: 'domcontentloaded' })
    await expect(page.getByRole('heading', { name: /Hi, I'm Sai/i })).toBeVisible()

    const overflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth + 2
    })
    expect(overflow).toBe(false)
  })
})
