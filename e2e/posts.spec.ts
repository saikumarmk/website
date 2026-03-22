import { test, expect } from './fixtures'

test.describe('posts feed', () => {
  test('GET /posts.json returns a non-empty JSON array', async ({ request }) => {
    const res = await request.get('/posts.json')
    expect(res.ok(), `posts.json → HTTP ${res.status()}`).toBeTruthy()
    const data = await res.json()
    expect(Array.isArray(data)).toBeTruthy()
    expect(data.length).toBeGreaterThan(0)
  })

  test('archive lists posts (feed applied after client load)', async ({ page }) => {
    await page.goto('/archive/', { waitUntil: 'networkidle' })
    await expect(page.getByRole('heading', { name: 'Archive', exact: true })).toBeVisible()
    // Default tab is Blog; if every post is a learning note, that view is empty. "All" includes everything.
    await page.getByRole('button', { name: /^All \(\d+\)$/ }).click()
    await expect(page.getByRole('heading', { name: 'No posts found' })).toHaveCount(0)
  })
})
