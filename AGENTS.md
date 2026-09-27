# Agent Guide for saikumarmk.com Website

## Project Overview

This is a personal website and blog built with SvelteKit (originally forked from the Urara template, since fully detached). The site is available at [https://www.saikumarmk.com](https://www.saikumarmk.com).

**Technology Stack:**
- **Framework:** SvelteKit 2 + Svelte 5 (runes) with TypeScript
- **Styling:** TailwindCSS, DaisyUI, UnoCSS
- **Markdown:** MDSvex (Svelte + MDX) for content rendering
- **3D Graphics:** Three.js for interactive visualizations
- **Build Tool:** Vite 8 (Rolldown); tests with Vitest and Playwright
- **Node:** 22.18+ (config files are `.ts` and loaded by Node's built-in type stripping; there is no compile step)
- **Deployment:** Supports Netlify, Vercel, static hosting, and Node adapter

## Repository Structure

### 📁 `src/` - Application Code

Contains all the SvelteKit application code that builds the site.

#### `src/lib/` - Core Libraries
- **`components/`** - Svelte components
  - `extra/` - Special components (YouTube, Spotify, SoundCloud embeds, projects display)
  - `pkmn/` - Pokemon sprite and frame components (unique feature of this site)
  - `portable-portfolio/` - Portfolio badge, experience, and project components
  - `prose/` - Markdown rendering components (code blocks, images, tables, Mermaid diagrams)
  - `three/` - Three.js canvas components for 3D visualizations
  - Layout components: `header.svelte`, `footer.svelte`, `post_container.svelte`, etc.

- **`config/`** - Configuration files
  - `site.ts` - Site metadata, author info, theme
  - `portfolio.ts` - Portfolio data configuration
  - `projects.ts` - Projects listing
  - `post.ts` - Post/blog configuration
  - `general.ts` - General site settings
  - `icon.ts` - Icon configurations

- **`stores/`** - Svelte stores for state management
  - `background.ts` - Background state
  - `portfolio.ts` - Portfolio state
  - `posts.ts` - Posts/blog state
  - `title.ts` - Page title state

- **`types/`** - TypeScript type definitions
  - Mirrors config structure with type definitions for site, portfolio, posts, etc.

- **`utils/`** - Utility functions
  - `posts.ts` - Post processing utilities
  - `badge.ts`, `case.ts`, `color.ts` - Helper utilities

#### `src/routes/` - Pages and Routes
- Uses SvelteKit's file-based routing
- **`+page.svelte`** - Homepage
- **`+layout.svelte`** - Root layout
- **`+layout.ts`** - Layout data loading
- **Route folders:** Each folder represents a page/post (e.g., `about/`, `portfolio/`, `projects/`)
- **`+page.md`** files in route folders are blog posts/pages rendered via MDSvex
- **`+page.svelte.md`** - Special Svelte-enhanced markdown pages
- **API routes:** Folders ending with `/+server.ts` (e.g., `atom.xml/`, `feed.json/`, `sitemap.xml/`)

#### `src/styles/` - Stylesheets
- CSS files for Pokemon Game Boy styling, syntax highlighting (GitHub theme)
- Custom fonts (Pokemon GB, PressStart2P)
- Pokesprite sprite sheets and CSS

#### `src/resources/` - Static Resources
- `favicon.png`
- JSON data files (`network2022.json`, `network2024.json`, `pokemonClasses.json`)

#### Root Files in `src/`
- `app.html` - HTML template
- `app.pcss` - PostCSS/TailwindCSS entry point
- `app.d.ts` - TypeScript declarations
- `hooks.server.ts` - SvelteKit server hooks

### 📁 `src/routes/(posts)/` - Markdown Content

**This is where all blog posts live.** `(posts)` is a SvelteKit route group: it organises folders without appearing in the URL, so `src/routes/(posts)/guide-to-tech-1/+page.md` is served at `/guide-to-tech-1/`.

- Each subfolder is a post; **`+page.md`** holds the markdown, **`+page.svelte.md`** can embed Svelte components
- **Frontmatter** controls metadata (title, tags, topic, created, etc.). `updated` is optional: when omitted it comes from the file's last git commit (pure renames are ignored), falling back to the file's mtime for uncommitted work
- Yggdrasil node pages live in `src/routes/growth/2026/<node-id>/+page.md`
- `src/routes/(drafts)/` is gitignored, for local-only drafts

### 📁 `static/` - Static Assets (committed)

- `static/assets/` - images, PDFs and media used in posts, referenced as `/assets/...`. Post images under here get AVIF `srcset`s generated at build time (`src/lib/components/prose/img.svelte`)
- `static/annotations/` - source files for annotated code blocks; edits trigger a full reload in dev

### 🔧 Configuration Files (Root)

- **`package.json`** - Dependencies and scripts
- **`svelte.config.ts`** - SvelteKit configuration, adapter selection
- **`vite.config.ts`** - Vite build configuration
- **`tailwind.config.ts`** - TailwindCSS configuration
- **`mdsvex.config.ts`** - MDSvex (markdown) configuration, incl. the post-metadata remark plugin (slug, path, ToC, updated)
- **`tsconfig.json`** - TypeScript configuration
- **`netlify.toml`** - Netlify deployment configuration

Config files import each other with explicit `.ts` extensions (e.g. `./mdsvex.config.ts`), because Node loads them directly.

## Key Features & Patterns

### 1. Content Management
- **Primary content location:** `src/routes/(posts)/`
- **Content format:** Markdown files with `.md` or `.svelte.md` extensions
- **Frontmatter:** Posts use YAML frontmatter for metadata
- **New post:** `pnpm new-post` scaffolds `src/routes/(posts)/<slug>/+page.md` (requires a topic)

### 2. Pokemon Theme
- Site has a unique Pokemon-themed aesthetic
- Pokemon sprites rendered using `src/lib/components/pkmn/` components
- Sprite data in `src/resources/pokemonClasses.json`
- CSS classes for Pokemon Game Boy styling

### 3. Portfolio System
- Configuration in `src/lib/config/portfolio.ts`
- Components in `src/lib/components/portable-portfolio/`
- Dedicated portfolio page at `/portfolio`

### 4. Code Syntax Highlighting
- Uses `rehype-pretty-code` with Shiki
- GitHub theme styling in `src/styles/github.css`
- Configured in `mdsvex.config.ts`

### 5. 3D Visualizations
- Three.js components in `src/lib/components/three/`
- Special routes like `/monash-graph-2d` and `/monash-graph-3d` use force graphs
- Network data in `src/resources/network2022.json` and `network2024.json`

### 6. Math Rendering
- KaTeX support via `rehype-katex-svelte`
- Inline: `\(...\)`, Block: `\[...\]` or `$$...$$`

### 7. Mermaid Diagrams
- Mermaid component in `src/lib/components/prose/mermaid.svelte`
- Used in markdown via code blocks with `mermaid` language tag

## Development Workflow

### Scripts
- **`pnpm dev`** - Vite dev server on http://127.0.0.1:5173
- **`pnpm build`** - Production build (`vite build`, prerenders everything)
- **`pnpm preview`** - Preview production build
- **`pnpm test`** - Vitest unit tests
- **`pnpm exec playwright test`** - e2e tests (builds and previews on :4173)

### Adding New Content

**Blog Posts:**
1. `pnpm new-post`, or create `src/routes/(posts)/my-new-post/+page.md` by hand
2. Put images in `static/assets/<post>/` and reference them as `/assets/<post>/...`

**Pages:**
1. For custom Svelte pages: create in `src/routes/my-page/+page.svelte`
2. For markdown pages: create in `src/routes/my-page/+page.md` (outside `(posts)` if it shouldn't be listed as a post)

**Components:**
- Reusable components go in `src/lib/components/`
- Can be imported in `.svelte.md` files via script tags

### Styling
- TailwindCSS utility classes used throughout
- DaisyUI components available
- Custom styles in `src/app.pcss` and `src/styles/`

## Important Conventions

### File Naming
- **Routes:** Use kebab-case for folder names (e.g., `guide-to-tech-1/`)
- **Components:** Use PascalCase or snake_case (e.g., `post_container.svelte`)
- **Config:** Use lowercase with `.ts` extension

### Import Aliases
- `$lib/` → `src/lib/`
- `$routes/` → `src/routes/` (implicit)

### Component Structure
- Layout components wrap content with consistent styling
- `post_container.svelte` handles blog post rendering
- `header.svelte` and `footer.svelte` provide site-wide navigation

### State Management
- Svelte stores in `src/lib/stores/`
- Import stores in components as needed
- Reactive with `$` prefix in Svelte components

## API Routes & Feeds

The site provides several generated endpoints:
- `/atom.xml` - Atom feed
- `/feed.json` - JSON feed
- `/sitemap.xml` - Sitemap
- `/posts.json` - Posts API
- `/tags.json` - Tags API
- `/manifest.webmanifest` - PWA manifest

Implemented as SvelteKit server endpoints (`+server.ts` files).

## TypeScript

- Full TypeScript support
- Type definitions in `src/lib/types/`
- Strict typing for configuration files
- `tsconfig.json` configures compiler options

## Testing & Linting

- **Format:** `npm run format` (Prettier)
- **Lint:** `npm run lint` (ESLint + Prettier check)
- **Type check:** `npm run check` (svelte-check)

## Deployment

Site can be deployed to:
- **Netlify** (auto-detected, uses `@sveltejs/adapter-netlify`)
- **Vercel** (auto-detected, uses `@sveltejs/adapter-auto`)
- **Static hosting** (default, uses `@sveltejs/adapter-static`, outputs to `build/`)
- **Node server** (set `ADAPTER=node`, uses `@sveltejs/adapter-node`)

Configuration in `svelte.config.ts` automatically selects adapter based on environment.

## Working with This Codebase

### To modify site content:
- Edit files in `src/routes/(posts)/`
- Markdown content in `+page.md` files
- Images/assets in `static/assets/`

### To modify site behavior:
- Edit components in `src/lib/components/`
- Modify configuration in `src/lib/config/`
- Update routes in `src/routes/`

### To modify styling:
- Edit TailwindCSS in `tailwind.config.ts`
- Add global styles to `src/app.pcss`
- Modify component-specific styles in `.svelte` files

### To add features:
- Create new components in `src/lib/components/`
- Define types in `src/lib/types/`
- Add utilities in `src/lib/utils/`
- Create new routes in `src/routes/`

## Special Considerations

1. **Pokemon sprites:** Use classes from `pokesprite-pokemon-gen8.css` and data from `pokemonClasses.json`
2. **Random bio:** Site bio on homepage is randomized on each build (see `site.ts`)
3. **Large memory allocation:** Dev/build scripts use `--max_old_space_size=7680` for Node
4. **Frontmatter processing:** Uses `fff-flavored-frontmatter` for enhanced frontmatter parsing
5. **Naming:** post types live in the `Blog` namespace (`Blog.Post`, `Blog.Page`), prose styles use `.post-prose`, and env overrides use the `SITE_` prefix (`SITE_PROTOCOL`, `SITE_DOMAIN`)

## Important Technical Details & Gotchas

### SSR (Server-Side Rendering) Safety
- **Never subscribe to page stores on the server:** Use `onMount` to subscribe to `$page` store only on client side
- **Always check for null/undefined:** Components may receive `null` or `undefined` during SSR. Always add guards:
  - Check `if (browser)` before accessing browser-only APIs
  - Use optional chaining (`post?.property`) and nullish coalescing (`post ?? fallback`)
  - Add `if (Array.isArray(data))` checks before array operations

### Post Metadata
- **Slugs contain file paths:** Post slugs include `/+page.md` or `/+page.svelte.md` extensions and may use backslashes on Windows
- **Normalize paths:** Always normalize slugs by:
  - Replacing backslashes with forward slashes
  - Removing file extensions (`/\+page\.(md|svelte\.md)$/g`)
  - Stripping leading/trailing slashes
- **Dual path system:** Posts have both `slug` (with file extension) and `path` (clean URL path). Try both when detecting series.

### Store Subscriptions
- **Avoid reactive subscriptions:** Never put store subscriptions inside reactive statements (`$:`), as this creates infinite loops
- **Subscribe once:** Subscribe to stores at component initialization, not inside reactive blocks
- **MutationObserver gotchas:** Filter mutations to avoid triggering on your own DOM changes

### Component Slots
- **Named slots in cards:** When adding breadcrumbs or other elements to cards, use named slots (`<svelte:fragment slot="breadcrumb">`)
- **Check for slot content:** Not all posts may provide slot content, so components should handle empty slots gracefully

### Spacing and Layout
- **Fixed header height:** Header is fixed with `max-h-[4.125rem]`, content should have matching `pt-[4.125rem]` to avoid overlap
- **Card padding:** Default card-body has padding, align breadcrumbs with `px-4 md:px-8` to match
- **Margin vs Padding:** Use padding (`pt-*`) instead of margin (`mt-*`) on main containers to avoid creating gaps above content

## Code Review Findings & Best Practices (Nov 2025)

### Security

#### ❌ Avoid innerHTML with User Input
**Problem:** Using `innerHTML` with user-provided data creates XSS vulnerabilities
```typescript
// BAD - XSS vulnerability
toast.innerHTML = `<span>${userInput}</span>`
```

**Solution:** Use Svelte components for dynamic content
```typescript
// GOOD - Safe, reactive, animated
<Toast message={userInput} type="success" />
```

#### ✅ Always Escape User Content
- Let Svelte handle escaping automatically
- Use `{@html}` directive **only** for trusted content
- Create reusable components for notifications/alerts instead of string templates

### Component Architecture

#### Monash Graph Refactor (Nov 2025)
Successfully refactored `monash-graph-2d` and `monash-graph-3d` from 534-line monolithic file into clean, maintainable architecture:

**Structure:**
```
src/routes/monash-graph/
├── +page.svelte              # Main coordinator (67 lines)
├── types.ts                  # Type definitions
├── components/
│   ├── FilterTags.svelte     # Reusable tag input
│   ├── GraphControls.svelte  # Search & filters
│   ├── UnitInfo.svelte       # Unit details
│   ├── Graph2D.svelte        # 2D visualization
│   ├── Graph3D.svelte        # 3D visualization
│   └── Toast.svelte          # Notification component
└── utils/
    ├── unitUtils.ts          # Unit-specific helpers
    └── graphHelpers.ts       # Graph operations
```

**Key Improvements:**
1. **Separation of Concerns:** Each file has single responsibility
2. **No Direct DOM Manipulation:** Svelte reactivity instead of `getElementById`
3. **SSR Safe:** Dynamic imports for graph libraries
4. **Type Safety:** Full TypeScript coverage
5. **Security:** No innerHTML or string-based HTML generation
6. **Reusability:** Components can be used independently
7. **Maintainability:** 8 focused files vs 1 mega-file

### DaisyUI Collapse Components

#### ✅ Correct Structure
DaisyUI collapse requires specific structure (not standard `<details>/<summary>`):
```svelte
<!-- CORRECT -->
<div class="collapse collapse-arrow bg-base-300">
  <input type="checkbox" class="peer" />
  <div class="collapse-title">Title</div>
  <div class="collapse-content">
    <div class="pt-2">Content</div>
  </div>
</div>

<!-- INCORRECT - Won't work -->
<details class="collapse">
  <summary class="collapse-title">Title</summary>
  <div class="collapse-content">Content</div>
</details>
```

**Key Points:**
- Hidden checkbox controls open/close state
- Add `class="peer"` for proper CSS targeting
- Wrap content in extra div with `pt-2` for spacing
- `collapse-arrow` adds chevron indicator

### Layout & Fixed Elements

#### ✅ Proper Fixed Panel Layout
When building full-screen apps with fixed sidebars and scrollable content:

```svelte
<div class="h-screen flex flex-col overflow-hidden">
  <!-- Header: Fixed height -->
  <div class="navbar flex-none">...</div>
  
  <!-- Main: Fills remaining space -->
  <div class="flex-1 flex overflow-hidden relative">
    <!-- Fixed sidebar (left) -->
    <div class="w-80 flex-none absolute lg:relative">...</div>
    
    <!-- Scrollable content (center) -->
    <div class="flex-1 overflow-hidden">
      <!-- Graph/canvas with absolute positioning -->
      <div class="w-full h-full absolute inset-0">...</div>
    </div>
    
    <!-- Fixed sidebar (right) -->
    <div class="w-80 flex-none absolute lg:relative right-0">...</div>
  </div>
</div>
```

**Key Principles:**
- `h-screen` + `overflow-hidden` on root prevents scrolling issues
- `flex-none` prevents headers/sidebars from shrinking
- `flex-1` allows content to fill remaining space
- `absolute` on mobile, `relative` on desktop for responsive sidebars
- `inset-0` for graphs ensures they fill container completely
- High `z-index` (z-30+) keeps sidebars above canvas

### Data Handling

#### ✅ Pass Complete Objects, Not Lookups
**Problem:** Filtered data breaks index-based lookups
```typescript
// BAD - index_map refers to original array
const node = graphData.nodes[graphData.index_map[unitId]]
// Breaks when graphData is filtered!
```

**Solution:** Pass the node object directly
```typescript
// GOOD - No lookups needed
export let node: UnitNode
$: unlocks = node.unlocks  // Direct access
$: requires = node.requires
```

#### ✅ Keep Data Close to Usage
- Pass full objects to components
- Derive computed values inside components
- Avoid storing derived state at parent level

### File Cleanup Checklist

When refactoring, always clean up:
- ✅ Old/replaced files and folders
- ✅ Backup files (`.backup`, `.old`, etc.)
- ✅ Empty directories
- ✅ Unused TypeScript interfaces
- ✅ Debug/console statements
- ✅ Commented-out code blocks
- ✅ Unused imports
- ✅ Prototype pages (or move to `/prototypes/`)

**Cleanup Commands:**
```powershell
# Remove old files
Remove-Item -Path "src/routes/old-feature" -Recurse -Force

# Find unused exports
grep -r "export.*function\|export.*const" src/
# Then search for usage across codebase
```

### Prototypes Directory

The `/src/routes/prototypes/` directory contains experimental features:
- **Purpose:** Show multiple design options to user for evaluation
- **Naming:** Use descriptive names (`portfolio-carousel`, `timeline-toggle`)
- **Status:** Keep until user decides on final implementation
- **Cleanup:** Delete unused prototypes after features are implemented

**Current Prototypes (Nov 2025):**
- `sitemap-*`: Three sitemap styles (force/tree/hybrid) → Hybrid selected for `/archive`
- `timeline-*`: Timeline views → Toggle style integrated
- `portfolio-*`: Portfolio layouts → Timeline/carousel integrated
- `homepage-*`: Homepage variants → Not used, can be deleted
- `pokemon-portfolio`: Pokemon theme ideas → Inspiration only

### Graph Visualization Patterns

#### DAG Mode vs Force-Directed
When building graphs with different view modes:

```typescript
// State determines layout
$: isDAGMode = unitCodes.length > 0

// Apply different configurations
if (isDAGMode) {
  Graph.dagMode('lr')           // Left-to-right layout
  Graph.dagLevelDistance(300)   // Spacing
  Graph.cooldownTicks(Infinity) // Fixed layout
  Graph.nodeCanvasObject(drawLabels)  // Show labels
} else {
  Graph.dagMode(null)           // Normal force
  Graph.cooldownTicks(0)        // Auto-stabilize
  Graph.nodeCanvasObjectMode(highlightMode)  // Highlights only
}
```

**Use Cases:**
- **DAG Mode:** Specific unit paths, prerequisite chains
- **Force-Directed:** Full graph exploration, organic clustering

### Comments & User Engagement

#### Giscus Integration
- **Configuration:** Store in `src/lib/config/post.ts`
- **Per-post control:** Use frontmatter flag `comment-disabled: true`
- **Theme:** Use `preferred_color_scheme` for automatic light/dark matching
- **CSS Fixes:** Add custom styles to `src/app.pcss` for readability issues

```typescript
// post.ts
export const post: PostConfig = {
  comment: {
    use: ['Giscus'],
    giscus: {
      repo: 'user/repo',
      repoID: 'ID',
      categoryID: 'ID',
      theme: 'preferred_color_scheme'  // Auto-detects theme
    }
  }
}
```

### Search & Navigation

#### Keyboard Shortcuts (Ctrl+K)
When implementing modal search:
- Use separate modal component, not replace inline search
- Bind keyboard events to input field, not window
- Implement arrow key navigation with `scrollIntoView`
- Use `data-*` attributes for selection tracking

```svelte
<input 
  on:keydown={handleKeys}
  bind:value={query}
/>

{#each results as result, i}
  <a 
    href={result.path}
    data-search-index={i}
    class:selected={i === selectedIndex}>
    {result.title}
  </a>
{/each}
```

### Series & Breadcrumb Navigation

#### Slug Normalization
Always normalize post slugs before comparison:
```typescript
const cleanSlug = slug
  .replace(/\\/g, '/')                    // Windows backslashes
  .replace(/\/\+page\.(md|svelte\.md)$/g, '') // File extensions
  .replace(/^\/+|\/+$/g, '')              // Leading/trailing slashes
```

#### Series Navigation
- Sort parts by numeric value, not array order
- Handle decimal parts (e.g., 2.5)
- Display special labels for part 0 (e.g., "FAQ")

```typescript
const sortedParts = [...series.parts].sort((a, b) => a.part - b.part)
const currentIndex = sortedParts.findIndex(p => p.part === currentPart)
```

### Portfolio & Timeline Views

Successfully integrated multiple view modes:
- **Timeline:** Chronological experience + projects
- **Carousel:** Project showcase with navigation
- **List:** Detailed text view (original)

**Pattern:** Unified page with view switcher
```svelte
<div class="flex justify-center gap-2">
  <button on:click={() => view = 'timeline'}>Timeline</button>
  <button on:click={() => view = 'carousel'}>Projects</button>
  <a href="/portfolio/list">List View</a>
</div>

{#if view === 'timeline'}
  <TimelineView />
{:else if view === 'carousel'}
  <CarouselView />
{/if}
```

## Yggdrasil (Growth Tree 2026)

### Overview

**Yggdrasil** is the interactive skill tree system at `/growth/2026`. It visualizes learning goals as a directed acyclic graph (DAG) with nodes representing skills and edges showing prerequisites.

**Architecture Pattern:**
- Follows "Monash Graph Refactor" pattern
- Coordinator `+page.svelte` with components/ and utils/ folders
- SSR-safe dynamic imports for graph libraries
- No direct DOM manipulation, pure Svelte reactivity

### Branch Names

Use short, memorable names:
- `systems-hpc` - Systems & distributed training
- `gen-media` - Generative video & media
- `rl` - Reinforcement learning & post-training
- `maths` - Mathematical foundations
- `swe` - Software engineering
- `physics` - Physics & astrophysics

### Node Tier Structure

**Critical:** Tiers follow a "roots → trunks → branches → crown" metaphor where:

- **Roots:** Foundational **mental models and concepts**. Pure understanding, not implementation.
  - Example: "Distributed Training Mental Models" (conceptual understanding of DP/FSDP/ZeRO)
  - NOT: "Fault Tolerance" (that's a technique, not a mental model)

- **Trunks:** **Practical techniques and implementations**. Things you build/do.
  - Example: "Fault Tolerance & Suspend/Resume", "Research Harness v2"
  - Trunks implement concepts learned in roots

- **Branches:** Specialized or optional deep dives
  - Example: "Long-Context Parallelism", "Three.js Journey"

- **Crown:** Capstone projects that integrate multiple skills
  - Example: "Reproduce + Extend Video Model", "RL for Structured Outputs"

**Bad example (before refactor):**
```json
{
  "id": "fault-tolerance",
  "tier": "roots"  // ❌ This is a technique, not a foundational concept
}
```

**Good example (after refactor):**
```json
{
  "id": "distributed-training-mental-models",
  "tier": "roots"  // ✅ This is foundational understanding
}
```

### Content Creation Workflow

**Pages live in `src/routes/growth/2026/<node-id>/+page.md`**

**Generator scripts:**
- `npm run growth:new` - Create new node page + update JSON
- `npm run growth:backfill` - Create pages for existing JSON nodes

**Node page structure:**
```markdown
---
title: 'Node Title'
created: YYYY-MM-DD
updated: YYYY-MM-DD
tags: [tag1, tag2]
growth:
  node_id: 'node-id'
  branch: 'branch-name'
  tier: 'roots|trunk|branch|crown'
  estimate_hours: 15
---

<script context="module">
  export const concepts = [
    { id: 'concept-1', title: 'Concept Title' },
  ];
</script>

<script>
  import ConceptChecklist from '$lib/components/growth/ConceptChecklist.svelte';
</script>

## Overview

Content here...

## Key Concepts

<ConceptChecklist nodeId="node-id" {concepts} />
```

### MDSvex & LaTeX Critical Rules

**LaTeX Syntax (ALWAYS use these):**
- ✅ **Inline math:** `$x + y$` 
- ✅ **Display math:** `$$\nabla_\theta J(\theta) = ...$$`
- ❌ **NEVER use:** `\(x + y\)` or `\[...\]` (these are NOT supported in MDSvex)

**Comparison Operators (NEVER use raw < >):**
- ❌ `Model > GPU memory` → breaks (interpreted as HTML tag)
- ✅ `Model larger than GPU memory` → works
- ❌ `< 1B params` → breaks
- ✅ `Under 1B params` → works
- ❌ `>10:1 ratio` → breaks
- ✅ `greater than 10:1 ratio` → works

**Special Characters to Avoid:**
- ❌ `→` (arrow) - causes rendering issues
- ✅ Use `-`, `to`, or reword: "leads to", "results in"
- ❌ `<<` or `>>` operators
- ✅ Use words: "much less than", "much greater than"

**Markdown over HTML:**
- ✅ `**bold**` (NOT `<strong>bold</strong>`)
- ✅ `*italic*` (NOT `<em>italic</em>`)
- ✅ Lists with `-` or `1.` (NOT `<ul><li>`)
- ✅ Headings with `##` (NOT `<h2>`)

### Graph Visualization

**ELK.js for Layout:**
- Deterministic layered DAG positioning
- No force simulation (fixed positions)
- Custom canvas rendering for RPG aesthetic

**Node Rendering:**
- Drawn as cards with Pokemon Game Boy styling
- Branch color strips on left edge
- Tier badges (RT, TK, BR, CR)
- Status symbols (locked: dim + dashed, available: bright, complete: checkmark)
- Font: 'Pokemon GB' with pixelated rendering

**Edge Rendering:**
- Orthogonal elbow paths (right edge → left edge)
- Style based on target status
- Custom arrowheads

**Interaction:**
- Click node: select (no pan/zoom animation)
- Hover: highlight connected nodes
- Search + filters in left panel
- Node details in right panel

### Pokemon Integration

**Branch → Pokemon mapping:**
```typescript
'systems-hpc': { name: 'porygon-z' }
'gen-media': { name: 'smeargle' }
'rl': { name: 'alakazam' }
'maths': { name: 'metagross' }
'swe': { name: 'rotom' }
'physics': { name: 'magnezone' }
```

**Usage:**
```svelte
<div class="pokesprite pokemon {pokemon.name}"></div>
```

### ConceptChecklist Component

**Purpose:** Track mastery of sub-concepts within a node.

**Features:**
- Checkbox list with progress indicator
- Persists to localStorage (nodeId + conceptId)
- Pokemon GB styling
- MDSvex-safe

**Usage in frontmatter:**
```markdown
<script context="module">
  export const concepts = [
    { id: 'concept-id', title: 'Concept Title' }
  ];
</script>

<ConceptChecklist nodeId="node-id" {concepts} />
```

### Common Pitfalls

❌ **Using index-based lookups:** Store nodes keyed by ID, pass full objects

❌ **Mixing LaTeX delimiters:** Don't use `\(` and `$` in same file

❌ **Raw comparison operators:** Always spell out "greater than", "less than"

❌ **Unicode arrows in markdown:** Causes rendering failures

❌ **Wrong tier assignment:** Techniques are trunks, not roots

❌ **HTML tags in markdown:** MDSvex already converts markdown to HTML

### Key Resources Integration

**Pattern for embedding external resources:**
```markdown
### 📚 Essential Reading

**Resource Name** (Source)  
[URL](URL)

Brief description with **emphasis** on why it's essential.
```

**Examples:**
- Nanotron Ultra-Scale Playbook (HuggingFace)
- RLHF Book (rlhfbook.com)
- MIT Diffusion Course 2025
- Papers with direct arXiv links

### Data Structure

**JSON Schema:**
```json
{
  "year": 2026,
  "branches": ["systems-hpc", "gen-media", ...],
  "nodes": [
    {
      "id": "kebab-case-id",
      "title": "Human Readable Title",
      "branch": "branch-name",
      "tier": "roots|trunk|branch|crown",
      "prerequisites": ["id1", "id2"],
      "status": "locked|available|in_progress|complete",
      "estimate_hours": 15,
      "tags": ["tag1", "tag2"],
      "artifact": { "type": "repo|blog|notebook|demo", "url": "" },
      "page_path": "/growth/2026/node-id"
    }
  ],
  "edges": [
    { "source": "prereq-id", "target": "node-id" }
  ]
}
```

### File Structure

```
src/routes/growth/2026/
├── +page.svelte              # Coordinator
├── types.ts                  # TypeScript types
├── components/
│   ├── GrowthControls.svelte # Left panel (filters)
│   ├── GrowthGraph2D.svelte  # Canvas visualization
│   └── NodeInfo.svelte       # Right panel (details)
└── utils/
    ├── graphHelpers.ts       # Data processing
    ├── nodeUtils.ts          # Node styling & helpers
    └── elkLayout.ts          # ELK layout engine

src/routes/growth/2026/
└── <node-id>/
    ├── +page.md              # Markdown content
    └── assets/               # Images, diagrams

src/resources/
└── growth2026.json           # Graph data

src/lib/components/growth/
└── ConceptChecklist.svelte   # Concept tracking

scripts/
├── new-growth-node.mjs       # Node generator
└── backfill-growth-pages.mjs # Batch page creator
```

## License

WTFPL (Do What The Fuck You Want To Public License)

---

**Last Updated:** December 2025 (Yggdrasil Integration: Dec 31, 2025)

