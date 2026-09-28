import { test, expect } from './fixtures'

test('garden: a row per year, flowers are labelled links with a tooltip', async ({ page }) => {
  await page.goto('/garden/')
  const rows = page.locator('.cloth svg[role="group"]')
  expect(await rows.count()).toBeGreaterThan(3)
  const flower = page.locator('.cloth svg a[href]').first()
  await expect(flower).toHaveAttribute('aria-label', /, \d{1,2} \w+ \d{4}$/)
  await expect(async () => {
    await flower.focus()
    await expect(page.locator('.cloth .tip')).toBeVisible({ timeout: 250 })
  }).toPass({ timeout: 10000 })
  await expect(page.locator('footer a[href="/garden"]')).toBeAttached()
})

test('playbook: parts come from the posts, knots toggle read state', async ({ page }) => {
  await page.goto('/playbook/')
  await expect(page.getByRole('heading', { level: 1, name: 'The Grad/Intern Playbook' })).toBeVisible()
  await expect(page.locator('.stem > li')).toHaveCount(5)
  await expect(page.locator('.stem .pt').first()).toHaveText('Part 1 · Timeline')
  await expect(page.locator('.also a[href="/hecs-and-csp"]')).toBeAttached()
  await expect(page.getByRole('link', { name: 'the FAQ' })).toHaveAttribute('href', '/guide-to-tech-faq')

  const knot = page.getByRole('button', { name: 'Part 1 read' })
  await expect(async () => {
    await knot.click()
    await expect(knot).toHaveAttribute('aria-pressed', 'true', { timeout: 250 })
  }).toPass({ timeout: 10000 })
  expect(await page.evaluate(() => localStorage.getItem('read:guide-to-tech-1'))).toBe('1')
  await expect(page.locator('.cta')).toContainText('Continue: Part 2')
})

test('series part: strip at the top, next part at the end', async ({ page }) => {
  await page.goto('/guide-to-tech-2/')
  await expect(page.locator('.strip')).toContainText('Part 2 of 5')
  await expect(page.locator('.strip a[aria-current="page"]')).toHaveAttribute('href', '/guide-to-tech-2')
  await expect(page.locator('a.next')).toHaveAttribute('href', '/guide-to-tech-2.5')
  await page.locator('.fin').scrollIntoViewIfNeeded()
  await expect.poll(() => page.evaluate(() => localStorage.getItem('read:guide-to-tech-2'))).toBe('1')
})
