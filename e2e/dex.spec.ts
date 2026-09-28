import { test, expect } from './fixtures'

const screen = (page: import('@playwright/test').Page) => page.locator('section.screen')

test('/dex renders the first entry without JS', async ({ browser }) => {
  const ctx = await browser.newContext({ javaScriptEnabled: false })
  const page = await ctx.newPage()
  const res = await page.goto('/dex/')
  expect(res?.ok()).toBeTruthy()
  await expect(page.getByRole('heading', { level: 1, name: 'Project Dex' })).toBeVisible()
  await expect(screen(page).locator('h2')).toHaveText('monash-handbook-plus')
  await expect(page.locator('#dex-list li')).toHaveCount(15)
  await ctx.close()
})

test('/dex arrow keys move through entries and types', async ({ page }) => {
  await page.goto('/dex/')
  const name = screen(page).locator('h2')
  const tabs = page.getByRole('tab')
  // keys only work once the page has hydrated, so retry
  await expect(async () => {
    await page.keyboard.press('ArrowDown')
    await expect(name).not.toHaveText('monash-handbook-plus', { timeout: 250 })
  }).toPass({ timeout: 10000 })
  await expect(name).toHaveText('saikumarmk.com')
  await expect(page).toHaveURL(/\/dex\/#saikumarmk-website$/)

  await page.keyboard.press('ArrowRight')
  await expect(tabs.nth(1)).toHaveAttribute('aria-selected', 'true')
  const listed = await page.locator('#dex-list li').count()
  expect(listed).toBeLessThan(15)
})

test('/dex#<id> selects that entry, and a retired entry links to its successor', async ({ page }) => {
  await page.goto('/dex/#setools')
  const name = screen(page).locator('h2')
  await expect(name).toHaveText('SETools')
  await expect(screen(page)).toContainText('Retired · evolved into')
  await screen(page).getByRole('button', { name: 'unit-scores-dashboard' }).click()
  await expect(name).toHaveText('unit-scores-dashboard')
  await expect(page).toHaveURL(/#unit-scores-dashboard$/)
})

for (const from of ['/projects/', '/portfolio/projects/']) {
  test(`${from} redirects to /dex`, async ({ page }) => {
    await page.goto(from)
    await expect(page).toHaveURL(/\/dex\/$/)
  })
}
