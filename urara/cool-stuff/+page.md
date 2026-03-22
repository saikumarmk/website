---
title: "Elements of this Website"
slab_title: true
author: Sai Kumar Murali Krishnan
created: 2025-07-14
categories: [random, web-dev]
tags: [random, web-dev, slides, meta]
summary: "Kitchen sink for this site: nav map, search, themes, Mermaid, PythonCode, SlabTitle, Poké sprites, math, and slide layout demos—article or fullscreen deck."
slides: true
toc: false
---

# This site in one deck

**Article** at this URL · **present** with [`?mode=slides`](/cool-stuff?mode=slides) for fullscreen. **Mermaid**, **PythonCode**, **SlabTitle**, and **PokemonSprite** come from `post_layout.svelte` (mdsvex layout exports)—works in **split slides** and **SSR**.

---

## Quick links

- **[Portfolio](/portfolio)** · **[Archive](/archive)** · **[Playbook](/playbook)** · **[About](/about)**
- **Project Dex** — [`/portfolio/projects`](/portfolio/projects) · **Yggdrasil 2026** — [`/growth/2026`](/growth/2026)

---

## Navigation & main pages

- **About** — [`/about`](/about)
- **Portfolio** — [`/portfolio`](/portfolio) · **Project Dex** — [`/portfolio/projects`](/portfolio/projects)
- **Archive** — [`/archive`](/archive) (all posts)
- **Playbook** — [`/playbook`](/playbook) → FAQ, timeline, résumé, interviews (`guide-to-tech-*`)
- **Documents** (header) — résumé PDF, thesis
- **Monash handbook graph** — external link in the nav

---

## Features

- **⌘K / Ctrl+K** — full-text search (posts + static pages)
- **Theme** — palette picker in the header (DaisyUI)
- **Atom** / **Sitemap** — footer
- **Slides** — `slides: true` in frontmatter + `?mode=slides` for deck mode (this page)

---

## Diagrams & code embeds

<SlabTitle title="Diagrams & code" slug="cool-elements" config="3c 2.5 3c 2.5i" />

<div class="not-prose max-w-full overflow-hidden">

<Mermaid graph="graph LR
  site[saikumarmk.com] --> archive[Archive]
  site --> portfolio[Portfolio]
  archive --> posts[Posts]" />

</div>

<Mermaid graph='sequenceDiagram
    Alice ->> Bob: Hello Bob, how are you?
    Bob-->>John: How about you John?
    Bob--x Alice: I am good thanks!
    Bob-x John: I am good thanks!
    Note right of John: Bob thinks a long<br/>long time, so long<br/>that the text does<br/>not fit on a row.
    Bob-->Alice: Checking with John...
    Alice->John: Yes... John, how are you?'/>

<div class="not-prose slide-code-focus">

<PythonCode sourceUrl="/annotations/ponder.py" title="PonderNet (annotated Python)" />

</div>

---

## Sprites (layout component)

**PokemonSprite** uses the same mdsvex layout mapping as Mermaid—no per-file `<script>` import.

<div class="not-prose flex flex-wrap items-end gap-8">

<div class="flex flex-col items-center gap-2">
  <PokemonSprite pokemonName="pikachu" />
  <span class="text-sm opacity-70">Block</span>
</div>

<div class="flex flex-col gap-2">
  <p class="text-sm opacity-90">Inline next to text: <PokemonSprite pokemonName="eevee" inline={true} /></p>
</div>

</div>

---

## Math and prose

Inline: $e^{i\pi} + 1 = 0$.

Display:

$$
\nabla \cdot \mathbf{E} = \frac{\rho}{\varepsilon_0}
$$

---

## Code-heavy slide

```python
def hello():
    return "minimal · code-first"
```

Use class `slide-code-focus` on a wrapper for tighter code slides (theme CSS).

---

## Two columns (HTML)

<div class="slide-two-col not-prose">

<div>

### Left

Bullet one  
Bullet two

</div>

<div>

### Right

More content here.

</div>

</div>

---

## Stagger utility

Apply classes `stagger-1` … `stagger-6` to block elements for delayed fade (see `slide-theme.css`).

<p class="stagger-1 opacity-90">First point</p>
<p class="stagger-2 opacity-90">Second point</p>

---

## Full bleed

Wrap content in `class="slide-full-bleed"` for edge-to-edge (theme variable `--slide-bleed`).

---

## Next steps

- **Browse** [Portfolio](/portfolio) and [Archive](/archive)
- **Search** with ⌘K — try company names, tags, or post titles
- **Deck mode**: add `?mode=slides` to this URL for fullscreen slides
