import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { parsePythonToSections } from './parse-python-sections'
import { renderDocs } from '$lib/server/annotated'

const annotation = (name: string) => readFileSync(`static/annotations/${name}`, 'utf8')

describe('parsePythonToSections', () => {
  it.each([
    ['ponder.py', 45],
    ['elo_calculator.py', 27]
  ])('splits %s into %i sections', (file, n) => {
    expect(parsePythonToSections(annotation(file))).toHaveLength(n)
  })

  it('never yields a section without prose', () => {
    for (const file of ['ponder.py', 'elo_calculator.py', 'edit_distance.py', 'binary_lifting.py']) {
      for (const s of parsePythonToSections(annotation(file))) expect(s.docs.trim()).not.toBe('')
    }
  })

  it('drops YAML frontmatter from the module docstring', () => {
    const [first] = parsePythonToSections(annotation('ponder.py'))
    expect(first.docs).not.toMatch(/^---|title:/m)
    expect(first.docs.startsWith('# PonderNet: Learning to Ponder')).toBe(true)
    expect(first.code.startsWith('from typing import Tuple')).toBe(true)
  })

  it('keeps a multi-line signature and its decorators with the docstring', () => {
    const src = [
      'import torch',
      '',
      '@torch.no_grad()',
      '@staticmethod',
      'def step(',
      '    x: int,',
      '    y: int,',
      ') -> int:',
      '    """Adds them."""',
      '    return x + y'
    ].join('\n')
    const [imports, step] = parsePythonToSections(`"""Module."""\n${src}`)
    expect(imports.code).toBe('import torch')
    expect(step.docs).toBe('Adds them.')
    expect(step.code.split('\n')[0]).toBe('@torch.no_grad()')
    expect(step.code).toContain(') -> int:\n    return x + y')
  })

  it('closes the gap the docstring leaves under its header', () => {
    const [cls] = parsePythonToSections('@dataclass\nclass T:\n    """A trainer."""\n\n    name: str\n')
    expect(cls.code).toBe('@dataclass\nclass T:\n    name: str')
  })

  it('skips empty comments and merges prose-less sections into the previous one', () => {
    const src = ['# Setup', 'a = 1', '#', '#   ', 'b = 2', '# Next', 'c = 3'].join('\n')
    expect(parsePythonToSections(src)).toEqual([
      { docs: 'Setup', code: 'a = 1\nb = 2' },
      { docs: 'Next', code: 'c = 3' }
    ])
  })

  it('dedents each section and leaves string assignments as code', () => {
    const src = ['class A:', '    """A thing."""', '    def f(self):', '        # Explain', '        q = """', '        text', '        """', '        return q'].join('\n')
    const [cls, f] = parsePythonToSections(src)
    expect(cls).toEqual({ docs: 'A thing.', code: 'class A:\n    def f(self):' })
    expect(f.docs).toBe('Explain')
    expect(f.code.startsWith('q = """')).toBe(true)
    expect(f.code).toContain('return q')
  })
})

describe('renderDocs', () => {
  it('typesets maths before Markdown sees it', () => {
    const html = renderDocs('where $h_n$ is the *state*\n\n$$p_n = \\lambda_n$$')
    expect(html).toContain('class="katex"')
    expect(html).toContain('katex-display')
    expect(html).toContain('<em>state</em>')
  })

  it('keeps absolute links and unwraps relative ones', () => {
    const html = renderDocs('[paper](https://arxiv.org/abs/2107.05407) and [the task](../parity.html)')
    expect(html).toContain('href="https://arxiv.org/abs/2107.05407"')
    expect(html).not.toContain('parity.html')
    expect(html).toContain('the task')
  })
})
