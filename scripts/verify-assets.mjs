#!/usr/bin/env node
/**
 * Ensure every URL in src/lib/config/assets.ts has a committed source under urara/assets/.
 * static/ is gitignored and rebuilt from urara on `pnpm build`, so assets must be tracked
 * in git — a local untracked copy is not enough (CI / fresh clones will miss it).
 *
 * Pass --build to also verify files landed in build/assets/ after `pnpm build`.
 */
import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { execSync } from 'node:child_process'

const checkBuild = process.argv.includes('--build')
const root = new URL('..', import.meta.url).pathname
const assetsTs = readFileSync(join(root, 'src/lib/config/assets.ts'), 'utf8')
const urls = [...assetsTs.matchAll(/'(\/assets\/[^']+)'/g)].map((m) => m[1])

if (urls.length === 0) {
  console.error('verify-assets: no /assets/ URLs found in src/lib/config/assets.ts')
  process.exit(1)
}

let tracked = new Set()
try {
  tracked = new Set(
    execSync('git ls-files urara/assets', { cwd: root, encoding: 'utf8' })
      .trim()
      .split('\n')
      .filter(Boolean)
  )
} catch {
  console.error('verify-assets: git ls-files failed — run from a git checkout')
  process.exit(1)
}

const missingOnDisk = []
const untracked = []
const missingInBuild = []

for (const url of urls) {
  const rel = url.replace(/^\/assets\//, '')
  const gitPath = `urara/assets/${rel}`
  const source = join(root, gitPath)

  if (!existsSync(source)) {
    missingOnDisk.push({ url, source: gitPath })
    continue
  }
  if (!tracked.has(gitPath)) {
    untracked.push({ url, source: gitPath })
  }
  if (checkBuild) {
    const built = join(root, 'build', 'assets', rel)
    if (!existsSync(built)) {
      missingInBuild.push({ url, built: `build/assets/${rel}` })
    }
  }
}

if (missingOnDisk.length > 0) {
  console.error('verify-assets: missing source files (add them under urara/assets/):')
  for (const { url, source } of missingOnDisk) {
    console.error(`  ${url} → ${source}`)
  }
}

if (untracked.length > 0) {
  console.error('verify-assets: assets exist locally but are not committed to git:')
  for (const { url, source } of untracked) {
    console.error(`  ${url} → ${source} (git add and commit)`)
  }
}

if (missingInBuild.length > 0) {
  console.error('verify-assets: missing from production build output:')
  for (const { url, built } of missingInBuild) {
    console.error(`  ${url} → ${built}`)
  }
}

if (missingOnDisk.length > 0 || untracked.length > 0 || missingInBuild.length > 0) {
  process.exit(1)
}

const buildNote = checkBuild ? ' and build/' : ''
console.log(`verify-assets: ok (${urls.length} mirrored assets tracked in git${buildNote})`)
