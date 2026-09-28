import { test, expect } from './fixtures'
import { assets } from '../src/lib/config/assets'

/** Core routes touched by recent config / dependency cleanup */
const paths = ['/', '/about', '/portfolio', '/cv', '/archive', '/growth/2026', '/playbook', '/dex', '/garden']

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

test('résumé link on the CV page resolves', async ({ page, request }) => {
  await page.goto('/cv/', { waitUntil: 'domcontentloaded' })
  await expect(page.locator(`a[href="${assets.resume}"]`).first()).toBeAttached()

  const res = await request.get(assets.resume)
  expect(res.ok()).toBeTruthy()
})

test('home has the about and experience sections', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' })
  await expect(page.getByRole('heading', { level: 1, name: /Hi, I'm Sai/i })).toBeVisible()
  await expect(page.locator('#about')).toBeAttached()
  await expect(page.locator('figure.plate figcaption a')).toHaveAttribute('href', /^\/[a-z0-9-]+\/$/)

  const head = page.locator('#experience button.rec-head').first()
  const body = page.locator(`#${await head.getAttribute('aria-controls')}`)
  await expect(head).toHaveAttribute('aria-expanded', 'false')
  await expect(body).toBeHidden()
  await expect(async () => {
    await head.click()
    await expect(head).toHaveAttribute('aria-expanded', 'true', { timeout: 250 })
  }).toPass({ timeout: 10000 })
  await expect(body).toBeVisible()
})

test('CV page renders the sheet with a print button', async ({ page }) => {
  await page.goto('/cv/', { waitUntil: 'domcontentloaded' })
  await expect(page.locator('article.sheet h1')).toHaveText('Sai Kumar Murali Krishnan')
  await expect(page.getByRole('button', { name: /print/i })).toBeVisible()
  await expect(page.locator('article.sheet section').first()).toBeVisible()
})

for (const [from, to] of [
  ['/about/', '/#about'],
  ['/portfolio/', '/#experience']
]) {
  test(`${from} redirects to ${to}`, async ({ page, request }) => {
    const html = await (await request.get(from)).text()
    expect(html).toContain(`url=${to}`)
    await page.goto(from)
    await expect(page).toHaveURL(new RegExp(`${to}$`))
  })
}

test('search modal finishes loading and returns a result', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' })
  const input = page.locator('#search-title')
  // The button only works once the page has hydrated, so retry until the modal opens.
  await expect(async () => {
    await page.getByRole('button', { name: /^search/i }).click()
    await expect(input).toBeVisible({ timeout: 250 })
  }).toPass({ timeout: 10000 })
  await expect(input).not.toBeDisabled({ timeout: 20000 })
  await input.fill('About')
  await expect(page.locator('[role="dialog"][aria-modal="true"] a[href="/about"]')).toBeVisible({
    timeout: 5000
  })
})
