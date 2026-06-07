#!/usr/bin/env node
import { copyFileSync, chmodSync, existsSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { execSync } from 'node:child_process'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const gitDir = join(root, '.git')
const hooksDir = join(gitDir, 'hooks')
const source = join(root, '.githooks', 'pre-push')
const dest = join(hooksDir, 'pre-push')

if (!existsSync(gitDir)) {
  console.error('install-git-hooks: not a git repository (.git missing)')
  process.exit(1)
}

if (!existsSync(source)) {
  console.error('install-git-hooks: missing .githooks/pre-push')
  process.exit(1)
}

mkdirSync(hooksDir, { recursive: true })
copyFileSync(source, dest)
chmodSync(dest, 0o755)

console.log('install-git-hooks: installed pre-push → .git/hooks/pre-push')

try {
  const configured = execSync('git config --get core.hooksPath', {
    cwd: root,
    encoding: 'utf8'
  }).trim()
  if (configured && configured !== '.githooks') {
    console.warn(
      `install-git-hooks: core.hooksPath is "${configured}" — copied hook may be ignored; unset or point it at .githooks`
    )
  }
} catch {
  // core.hooksPath not set; copied hook is active
}
