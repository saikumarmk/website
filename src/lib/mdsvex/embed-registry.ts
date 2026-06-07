/**
 * mdsvex embed components registered for use in markdown via post_layout exports.
 * Keep registration in one place; post_layout re-exports from here.
 */
export { default as Image } from '$lib/components/prose/img.svelte'
export { default as table } from '$lib/components/prose/table.svelte'
export { default as Mermaid } from '$lib/components/prose/mermaid.svelte'
export { default as PythonCode } from '$lib/components/prose/code.svelte'
export { default as SlabTitle } from '$lib/components/slab_title.svelte'
export { default as PokemonSprite } from '$lib/components/pkmn/pokemon.svelte'
export { default as SpriteAscii } from '$lib/components/pretext/SpriteAscii.svelte'
