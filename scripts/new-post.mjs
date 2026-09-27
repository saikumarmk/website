#!/usr/bin/env node
/**
 * Scaffold a new post at src/routes/(posts)/<slug>/+page.md.
 */
import fs from 'fs'
import path from 'path'
import readline from 'readline'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.join(__dirname, '..')
const postsDir = path.join(rootDir, 'src', 'routes', '(posts)')
const defaultAuthor = 'Sai Kumar Murali Krishnan'

const rl = readline.createInterface({ input: process.stdin, output: process.stdout })

function question(query) {
  return new Promise((resolve) => rl.question(query, resolve))
}

function kebabCase(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function parseList(value) {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

function yamlQuote(value) {
  if (/[:#\[\]{}&*!|>'"%@`]/.test(value) || value.includes('\n')) {
    return `"${value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`
  }
  return value.includes(' ') ? `"${value}"` : value
}

function yamlInlineList(items) {
  if (items.length === 0) return '[]'
  return `[${items.map(yamlQuote).join(', ')}]`
}

function today() {
  return new Date().toLocaleDateString('en-CA')
}

function parseArgs(argv) {
  const args = {}
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]
    if (!arg.startsWith('--')) continue
    const key = arg.slice(2)
    const next = argv[i + 1]
    if (!next || next.startsWith('--')) {
      args[key] = true
      continue
    }
    args[key] = next
    i++
  }
  return args
}

function listExisting(field) {
  const values = new Set()
  for (const entry of fs.readdirSync(postsDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue
    const pagePath = path.join(postsDir, entry.name, '+page.md')
    if (!fs.existsSync(pagePath)) continue
    const text = fs.readFileSync(pagePath, 'utf8')
    const match = text.match(new RegExp(`^${field}:\\s*(?:\\[(.*?)\\]|(.+))$`, 'm'))
    if (!match) continue
    for (const item of (match[1] ?? match[2]).split(',')) {
      const cleaned = item.trim().replace(/^["']|["']$/g, '')
      if (cleaned) values.add(cleaned)
    }
  }
  return [...values].sort((a, b) => a.localeCompare(b))
}

async function promptValue(label, { defaultValue = '', required = false } = {}) {
  const suffix = defaultValue ? ` [${defaultValue}]` : ''
  const answer = (await question(`${label}${suffix}: `)).trim()
  const value = answer || defaultValue
  if (required && !value) {
    console.error(`${label} is required.`)
    process.exit(1)
  }
  return value
}

async function collectInteractive() {
  console.log('✍️  New blog post\n')

  const existingTags = listExisting('tags')
  if (existingTags.length) {
    console.log(`Tags used before: ${existingTags.join(', ')}\n`)
  }
  const topics = listExisting('topic')

  const title = await promptValue('Title', { required: true })
  const suggestedSlug = kebabCase(title)
  const slugInput = await promptValue('Slug (URL path)', { defaultValue: suggestedSlug })
  const slug = kebabCase(slugInput || suggestedSlug)
  const author = await promptValue('Author', { defaultValue: defaultAuthor })
  const created = await promptValue('Created date (YYYY-MM-DD)', { defaultValue: today() })
  const topic = await promptValue(`Topic (${topics.join(', ')})`, { required: true })
  const tags = parseList(await promptValue('Tags (comma-separated)', { defaultValue: 'blog' }))
  const summary = await promptValue('Summary (optional)')
  const draftAnswer = (await promptValue('Draft / unlisted? (y/N)', { defaultValue: 'n' }))
    .toLowerCase()
    .startsWith('y')

  return { title, slug, author, created, topic, tags, summary, draft: draftAnswer }
}

function collectFromArgs(args) {
  const title = args.title
  if (!title) {
    console.error('Missing --title (or run interactively with no args).')
    process.exit(1)
  }
  const slug = kebabCase(args.slug || title)
  if (!args.topic) {
    console.error(`Missing --topic (one of: ${listExisting('topic').join(', ')}).`)
    process.exit(1)
  }
  return {
    title,
    slug,
    author: args.author || defaultAuthor,
    created: args.created || today(),
    topic: args.topic,
    tags: parseList(args.tags || 'blog'),
    summary: args.summary || '',
    draft: Boolean(args.draft || args.unlisted)
  }
}

function buildFrontmatter({ title, author, created, topic, tags, summary, draft }) {
  const lines = [
    '---',
    `title: ${yamlQuote(title)}`,
    `author: ${author}`,
    `created: ${created}`,
    `tags: ${yamlInlineList(tags)}`,
    `topic: ${topic}`
  ]
  if (summary) lines.push(`summary: ${yamlQuote(summary)}`)
  if (draft) lines.push('flags: [unlisted]')
  lines.push('---')
  return lines.join('\n')
}

function buildBody(title) {
  return `

## Introduction

Write your opening here.

## Next section

Continue drafting ${title}.
`
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  const interactive = process.argv.length <= 2 && !args.title
  const input = interactive ? await collectInteractive() : collectFromArgs(args)

  const postDir = path.join(postsDir, input.slug)
  const pagePath = path.join(postDir, '+page.md')

  if (fs.existsSync(pagePath)) {
    console.error(`Post already exists: src/routes/(posts)/${input.slug}/+page.md`)
    process.exit(1)
  }

  fs.mkdirSync(postDir, { recursive: true })
  const content = `${buildFrontmatter(input)}${buildBody(input.title)}`
  fs.writeFileSync(pagePath, content)

  console.log(`\n✓ Created src/routes/(posts)/${input.slug}/+page.md`)

  const visibility = input.draft ? ' (unlisted draft)' : ''
  console.log(`\n✅ Post ready${visibility}`)
  console.log(`   Edit: src/routes/(posts)/${input.slug}/+page.md`)
  console.log(`   URL:  http://localhost:5173/${input.slug}`)
  if (input.draft) {
    console.log('   Draft posts are hidden from archive/home until you remove flags: [unlisted]')
  }

  rl.close()
}

main().catch((error) => {
  console.error('Error:', error)
  rl.close()
  process.exit(1)
})
