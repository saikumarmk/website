---
title: "Slides example (research deck)"
summary: "Dual article + deck from one mdsvex file"
slides: true
toc: false
tags: ['slides', 'demo']
---

# Research-native slides

Same markdown: **article** at this URL, **deck** with `?mode=slides`.

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

Use class `slide-code-focus` on a wrapper for tighter code slides (theme CSS). Hello this is a test


---

## Two columns (HTML)

Use a grid or the `TwoColumn` component with named slots from MDX-style markup when supported; for plain MD, use:

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

- Live Svelte demos: import a component in this file as usual.
- Interactive charts: mount a client component inside a slide.
- Mermaid: use your existing Mermaid pipeline in markdown or components.
