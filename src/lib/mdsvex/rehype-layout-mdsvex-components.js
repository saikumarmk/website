/**
 * mdsvex maps layout module exports to `Components.<export>` only for HAST *element* nodes.
 * Inline HTML in markdown becomes `raw` nodes, so `<Mermaid />` never becomes `Components.mermaid`
 * and the SSR bundle calls an undefined identifier.
 *
 * This plugin rewrites those tags inside `raw` nodes (string replace only — no HTML parse).
 * Keep in sync with `post_layout.svelte` module exports (PascalCase + lowercase aliases).
 */
import { visit } from 'unist-util-visit';

/** @type { [string, string][] } Pascal/local tag name → namespace key on `Components` */
const LAYOUT_COMPONENTS = [
  ['PythonCode', 'pythoncode'],
  ['SlabTitle', 'slabtitle'],
  ['Mermaid', 'mermaid'],
  ['PokemonSprite', 'pokemonsprite'],
];

function rewriteRaw(value) {
  let out = value;
  for (const [name, key] of LAYOUT_COMPONENTS) {
    const openPascal = new RegExp(`<${name}(\\s|>|/)`, 'g');
    const openLower = new RegExp(`<${name.toLowerCase()}(\\s|>|/)`, 'g');
    const close = new RegExp(`</${name}>`, 'gi');
    const closeLower = new RegExp(`</${name.toLowerCase()}>`, 'gi');
    out = out.replace(openPascal, `<Components.${key}$1`);
    out = out.replace(openLower, `<Components.${key}$1`);
    out = out.replace(close, `</Components.${key}>`);
    out = out.replace(closeLower, `</Components.${key}>`);
  }
  return out;
}

export function rehypeLayoutMdsvexComponents() {
  return (tree) => {
    visit(tree, 'raw', (node) => {
      if (
        typeof node.value === 'string' &&
        (node.value.includes('<Mermaid') ||
          node.value.includes('<mermaid') ||
          node.value.includes('<PythonCode') ||
          node.value.includes('<pythoncode') ||
          node.value.includes('<SlabTitle') ||
          node.value.includes('<slabtitle') ||
          node.value.includes('<PokemonSprite') ||
          node.value.includes('<pokemonsprite'))
      ) {
        node.value = rewriteRaw(node.value);
      }
    });
  };
}
