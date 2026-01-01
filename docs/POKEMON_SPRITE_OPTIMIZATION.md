# Pokemon Sprite Sheet Optimization Strategy

**Problem:** 2.8 MB sprite sheet (`pokesprite-pokemon-gen8.png`) loads on EVERY page, even though it's only used on:
- Homepage (random Pokemon in bio)
- Growth tree pages (`/growth/2026/*`)
- Pokemon component (rarely used)

**Current Implementation:**
- Global import in `src/app.pcss` (line 2)
- CSS sprite sheet with 800+ Pokemon sprites
- Single 2.8 MB PNG file

---

## Option A: Lazy Load CSS (Recommended - Easiest)

**Strategy:** Only load the sprite sheet CSS when needed

### Implementation:

1. **Remove global import from `app.pcss`:**
```css
/* Remove this line: */
@import 'styles/pokesprite-pokemon-gen8.css';
```

2. **Dynamically import in components that need it:**

```svelte
<!-- src/lib/config/site.ts - Homepage bio -->
<script>
  import { onMount } from 'svelte';
  
  onMount(() => {
    // Lazy load Pokemon sprites for homepage
    import('$lib/styles/pokesprite-pokemon-gen8.css');
  });
</script>
```

```svelte
<!-- src/routes/growth/2026/+page.svelte -->
<script>
  import '$lib/styles/pokesprite-pokemon-gen8.css';
</script>
```

**Pros:**
- Simple, minimal code changes
- Sprite sheet only loads on pages that need it
- No visual changes

**Cons:**
- Still loads full 2.8 MB when needed
- Slight delay before sprites appear

**Estimated savings:** 2.8 MB on 90% of pages

---

## Option B: Individual Sprite Images (Best Performance)

**Strategy:** Extract only the sprites we actually use into individual files

### Sprites Actually Used:
1. **Homepage bio:** 1 random Pokemon from `pokemonClasses.json` (~900 Pokemon)
2. **Growth tree:** 6 specific Pokemon (porygon-z, smeargle, alakazam, metagross, rotom, magnezone)

### Implementation:

1. **Create individual sprite PNGs:**
```bash
# Use Sharp to extract sprites from sheet
node scripts/extract-pokemon-sprites.mjs
```

2. **Update components to use `<img>` instead of CSS sprites:**

```svelte
<!-- Before (CSS sprite) -->
<span class="pokesprite pokemon pikachu"></span>

<!-- After (individual image) -->
<img src="/assets/pokemon/pikachu.png" alt="Pikachu" class="pokemon-sprite" />
```

3. **Lazy load images:**
```svelte
<img src="/assets/pokemon/pikachu.png" alt="Pikachu" loading="lazy" />
```

**Pros:**
- Only loads sprites that are actually displayed
- ~10-20 KB per sprite vs 2.8 MB sheet
- Better caching (individual sprites can be cached separately)
- No CSS parsing overhead

**Cons:**
- More work to implement
- Need to extract sprites from sheet
- Changes component API

**Estimated savings:** 2.7+ MB on all pages

---

## Option C: WebP Conversion + Lazy Load (Best Balance)

**Strategy:** Convert sprite sheet to WebP and lazy load

### Implementation:

1. **Convert PNG to WebP:**
```bash
npx sharp-cli \
  src/styles/images/pokesprite-pokemon-gen8.png \
  --format webp \
  --quality 90 \
  --output src/styles/images/pokesprite-pokemon-gen8.webp
```

2. **Update CSS to use WebP:**
```css
.pokesprite.pokemon {
    background: url('./images/pokesprite-pokemon-gen8.webp');
}
```

3. **Lazy load CSS (same as Option A)**

**Pros:**
- Reduces sprite sheet from 2.8 MB to ~800 KB (70% reduction)
- Minimal code changes
- Works with existing CSS sprite system

**Cons:**
- Still loads 800 KB when needed
- Requires browser WebP support (99%+ browsers)

**Estimated savings:** 2 MB on pages that load it, 2.8 MB on pages that don't

---

## Recommendation: **Option C (WebP + Lazy Load)**

### Why:
1. **Easiest to implement** - Just convert image and move CSS import
2. **Significant savings** - 70% reduction in sprite sheet size
3. **No breaking changes** - Works with existing components
4. **Quick win** - Can be done in 10 minutes

### Implementation Steps:

1. Convert sprite sheet to WebP
2. Update CSS reference
3. Remove global import from `app.pcss`
4. Add lazy imports to homepage and growth tree
5. Test on homepage and `/growth/2026`

### Future Optimization (Option B):
- Extract only the 6 growth tree Pokemon + top 50 most common for homepage
- Use individual images for growth tree (known set)
- Keep sprite sheet for homepage (random selection)

---

## Impact Analysis

**Current state:**
- Every page loads: 2.8 MB sprite sheet
- Pages affected: 100% of site

**After Option C:**
- Homepage: 800 KB (70% reduction)
- Growth tree: 800 KB (70% reduction)
- All other pages: 0 KB (100% reduction)
- **Average savings across site: ~2.5 MB**

---

## Files to Modify

### Option C Implementation:
1. `src/styles/images/pokesprite-pokemon-gen8.png` → Convert to WebP
2. `src/styles/pokesprite-pokemon-gen8.css` → Update image reference
3. `src/app.pcss` → Remove global import
4. `src/routes/+layout.svelte` → Add conditional import for homepage
5. `src/routes/growth/2026/+page.svelte` → Add import

**Total files changed: 5**
**Estimated time: 15 minutes**
**Estimated savings: 2.5 MB average, 2.8 MB on most pages**

