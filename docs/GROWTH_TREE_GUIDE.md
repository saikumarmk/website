# Yggdrasil Workflow Guide

## Overview

Yggdrasil (the Growth Tree) provides a frictionless workflow for creating skill nodes and tracking concept mastery.

## Quick Start

### Creating a New Node

Run the interactive generator:

```bash
npm run growth:new
```

You'll be prompted for:
- **Title**: Human-readable name (e.g., "Stochastic Calculus")
- **ID**: Kebab-case identifier (auto-suggested)
- **Branch**: One of: systems-hpc, gen-video, rl-posttraining, math-foundations, swe-craft, physics, research
- **Tier**: One of: roots, trunk, branch, crown
- **Tags**: Comma-separated (e.g., "math, stochastic, brownian-motion")
- **Estimate hours**: Number (e.g., 16)

This creates:
1. `urara/growth/2026/<id>/+page.md` - Your content page
2. `urara/growth/2026/<id>/assets/` - Asset folder
3. Updates `src/resources/growth2026.json` - Adds node entry

### Editing a Node Page

The created page template includes:

```markdown
---
title: 'Stochastic Calculus'
created: 2026-01-01
tags: [math, stochastic]
growth:
  node_id: 'math-stochastic-calc'
  branch: 'math-foundations'
  tier: 'roots'
  estimate_hours: 16
concepts:
  - id: brownian-motion
    title: "Brownian Motion Basics"
  - id: ito-lemma
    title: "Itô's Lemma Application"
---

<script>
  import ConceptChecklist from '$lib/components/growth/ConceptChecklist.svelte';
</script>

## Overview

...

## Key Concepts

<ConceptChecklist nodeId="math-stochastic-calc" concepts={frontmatter.concepts} />
```

### Adding Concepts

Edit the `concepts` array in frontmatter:

```yaml
concepts:
  - id: concept-slug
    title: "Concept Description"
```

**Pro tip**: Keep concepts granular and actionable. Think of them as "checkpoints" you can complete in one sitting.

## Features

### Concept Checklist Component

The `<ConceptChecklist>` component:
- Renders checkboxes for each concept
- Stores completion state in `localStorage`
- Shows progress (e.g., "3/5 mastered")
- Persists across browser sessions
- Works with SSR (only uses localStorage client-side)

**Storage key format**: `growth-concept-<nodeId>-<conceptId>`

### Dynamic Routes

- **Graph page**: `/growth/2026` - Visual skill tree
- **Node fallback**: `/growth/2026/[id]` - "Coming Soon" page for nodes without content
- **Node page**: `/growth/2026/<id>` - Full content page (overrides fallback)

### Page Features

Node pages support all existing site features:
- KaTeX math rendering
- Mermaid diagrams
- Syntax highlighting
- Code copy buttons
- Image lightbox
- MDSvex components

## Workflow Tips

### 1. Start with Concepts in Frontmatter

When creating a node, immediately add all concepts you want to master:

```yaml
concepts:
  - id: understand-sde
    title: "Understand SDE definition"
  - id: solve-toy-sde
    title: "Solve a toy SDE by hand"
  - id: implement-euler
    title: "Implement Euler-Maruyama"
```

### 2. Use Assets Folder

Store images, code, data in `urara/growth/2026/<id>/assets/`:

```markdown
![Brownian path](./assets/brownian-motion.png)
```

### 3. Deep Link to Concepts

Use anchor links for concepts:

```markdown
### Brownian Motion {#brownian-motion}
```

Link to it: `/growth/2026/math-stochastic-calc#brownian-motion`

### 4. Update Node Status

After completing all concepts, manually update `growth2026.json`:

```json
{
  "id": "math-stochastic-calc",
  "status": "complete"
}
```

Then commit and push to sync your progress!

### 5. Add Prerequisites

Edit `growth2026.json` to add dependencies:

```json
{
  "id": "math-stochastic-calc",
  "prerequisites": ["math-measure-prob"]
}
```

Don't forget to add the edge:

```json
"edges": [
  {
    "source": "math-measure-prob",
    "target": "math-stochastic-calc"
  }
]
```

## File Structure

```
urara/growth/2026/
├── math-stochastic-calc/
│   ├── +page.md           # Content page
│   └── assets/            # Images, code, etc.
│       └── .gitkeep
├── gen-ddpm-impl/
│   └── ...

src/resources/
└── growth2026.json        # Graph data

src/routes/growth/2026/
├── +page.svelte           # Graph visualization
├── [id]/+page.svelte      # Fallback route
├── components/            # Graph UI components
├── utils/                 # Graph helpers
└── types.ts              # TypeScript definitions

src/lib/components/growth/
└── ConceptChecklist.svelte # Concept tracking component
```

## Advanced: Manual Node Creation

If you prefer not using the script:

1. **Create folder**: `urara/growth/2026/<id>/`
2. **Create page**: `urara/growth/2026/<id>/+page.md`
3. **Add to JSON**: Edit `src/resources/growth2026.json`
4. **Run build**: `npm run urara:build` (or dev server auto-syncs)

## Troubleshooting

**Q: My page doesn't show up?**
- Make sure `urara:watch` is running (included in `npm run dev`)
- Check that the page is at `urara/growth/2026/<id>/+page.md`

**Q: Concepts don't persist?**
- Check browser console for errors
- localStorage must be enabled
- Try different browser if issues persist

**Q: Graph doesn't show new node?**
- Node must be in `growth2026.json`
- Refresh the page
- Check for JSON syntax errors

**Q: Math/Mermaid not rendering?**
- MDSvex handles this automatically
- Use standard syntax (see other pages for examples)

## Examples

Check these existing nodes for examples:
- `/growth/2026/math-measure-prob` (if created)
- `/growth/2026/gen-ddpm-impl` (if created)

---

**Happy skill building! 🌳**

