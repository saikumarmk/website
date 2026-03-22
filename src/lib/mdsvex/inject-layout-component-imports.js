/**
 * After mdsvex, MD pages only had `import * as Components from <layout>` for embeds.
 * Raw tags like `<SlabTitle />` must resolve as real components in the page module.
 *
 * Prepends explicit `$lib` imports (only if not already in the file) and normalizes
 * the layout import to `$lib/components/post_layout.svelte`.
 */
const OPTIONAL_IMPORTS = [
  `import SlabTitle from '$lib/components/slab_title.svelte'`,
  `import Mermaid from '$lib/components/prose/mermaid.svelte'`,
  `import PythonCode from '$lib/components/prose/code.svelte'`,
  `import PokemonSprite from '$lib/components/pkmn/pokemon.svelte'`
]

function hasImport(content, componentName) {
  const re = new RegExp(`^import\\s+${componentName}\\s+from`, 'm')
  return re.test(content)
}

export function injectMdsvexLayoutComponentImports() {
  return {
    name: 'inject-mdsvex-layout-component-imports',
    markup({ content, filename }) {
      if (!filename || !filename.endsWith('.md')) return
      if (!content.includes('Layout_MDSVEX_DEFAULT')) return

      const toAdd = OPTIONAL_IMPORTS.filter(line => {
        const m = line.match(/^import\s+(\w+)\s+from/)
        return m && !hasImport(content, m[1])
      })
      const extra = toAdd.length ? `${toAdd.join('\n')}\n` : ''

      const layoutImport =
        "import Layout_MDSVEX_DEFAULT, * as Components from '$lib/components/post_layout.svelte';"

      const replaced = content.replace(
        /import Layout_MDSVEX_DEFAULT, \* as Components from ['"][^'"]*post_layout\.svelte['"];?/,
        `${extra}${layoutImport}`
      )

      if (replaced === content) return
      return { code: replaced }
    }
  }
}
