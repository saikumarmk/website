import { test, expect } from './fixtures'

test.describe('posts feed', () => {
  test('GET /posts.json returns a non-empty JSON array', async ({ request }) => {
    const res = await request.get('/posts.json')
    expect(res.ok(), `posts.json → HTTP ${res.status()}`).toBeTruthy()
    const data = await res.json()
    expect(Array.isArray(data)).toBeTruthy()
    expect(data.length).toBeGreaterThan(0)
  })

  test('writing index lists posts on topic shelves', async ({ page }) => {
    await page.goto('/archive/', { waitUntil: 'networkidle' })
    await expect(page.getByRole('heading', { name: 'Writing', level: 1 })).toBeVisible()
    await expect(page.getByRole('tab', { name: /^Everything/ })).toHaveAttribute('aria-selected', 'true')
    await expect(page.locator('#writing-shelves li[data-slug]').first()).toBeVisible()
  })
})
