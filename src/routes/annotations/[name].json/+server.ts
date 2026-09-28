import { readFileSync, readdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { error, json } from '@sveltejs/kit'
import type { EntryGenerator, RequestHandler } from './$types'
import { renderAnnotated } from '$lib/server/annotated'

export const prerender = true

const dir = resolve('static/annotations')

export const entries: EntryGenerator = () =>
  readdirSync(dir)
    .filter((f) => f.endsWith('.py'))
    .map((f) => ({ name: f.slice(0, -3) }))

/** `/annotations/<name>.json` is the parsed, highlighted form of `/annotations/<name>.py`. */
export const GET: RequestHandler = async ({ params }) => {
  if (!/^[\w-]+$/.test(params.name)) error(404, 'Not found')
  let source: string
  try {
    source = readFileSync(resolve(dir, `${params.name}.py`), 'utf8')
  } catch {
    error(404, 'Not found')
  }
  return json({ sections: await renderAnnotated(source) })
}
