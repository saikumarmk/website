export type AnnotatedSection = {
  docs: string
  code: string
}

/** Split Python source into docstring/comment docs + code blocks for split-pane rendering. */
export function parsePythonToSections(code: string): AnnotatedSection[] {
  const lines = code.split('\n')
  const sections: AnnotatedSection[] = []
  let docsBuffer: string[] = []
  let codeBuffer: string[] = []

  const flushSection = () => {
    if (docsBuffer.length > 0 || codeBuffer.length > 0) {
      sections.push({
        docs: docsBuffer.join('\n'),
        code: codeBuffer.join('\n')
      })
    }
    docsBuffer = []
    codeBuffer = []
  }

  let inDocstring = false

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const trimmed = line.trim()

    if (inDocstring) {
      docsBuffer.push(line)
      if (trimmed.endsWith('"""') || trimmed.endsWith("'''")) {
        inDocstring = false
      }
    } else if (trimmed.startsWith('"""') || trimmed.startsWith("'''")) {
      if (codeBuffer.length > 0 && !/^\s*(class|def)/.test(codeBuffer[codeBuffer.length - 1].trim())) {
        flushSection()
      }
      docsBuffer.push(line)
      if (!(trimmed.length > 3 && trimmed.endsWith(trimmed.substring(0, 3)))) {
        inDocstring = true
      }
    } else if (trimmed.startsWith('#')) {
      flushSection()
      while (i < lines.length && (lines[i].trim().startsWith('#') || lines[i].trim() === '')) {
        docsBuffer.push(lines[i])
        i++
      }
      i--
    } else {
      if (trimmed.startsWith('def ') || trimmed.startsWith('class ')) {
        flushSection()
      }
      codeBuffer.push(line)
    }
  }

  flushSection()
  return sections
}

export function processDocstring(docContent: string): string {
  const trimmed = docContent.trim()

  if (trimmed.startsWith('"""') || trimmed.startsWith("'''")) {
    const content = trimmed.slice(3, -3)
    const lines = content.split('\n')
    const firstLine = lines.find(line => line.trim() !== '') || ''
    const indentation = firstLine ? firstLine.match(/^\s*/)?.[0].length ?? 0 : 0
    return lines.map(line => line.substring(indentation)).join('\n')
  }

  if (trimmed.startsWith('#')) {
    return docContent
      .split('\n')
      .map(line => line.trim().replace(/^#\s?/, ''))
      .join('\n')
  }

  return docContent
}
