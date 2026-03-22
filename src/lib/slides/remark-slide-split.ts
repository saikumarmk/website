import type { Root, Content, Blockquote, BlockContent, Paragraph } from 'mdast'

/**
 * When frontmatter has `slides: true`, split the document on horizontal rules
 * into plain `<section data-slide="N" class="slide">` HTML elements.
 *
 * These are standard HTML — no Svelte component mapping required.
 * The SlideDeck.svelte controller finds them via DOM queries at runtime.
 */
function isSlideSeparator(node: Content): boolean {
  if (node.type === 'thematicBreak') return true
  if (node.type === 'paragraph') {
    const p = node as Paragraph
    const ch = p.children
    if (ch.length !== 1 || ch[0].type !== 'text') return false
    const t = (ch[0] as { value: string }).value.trim()
    return /^-{3,}$|^\*{3,}$|^_{3,}$/.test(t)
  }
  return false
}

export function remarkSlideSplit() {
  return (tree: Root, file: { data?: { fm?: Record<string, unknown> } }) => {
    const fm = file.data?.fm
    if (!fm?.slides) return

    const children = tree.children
    const isFrontmatter = (n: Content) =>
      n.type === 'yaml' || (n as { type: string }).type === 'toml'
    const preserved = children.filter(isFrontmatter)
    const body = children.filter(n => !isFrontmatter(n))

    const segments: Content[][] = []
    let cur: Content[] = []

    for (const node of body) {
      if (isSlideSeparator(node)) {
        segments.push(cur)
        cur = []
      } else {
        cur.push(node)
      }
    }
    segments.push(cur)

    const nonEmpty = segments.filter(s => s.length > 0)
    if (nonEmpty.length === 0) return

    ;(fm as Record<string, unknown>).slideSegmentCount = nonEmpty.length

    const slideNodes: Blockquote[] = nonEmpty.map((seg, i) => ({
      type: 'blockquote',
      data: {
        hName: 'section',
        hProperties: { dataSlide: String(i), class: 'slide' }
      },
      children: seg as BlockContent[]
    }))

    tree.children = [...preserved, ...slideNodes] as Root['children']
  }
}
