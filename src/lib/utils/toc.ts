export type TocEntry = { depth: number; title?: string; slug?: string }
export type Section = Required<TocEntry>

/**
 * The post's top-level sections: the shallowest heading level with at least two entries,
 * so a lone title-style `#` at the top of a post doesn't hide the real sections.
 */
export function sectionsOf(toc: TocEntry[] | false | undefined): Section[] {
  const flat = (toc || []).filter((t): t is Section => !!t.slug && !!t.title)
  const depths = [...new Set(flat.map(t => t.depth))].sort((a, b) => a - b)
  const top = depths.find(d => flat.filter(t => t.depth === d).length > 1) ?? depths[0]
  return flat.filter(t => t.depth === top)
}
