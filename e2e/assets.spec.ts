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
    await page.goto('/cv/', { waitUntil: 'domcontentloaded' })
    const link = page.getByRole('link', { name: /^PDF résumé$/i }).first()
    await expect(link).toHaveAttribute('href', assets.resume)
    await expect(link).toHaveAttribute('data-sveltekit-reload', '')
    await expect(link).toHaveAttribute('target', '_blank')
  })
})

test.describe('home page mobile', () => {
  test.use({ viewport: { width: 390, height: 844 } })

  test('home renders without horizontal overflow', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    await expect(page.getByRole('heading', { name: /Hi, I'm Sai/i })).toBeVisible()

    const overflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth + 2
    })
    expect(overflow).toBe(false)
  })
})
