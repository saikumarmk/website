import type { Page } from '@playwright/test'
import { test, expect } from './fixtures'

const shelfSlugs = (page: Page) =>
  page.locator('#writing-shelves li[data-slug]').evaluateAll(els => els.map(el => el.getAttribute('data-slug')))

test.describe('writing index', () => {
  test('tabs switch shelves and keep the topic in the URL', async ({ page }) => {
    await page.goto('/archive/', { waitUntil: 'networkidle' })
    const tab = page.getByRole('tab', { name: /^Maths & algorithms/ })
    await expect(async () => {
      await tab.click()
      await expect(tab).toHaveAttribute('aria-selected', 'true', { timeout: 250 })
    }).toPass({ timeout: 10_000 })
    await expect(page).toHaveURL(/\?topic=maths$/)
    await expect(page.getByRole('heading', { level: 2 })).toHaveText([/^Maths & algorithms/])
  })

  test('?topic=playbook lists the parts in order with the FAQ after them', async ({ page }) => {
    await page.goto('/archive/?topic=playbook', { waitUntil: 'networkidle' })
    await expect(page.getByRole('tab', { name: /^The Playbook/ })).toHaveAttribute('aria-selected', 'true')
    const slugs = await shelfSlugs(page)
    expect(slugs.slice(0, 5)).toEqual([
      '/guide-to-tech-1',
      '/guide-to-tech-2',
      '/guide-to-tech-2.5',
      '/guide-to-tech-3',
      '/guide-to-tech-faq'
    ])
  })

  test('?tag= filters the shelves and can be cleared', async ({ page }) => {
    await page.goto('/archive/?tag=python', { waitUntil: 'networkidle' })
    await expect(page.getByText('#python')).toBeVisible()
    const tagged = await shelfSlugs(page)
    await page.getByRole('button', { name: 'show everything' }).click()
    await expect(page).toHaveURL(/\/archive\/$/)
    expect((await shelfSlugs(page)).length).toBeGreaterThan(tagged.length)
  })
})

test.describe('search', () => {
  test('"/" opens a combobox over an inert page, and Escape returns focus', async ({ page }) => {
    await page.goto('/archive/', { waitUntil: 'networkidle' })
    const input = page.locator('#search-title')
    await expect(async () => {
      await page.locator('body').press('/')
      await expect(input).toBeFocused({ timeout: 250 })
    }).toPass({ timeout: 10_000 })
    await expect(input).toHaveAttribute('role', 'combobox')
    expect(await page.locator('.page').evaluate(el => (el as HTMLElement).inert)).toBe(true)

    await input.fill('elo')
    const first = page.getByRole('option').first()
    await expect(first).toHaveAttribute('aria-selected', 'true')
    await expect(input).toHaveAttribute('aria-activedescendant', (await first.getAttribute('id'))!)
    await expect(page.getByRole('group', { name: 'Project Dex' })).toBeVisible()
    await expect(first.locator('mark').first()).toHaveText(/elo/i)

    await input.press('ArrowDown')
    await expect(page.getByRole('option').nth(1)).toHaveAttribute('aria-selected', 'true')

    await input.press('Escape')
    await expect(input).toHaveCount(0)
    expect(await page.locator('.page').evaluate(el => (el as HTMLElement).inert)).toBe(false)
  })

  test('Enter opens the highlighted post', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' })
    const input = page.locator('#search-title')
    await expect(async () => {
      await page.getByRole('button', { name: /^Search/ }).click()
      await expect(input).toBeVisible({ timeout: 250 })
    }).toPass({ timeout: 10_000 })
    await input.fill('Essence of Recursion')
    await expect(page.getByRole('option').first()).toHaveAttribute('href', '/essence-recursion')
    await input.press('Enter')
    await expect(page).toHaveURL(/\/essence-recursion\/?$/)
  })
})

test.describe('404', () => {
  test('grows an unfinished flower and searches for the missing path', async ({ page }) => {
    const res = await page.goto('/no-such-flower/', { waitUntil: 'networkidle' })
    expect(res?.status()).toBe(404)
    await expect(page.getByRole('heading', { name: "Nothing's been sewn here yet." })).toBeVisible()
    await expect(page.locator('.lost code')).toHaveText('/no-such-flower/')
    await expect(page.locator('svg.unravel .needle')).toHaveCount(1)
    await expect(page.getByRole('link', { name: 'the writing' })).toHaveAttribute('href', '/archive')

    const input = page.locator('#search-title')
    await expect(async () => {
      await page.getByRole('button', { name: 'search', exact: true }).click()
      await expect(input).toBeVisible({ timeout: 250 })
    }).toPass({ timeout: 10_000 })
    await expect(input).toHaveValue('no such flower')
  })
})
