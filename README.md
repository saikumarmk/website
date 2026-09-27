## Personal Site

Personal website and blog built with SvelteKit (originally forked from the [Urara](https://github.com/importantimport/urara) template).

Visit at [https://www.saikumarmk.com](https://www.saikumarmk.com)

## Development

Requires Node 22.18+ and pnpm 9.

```bash
pnpm install
pnpm dev                     # http://127.0.0.1:5173
pnpm build && pnpm preview   # static build in build/
pnpm test                    # unit tests (Vitest)
pnpm exec playwright test    # e2e against a production build
```

If Playwright can't download its own Chromium, point it at any installed Chromium-based browser with `PW_CHROMIUM_PATH=/path/to/browser`.


## Notable Components

This site features several custom interactive components beyond the standard blog template.

### Project Dex

A Pokédex of projects at `/dex` (`/projects` and `/portfolio/projects` redirect there).

**Source:** `src/routes/dex/+page.svelte`, data in `src/lib/config/portfolio.ts`

**Features:**
- Type tabs, a numbered list and a "screen": an embroidery hoop with the entry's flower (grown from its name) and its partner Pokémon
- ↑/↓ move through the list, ←/→ switch type
- `/dex#<project id>` selects an entry, and selecting one updates the hash
- Retired projects set `retired: '<successor id>'`, and their habitat links to the successor

### TechBadge Component

3D beveled technology badges inspired by Pokemon type badges.

**Source:** `src/lib/components/projects/TechBadge.svelte`

**Features:**
- 4x4 CSS grid creates beveled 3D illusion
- Dynamic color generation using `lighten()` and `darken()` functions
- Auto-scaling text based on badge name length
- Corner dots for decorative effect
- Shadow and highlight calculated from base colors

**Usage:**
```svelte
<TechBadge name="Python" colors={['#3776AB', '#FFD43B', '#3776AB', '#FFD43B']} />
```

Colors are mapped in `src/lib/config/tech-colors.ts`.

### Yggdrasil (Growth Tree)

Interactive skill tree visualization at `/growth/2026` for tracking learning goals.

**Source:**
- Main: `src/routes/growth/2026/+page.svelte`
- Graph: `src/routes/growth/2026/components/GrowthGraph2D.svelte`
- Layout: `src/routes/growth/2026/utils/elkLayout.ts`
- Data: `src/resources/growth2026.json`

**Features:**
- DAG layout using ELK.js for deterministic node positioning
- Canvas-rendered nodes with Pokemon Game Boy styling
- Branch color coding with Pokemon sprite mascots
- Tier system: Roots (foundations) -> Trunk (techniques) -> Branch (specializations) -> Crown (capstones)
- Status tracking: locked, available, in_progress, complete
- Filter panel for branches, tiers, and status
- Click-to-select with detail panel

**Node structure in JSON:**
```json
{
  "id": "node-id",
  "title": "Human Title",
  "branch": "systems-hpc",
  "tier": "trunk",
  "prerequisites": ["other-node"],
  "status": "available",
  "estimate_hours": 15
}
```

### Pokemon Sprite System

Site-wide Pokemon Game Boy aesthetic using sprite sheets.

**Source:**
- Sprites: `src/lib/components/pkmn/pokemon.svelte`
- Framed: `src/lib/components/pkmn/frame.svelte`
- CSS: `src/styles/pokesprite-pokemon-gen8.css`
- Data: `src/resources/pokemonClasses.json`

**Usage in markdown:**
```svelte
<script>
import PokemonSprite from '$lib/components/pkmn/pokemon.svelte'
</script>

<PokemonSprite pokemonName="pikachu" size="large" />
```

The CSS uses background-position to display individual Pokemon from a spritesheet.

### Search Modal

Ctrl+K triggered full-text search powered by FlexSearch.

**Source:** 
- Modal: `src/lib/components/search_modal.svelte`
- Index: `src/routes/search-index.json/+server.ts`

**Features:**
- Full-text search across post content (not just titles/tags)
- Powered by FlexSearch (~6KB gzipped)
- Lazy-loaded index - only fetches when search opens
- Searches posts AND static pages
- Weighted scoring: title (100) > tags (50) > summary (30) > content (10)
- Arrow key navigation with auto-scroll
- Loading state while index builds

**How it works:**
1. User presses Ctrl+K to open search
2. `/search-index.json` is fetched (contains post content as plain text)
3. FlexSearch Document index is built client-side
4. Index is cached for subsequent searches
5. Results ranked by field matches

### LaTeX Math Rendering

Math expressions rendered via KaTeX through `rehype-katex-svelte`.

**Configuration:** `mdsvex.config.ts`

**Syntax:**
- Inline math: `$x + y$`
- Display math: `$$\nabla_\theta J(\theta) = ...$$`

**Custom macros defined:**
```js
macros: {
  "\\CC": "\\mathbb{C}",
  "\\vec": "\\mathbf",
}
```

**Important:** Do NOT use `\(` or `\[` delimiters - they are not supported in MDSvex. Always use `$` and `$$`.

### Mermaid Diagrams

Dynamic diagram rendering with theme-aware colors.

**Source:** `src/lib/components/prose/mermaid.svelte`

**Features:**
- Reads DaisyUI CSS variables for theme colors
- Converts HSL to hex for Mermaid compatibility
- Auto-rerenders on theme change via MutationObserver
- Unique IDs prevent conflicts with multiple diagrams

**Usage in markdown:**
````markdown
```mermaid
graph LR
    A[Start] --> B[Process]
    B --> C[End]
```
````

The component extracts `--b1`, `--p`, `--bc` CSS variables from DaisyUI and maps them to Mermaid's theme system.

### Python Code Annotator

Side-by-side documentation and code display, inspired by literate programming.

**Source:** `src/lib/components/prose/code.svelte`

**Features:**
- Fetches Python file from URL at runtime
- Parses docstrings and comments as documentation
- Renders docs as markdown (via `mdsvex_processor.js`)
- Syntax highlights code with highlight.js
- Two-column layout: docs left, code right
- Responsive: stacks vertically on mobile

**Usage:**
```svelte
<script>
import PythonCode from '$lib/components/prose/code.svelte'
</script>

<PythonCode 
  sourceUrl="/annotations/elo_calculator.py" 
  title="Elo Calculator" 
/>
```

**Python file format:**
```python
"""
## Section Title

Markdown documentation here.
"""

def my_function():
    """
    Function docstring becomes docs panel content.
    """
    code_here()  # This appears in code panel
```

The parser detects:
- Triple-quoted docstrings (`"""` or `'''`)
- Comment blocks starting with `#`
- Function/class definitions to create new sections


## Content Structure

Posts live in `src/routes/(posts)/<slug>/+page.md` (the `(posts)` group doesn't appear in URLs). Create one with `pnpm new-post`. Images and PDFs go in `static/assets/` and are referenced as `/assets/...`. If `updated` is omitted from frontmatter it's taken from the file's last git commit.

**Importing components in markdown:**
```js
<script>
import PokemonSprite from '$lib/components/pkmn/pokemon.svelte'
import Sprite from '$lib/components/pkmn/sprite.svelte'
import Framed from '$lib/components/pkmn/frame.svelte'
</script>
```

**Key files:**
- Home page: `src/routes/+page.svelte`
- Post container: `src/lib/components/post_container.svelte`
- Site config: `src/lib/config/site.ts`
- Portfolio data: `src/lib/config/portfolio.ts`


## Yggdrasil Commands

Growth pages live in `src/routes/growth/2026/<node-id>/+page.md`.

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

### Creating a Page for a Single Existing Node

If a node exists in `growth2026.json` but doesn't have a page yet:

```bash
pnpm run growth:page <node-id>
```

Example:
```bash
pnpm run growth:page distributed-training-mental-models
```

### Backfilling Pages for All Existing Nodes

To generate pages for ALL nodes in `growth2026.json` that don't have pages:

```bash
pnpm run growth:backfill
```

### File Structure

```
src/routes/growth/2026/
├── <node-id>/+page.md        # Node content
├── +page.svelte              # Main graph visualization
├── types.ts                  # TypeScript types
├── components/               # Graph UI components (GrowthGraph2D, GrowthControls)
└── utils/                    # Graph helpers (elkLayout, nodeUtils, graphHelpers)

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