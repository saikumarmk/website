import { test, expect } from './fixtures'

/** Core routes touched by recent config / dependency cleanup */
const paths = ['/', '/about', '/portfolio', '/archive', '/growth/2026', '/playbook']

for (const path of paths) {
  test(`GET ${path} returns HTML`, async ({ page }) => {
    const res = await page.goto(path, { waitUntil: 'domcontentloaded' })
    expect(res?.ok(), `${path} → HTTP ${res?.status()}`).toBeTruthy()
    await expect(page.locator('body')).toBeVisible()
    const html = await page.content()
    expect(html.length).toBeGreaterThan(400)
  })
}

test('search index JSON is a non-empty array', async ({ request }) => {
  const res = await request.get('/search-index.json')
  expect(res.ok(), `search-index → HTTP ${res.status()}`).toBeTruthy()
  const data = await res.json()
  expect(Array.isArray(data)).toBeTruthy()
  expect(data.length).toBeGreaterThan(0)
})
