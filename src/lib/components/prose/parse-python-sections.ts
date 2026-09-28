export type AnnotatedSection = {
  docs: string
  code: string
}

/** A section as served by `/annotations/<name>.json`: both halves are HTML. */
export type RenderedSection = AnnotatedSection

const DEF = /^\s*(async\s+)?(def|class)\s/

/** Drops the quotes, a YAML frontmatter block, and the docstring's common indent. */
function docstringBody(block: string): string {
  const body = block
    .trim()
    .slice(3, -3)
    .replace(/^\n/, '')
    .replace(/^\s*---\n[\s\S]*?\n---\s*\n/, '')
  const lines = body.split('\n')
  const indent = Math.min(...lines.filter(l => l.trim()).map(l => l.match(/^\s*/)![0].length), 99)
  return lines.map(l => l.slice(indent)).join('\n')
}

function dedent(code: string): string {
  const lines = code.split('\n')
  const pad = Math.min(...lines.filter(l => l.trim()).map(l => l.match(/^ */)![0].length))
  return pad > 0 && pad < Infinity ? lines.map(l => l.slice(pad)).join('\n') : code
}

/**
 * Splits Python source into prose + code sections. A comment run or a docstring starts a section and the code after
 * it belongs to it. A docstring right after a `def`/`class` header (multi-line signatures and decorators included)
 * takes the header with it. Empty comments don't start sections, and sections without prose join the previous one.
 */
export function parsePythonToSections(src: string): AnnotatedSection[] {
  const lines = src.replace(/\r/g, '').split('\n')
  const out: AnnotatedSection[] = []
  let docs: string[] = []
  let code: string[] = []

  const flush = () => {
    if (docs.join('').trim() || code.join('').trim()) out.push({ docs: docs.join('\n'), code: code.join('\n') })
    docs = []
    code = []
  }

  /** Index where the def/class header that ends the pending code starts, or -1. */
  const headerStart = () => {
    let j = code.length - 1
    if (j < 0 || !code[j].trim().endsWith(':')) return -1
    while (j >= 0 && !DEF.test(code[j])) {
      if (!code[j].trim()) return -1
      j--
    }
    if (j < 0) return -1
    while (j > 0 && /^\s*@/.test(code[j - 1])) j--
    return j
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const t = line.trim()
    const q = t.startsWith('"""') ? '"""' : t.startsWith("'''") ? "'''" : null
    // `x = """…"""` is a value, not a docstring
    if (q && !/=\s*$/.test(code[code.length - 1] ?? '')) {
      const block = [line]
      if (!(t.length >= 6 && t.endsWith(q))) {
        while (++i < lines.length) {
          block.push(lines[i])
          if (lines[i].trim().endsWith(q)) break
        }
      }
      const hs = headerStart()
      const header = hs >= 0 ? code.splice(hs) : []
      flush()
      docs.push(docstringBody(block.join('\n')))
      code.push(...header)
      // the blank line that followed the docstring would now sit between the header and its body
      if (header.length) while (i + 1 < lines.length && !lines[i + 1].trim()) i++
      continue
    }
    if (t.startsWith('#') && !t.startsWith('#!')) {
      const run: string[] = []
      while (i < lines.length && lines[i].trim().startsWith('#')) run.push(lines[i++].trim().replace(/^#\s?/, ''))
      i--
      if (!run.join('').trim()) continue
      flush()
      docs.push(run.join('\n'))
      continue
    }
    code.push(line)
    // a triple-quoted value left open on this line runs on as code, so its closing quotes aren't a docstring
    const open = ['"""', "'''"].find(mark => line.split(mark).length % 2 === 0)
    if (open) {
      while (++i < lines.length) {
        code.push(lines[i])
        if (lines[i].includes(open)) break
      }
    }
  }
  flush()

  return out
    .map(s => ({ docs: s.docs, code: dedent(s.code.replace(/^([ \t]*\n)+|\s+$/g, '')) }))
    .reduce<AnnotatedSection[]>((acc, s) => {
      const prev = acc[acc.length - 1]
      if (!s.docs.trim() && prev) prev.code = prev.code ? `${prev.code}\n\n${s.code}` : s.code
      else acc.push(s)
      return acc
    }, [])
}
