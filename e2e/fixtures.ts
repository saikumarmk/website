import { test as base, expect } from '@playwright/test'

/**
 * Collects uncaught page errors and `console.error` from the browser.
 * On failure, attaches them as `browser-errors.txt` and prints them so CI logs stay readable.
 */
export const test = base.extend({
  page: async ({ page }, use, testInfo) => {
    const lines: string[] = []
    const push = (kind: string, text: string) => {
      lines.push(`[${kind}] ${text}`)
    }

    page.on('pageerror', err => {
      push('pageerror', `${err.message}\n${err.stack ?? ''}`)
    })
    page.on('console', msg => {
      if (msg.type() === 'error') {
        push('console.error', msg.text())
      }
    })

    await use(page)

    if (lines.length === 0) return
    const body = lines.join('\n\n')
    await testInfo.attach('browser-errors.txt', {
      body: Buffer.from(body, 'utf-8'),
      contentType: 'text/plain; charset=utf-8'
    })
    if (testInfo.status === 'failed' || testInfo.status === 'timedOut') {
      console.error('\n--- Browser errors (this test failed) ---\n' + body + '\n')
    }
  }
})

export { expect }
