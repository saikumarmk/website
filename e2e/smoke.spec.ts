import { test, expect } from './fixtures'
import { assets } from '../src/lib/config/assets'

/** Core routes touched by recent config / dependency cleanup */
const paths = ['/', '/about', '/portfolio', '/archive', '/growth/2026', '/playbook', '/garden']

for (const path of paths) {
  test(`GET ${path} returns HTML`, async ({ page }) => {
    const res = await page.goto(path, { waitUntil: 'domcontentloaded' })
    expect(res?.ok(), `${path} → HTTP ${res?.status()}`).toBeTruthy()
    await expect(page.locator('body')).toBeVisible()
    const html = await page.content()
    expect(html.length).toBeGreaterThan(400)
  })
}

test('search index JSON has posts and pre-serialized FlexSearch chunks', async ({ request }) => {
  const res = await request.get('/search-index.json')
  expect(res.ok(), `search-index → HTTP ${res.status()}`).toBeTruthy()
  const data = await res.json()
  expect(Array.isArray(data.posts)).toBeTruthy()
  expect(data.posts.length).toBeGreaterThan(0)
  expect(Array.isArray(data.serializedIndex)).toBeTruthy()
  expect(data.serializedIndex.length).toBeGreaterThan(0)
})

test('résumé link on homepage resolves', async ({ page, request }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' })
  await expect(page.locator(`a[href="${assets.resume}"]`).first()).toBeAttached()

  const res = await request.get(assets.resume)
  expect(res.ok()).toBeTruthy()
})

test('search modal finishes loading and returns a result', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' })
  const input = page.locator('#search-title')
  // The button only works once the page has hydrated, so retry until the modal opens.
  await expect(async () => {
    await page.getByRole('button', { name: 'search' }).click()
    await expect(input).toBeVisible({ timeout: 250 })
  }).toPass({ timeout: 10000 })
  await expect(input).not.toBeDisabled({ timeout: 20000 })
  await input.fill('About')
  await expect(page.locator('[role="dialog"][aria-modal="true"] a[href="/about"]')).toBeVisible({
    timeout: 5000
  })
})
