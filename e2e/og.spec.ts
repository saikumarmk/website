import { test, expect } from './fixtures'

// the images are drawn after `vite build`, so only a preview of the build has them
test.skip(process.env.E2E_DEV === '1', 'link previews and flower favicons only exist in a build')

test.describe('link previews and favicons', () => {
  test('a post shares its own card and wears its flower in the tab', async ({ page, request }) => {
    await page.goto('/essence-associativity/', { waitUntil: 'domcontentloaded' })
    const og = await page.locator('meta[property="og:image"]').getAttribute('content')
    expect(og).toMatch(/^https?:\/\/[^/]+\/og\/essence-associativity\.png$/)
    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute('content', 'summary_large_image')

    const icons = await page.locator('link[rel="icon"]').evaluateAll(ls => ls.map(l => new URL((l as HTMLLinkElement).href).pathname))
    expect(icons).toEqual(['/og/essence-associativity-32.png', '/og/essence-associativity-16.png'])
    for (const path of [new URL(og!).pathname, ...icons]) {
      const res = await request.get(path!)
      expect(res.ok(), `${path} → HTTP ${res.status()}`).toBeTruthy()
      expect(res.headers()['content-type']).toMatch(/png/)
    }
  })

  test('other pages keep the site icon and share the site card', async ({ page, request }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    await expect(page.locator('link[rel="icon"]')).toHaveAttribute('href', '/assets/fatpika.png')
    const og = await page.locator('meta[property="og:image"]').getAttribute('content')
    expect(og).toMatch(/\/og\/site\.png$/)
    expect((await request.get(new URL(og!).pathname)).ok()).toBeTruthy()
  })
})
