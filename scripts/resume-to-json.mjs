#!/usr/bin/env node
/*
  Reads a résumé .tex (the Jake's-resume macros used across knowledge/resume/) and writes the web CV as JSON.
  The .tex stays the source of truth; src/lib/config/cv.json says which file to read and what the web version changes.
  The output (src/resources/resume.json) is committed, so the build never needs the .tex files.

    pnpm cv                                   (= node scripts/resume-to-json.mjs [tweaks.json] [out.json])

  Tweaks match bullets by the start of their text, so they survive reordering and small edits to the .tex:
    source        .tex file to read (relative to "dir")
    sections      which sections to keep, in order; "Name@other.tex" pulls that section from another variant
    omit          bullet prefixes to drop
    replace       { prefix: new text } for web-only wording
    links         { phrase: url } turned into links wherever the phrase appears
*/
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const tweaksPath = resolve(process.argv[2] || join(root, 'src/lib/config/cv.json'))
const outPath = resolve(process.argv[3] || join(root, 'src/resources/resume.json'))
const tweaks = JSON.parse(readFileSync(tweaksPath, 'utf8'))
const dir = resolve(dirname(tweaksPath), process.env.RESUME_DIR || tweaks.dir)
if (!existsSync(join(dir, tweaks.source))) {
  console.error(`${join(dir, tweaks.source)} not found; set RESUME_DIR or "dir" in ${tweaksPath}. Keeping the committed ${outPath}.`)
  process.exit(1)
}

/* read one {...} group starting at s[i] === '{', honouring nesting and escaped braces */
function group(s, i) {
  let depth = 0, j = i
  for (; j < s.length; j++) {
    if (s[j] === '\\') { j++; continue }
    if (s[j] === '{') depth++
    else if (s[j] === '}' && --depth === 0) break
  }
  return [s.slice(i + 1, j), j + 1]
}
function args(s, i, n) {
  const out = []
  while (out.length < n) {
    while (/\s/.test(s[i])) i++
    if (s[i] !== '{') break
    const [a, next] = group(s, i); out.push(a); i = next
  }
  return [out, i]
}

const esc = (t) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
function inline(t) {
  let out = '', i = 0
  while (i < t.length) {
    if (t[i] === '\\') {
      const m = /^\\([a-zA-Z]+|.)/.exec(t.slice(i)), cmd = m[1]
      i += m[0].length
      const wrap = { emph: 'i', textit: 'i', textbf: 'b', texttt: 'code' }[cmd]
      if (cmd === 'href') { const [[u, x], j] = args(t, i, 2); out += `<a href="${esc(u)}">${inline(x)}</a>`; i = j }
      else if (wrap) { const [[x], j] = args(t, i, 1); out += `<${wrap}>${inline(x)}</${wrap}>`; i = j }
      else if (cmd === ',') out += '\u2009'
      else if (/^[%&$#_{}]$/.test(cmd)) out += esc(cmd)
      else if (cmd === 'textperiodcentered') out += '·'
      else { while (/\s/.test(t[i])) i++; if (t[i] === '{') { const [[x], j] = args(t, i, 1); out += inline(x); i = j } }
    } else if (t.startsWith('---', i)) { out += '—'; i += 3 }
    else if (t.startsWith('--', i)) { out += '–'; i += 2 }
    else if (t[i] === '~') { out += '\u00a0'; i++ }
    else if (t[i] === '{' || t[i] === '}') i++
    else { out += esc(t[i]); i++ }
  }
  return out.replace(/\s+/g, ' ').trim()
}
const plain = (t) => inline(t).replace(/<[^>]+>/g, '')

function parse(file) {
  const src = readFileSync(join(dir, file), 'utf8').replace(/(^|[^\\])%.*$/gm, '$1')
  const body = src.slice(src.indexOf('\\begin{document}'))
  const cv = { name: '', links: [], sections: [] }
  const nameM = /\\selectfont\s+([^}]+)\}/.exec(body)
  cv.name = nameM ? nameM[1].trim() : ''
  const head = body.slice(0, body.indexOf('\\section'))
  for (const m of head.matchAll(/\\href\{([^}]*)\}\{([^}]*)\}/g)) cv.links.push([plain(m[2]), m[1]])

  let sec = null, org = null, role = null
  const re = /\\(section|resumeSubheading|resumeSubSubheading|resumeProjectHeading|resumeItem|href|textbf)\b/g
  let m
  while ((m = re.exec(body))) {
    const at = m.index + m[0].length
    if (m[1] === 'section') {
      const [[t], j] = args(body, at, 1); re.lastIndex = j
      sec = { title: plain(t).replace(/&amp;/g, '&'), orgs: [], skills: [] }; cv.sections.push(sec); org = role = null
    } else if (m[1] === 'resumeSubheading') {
      const [[a, b, c, d], j] = args(body, at, 4); re.lastIndex = j
      // curated_resume writes {role}{}{org}{when} for club positions
      const swap = !plain(b) && plain(c)
      role = { role: inline(swap ? a : c), when: inline(d), pts: [] }
      org = { org: inline(swap ? c : a), where: inline(b), roles: [role] }
      sec.orgs.push(org)
    } else if (m[1] === 'resumeSubSubheading') {
      const [[a, b], j] = args(body, at, 2); re.lastIndex = j
      role = { role: inline(a), when: inline(b), pts: [] }; org.roles.push(role)
    } else if (m[1] === 'resumeProjectHeading') {
      const [[a, b], j] = args(body, at, 2); re.lastIndex = j
      const [name, stack = ''] = a.split(/\s*\$\|\$\s*/)
      role = { role: '', when: inline(b), pts: [] }; org = { org: plain(name), where: inline(stack).replace(/^<i>(.*)<\/i>$/, '$1'), roles: [role] }; sec.orgs.push(org)
    } else if (m[1] === 'resumeItem') {
      const [[t], j] = args(body, at, 1); re.lastIndex = j
      role?.pts.push(inline(t))
    } else if (m[1] === 'href') {
      const [[u, x], j] = args(body, at, 2)
      const inner = /^\s*\\resumeItem\s*\{/.exec(x)
      if (inner) { re.lastIndex = j; role?.pts.push(`<a href="${esc(u)}">${inline(args(x, x.indexOf('{'), 1)[0][0])}</a>`) }
    } else if (m[1] === 'textbf' && sec && !role) {
      const [[k, v], j] = args(body, at, 2); re.lastIndex = j
      if (v != null) sec.skills.push([plain(k), inline(v).replace(/^:\s*/, '')])
    }
  }
  return cv
}

const base = parse(tweaks.source)
const others = {}
const pick = (spec) => {
  const [title, file] = spec.split('@')
  const cv = file ? (others[file] ||= parse(file)) : base
  const s = cv.sections.find((x) => x.title.toLowerCase() === title.toLowerCase())
  if (!s) throw new Error(`no section "${title}" in ${file || tweaks.source}`)
  return s
}
const sections = (tweaks.sections || base.sections.map((s) => s.title)).map(pick)

const starts = (pt, prefix) => pt.replace(/<[^>]+>/g, '').startsWith(prefix)
const used = new Set()
for (const s of sections) for (const o of s.orgs) for (const r of o.roles) {
  r.pts = r.pts.filter((p) => !(tweaks.omit || []).some((pre) => starts(p, pre) && used.add(pre)))
  r.pts = r.pts.map((p) => { const k = Object.keys(tweaks.replace || {}).find((pre) => starts(p, pre)); if (k) { used.add(k); return tweaks.replace[k] } return p })
}
const linkify = (h) => Object.entries(tweaks.links || {}).reduce((acc, [phrase, url]) => acc.replace(new RegExp(`(^|[^>\\w])(${phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})(?![^<]*</a>)`), (_, a, b) => { used.add(phrase); return `${a}<a href="${url}">${b}</a>` }), h)
for (const s of sections) for (const o of s.orgs) for (const r of o.roles) r.pts = r.pts.map(linkify)
const unused = [...Object.keys(tweaks.replace || {}), ...(tweaks.omit || []), ...Object.keys(tweaks.links || {})].filter((k) => !used.has(k))
if (unused.length) console.warn(`tweaks that matched nothing (the .tex may have changed): ${unused.join(' | ')}`)

const out = { name: base.name, links: base.links, source: tweaks.source, sections }
writeFileSync(outPath, JSON.stringify(out, null, 2) + '\n')
console.log(`${outPath}: ${sections.map((s) => `${s.title} (${s.orgs.reduce((a, o) => a + o.roles.reduce((b, r) => b + r.pts.length, 0), 0) || s.skills.length})`).join(', ')}`)
