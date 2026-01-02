## Personal Site
I keep my personal site contents here. You can visit it at [https://www.saikumarmk.com](https://www.saikumarmk.com)


## Powered by Urara
Check the repository out here: [https://github.com/importantimport/urara](https://github.com/importantimport/urara)


## Docs

`urara/*` contains all posts that are rendered via the standard route, and contain a `+page.md` which which are the contents of the page. You can include scripts e.g

```js
<script>
import PokemonSprite from '$lib/components/pkmn/pokemon.svelte'
import Sprite from '$lib/components/pkmn/sprite.svelte'
import Framed from '$lib/components/pkmn/frame.svelte'
</script>
```

To modify the home page, edit `src\routes\+page.svelte`.

To modify the actual post + container: `src\lib\components\post_container.svelte`


## Yggdrasil (Growth Tree)

The Yggdrasil skill tree is located at `/growth/2026`. Unlike regular blog posts, Yggdrasil pages live directly in `src/routes/growth/2026/` (not in `urara/`) to avoid conflicts with the Urara build system.

### Creating a New Node

Run the interactive generator:

```bash
pnpm run growth:new
```

This will prompt for:
- Node title
- Node ID (kebab-case)
- Branch (systems-hpc, gen-video, rl-posttraining, math-foundations, swe-craft, physics, research)
- Tier (roots, trunk, branch, crown)
- Tags (comma-separated)
- Estimated hours

The script creates:
- `src/routes/growth/2026/<node-id>/+page.md` - The markdown page
- Updates `src/resources/growth2026.json` with the new node and edges

### Backfilling Pages for Existing Nodes

If you've added nodes to `growth2026.json` manually, generate their pages:

```bash
pnpm run growth:backfill
```

### File Structure

```
src/routes/growth/2026/
├── +page.svelte              # Main graph visualization
├── types.ts                  # TypeScript types
├── components/               # Graph UI components
├── utils/                    # Graph helpers
└── <node-id>/
    └── +page.md              # Node content page

src/resources/
└── growth2026.json           # Node/edge data
```

### Node Page Format

```markdown
---
title: 'Node Title'
created: YYYY-MM-DD
updated: YYYY-MM-DD
tags: [yggdrasil, branch-name, other-tags]
growth:
  node_id: 'node-id'
  branch: 'branch-name'
  tier: 'roots|trunk|branch|crown'
  estimate_hours: 15
---

Content here...
```