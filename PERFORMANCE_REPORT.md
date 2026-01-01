# Website Performance Optimization Report
**Date:** January 1, 2026  
**Site:** saikumarmk.com

## Executive Summary

The website has **significant bundle size issues** with some chunks exceeding 5 MB. The main culprits are:
1. Heavy JavaScript libraries (ELK.js, Three.js, force-graph)
2. Large images (Pokemon sprites, photos)
3. All blog post metadata loaded upfront (299 KB)

**Total estimated improvement:** 70-80% reduction in initial page load, 50-60% reduction in JS bundle sizes.

---

## Critical Issues

### 🔴 **Issue 1: Massive Chunks (>500 KB)**

From build output:
```
nodes/25.4b20026d.js        5,259.12 KB (5.26 MB!)  gzip: 510.65 KB
elk.bundled.9441c3b1.js    1,455.90 KB (1.46 MB)   gzip: 444.91 KB
nodes/32.85560788.js       1,100.41 KB (1.1 MB)    gzip: 328.00 KB  
three.module.c76b71c6.js     500.78 KB             gzip: 126.73 kB
posts.c241c0ce.js            299.51 KB             gzip:  89.47 kB
```

**Impact:** Users loading homepage download 5+ MB of JS they don't need.

**Root Cause:** 
- `node 25` (5.26 MB): Likely a page with huge embedded content or many dependencies
- ELK.js (1.46 MB): Graph layout library for Yggdrasil
- Three.js (500 KB): 3D backgrounds
- Posts (299 KB): All blog metadata loaded upfront

---

### 🟡 **Issue 2: Large Images Not Optimized**

```
pokesprite-pokemon-gen8.png    2.8 MB   (Pokemon sprite sheet)
mac_committee_2023.png         4.13 MB  (Committee photo)
pfp.png                        2.66 MB  (Profile picture)
```

**Impact:** Slow visual loading, especially on mobile.

---

### 🟡 **Issue 3: Monash Graph Server Bundle**

```
server/entries/pages/monash-graph/_page.svelte.js  7.98 MB
```

**Impact:** Slow SSR rendering, potential Netlify function timeouts.

---

## Optimization Strategies

### ✅ **Strategy 1: Code Splitting & Lazy Loading (HIGHEST PRIORITY)**

#### 1.1 Split Heavy Libraries

**Current:** All graph libraries load on every page  
**Fix:** Only load when needed

```typescript
// vite.config.ts - Add manual chunks
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Separate large libraries into their own chunks
          'elk': ['elkjs'],
          'three': ['three'],
          'force-graph-2d': ['force-graph'],
          'force-graph-3d': ['3d-force-graph'],
          'd3': ['d3'],
          'mermaid': ['mermaid'],
          'katex': ['katex']
        }
      }
    }
  }
})
```

**Estimated savings:** 2-3 MB on initial load

---

#### 1.2 Lazy Load Graph Pages

**Pages using heavy libraries:**
- `/monash-graph` - Uses force-graph, 3d-force-graph, d3
- `/growth/2026` - Uses ELK.js, force-graph
- Background canvases - Uses Three.js

**Current implementation already good:**
✅ Dynamic imports in `+layout.svelte` for background canvases
✅ Dynamic imports in graph components (`import('elkjs')`, `import('3d-force-graph')`)

**Additional optimization needed:**

```typescript
// src/routes/+layout.svelte
// GOOD: Already doing this for Three.js backgrounds
$: if (browser && currentMode === 'three' && !ThreeCanvas) {
  import('$lib/components/three/astro_canvas.svelte').then(module => {
    ThreeCanvas = module.default
  })
}

// TODO: Also lazy load d3, mermaid for pages that use them
```

---

### ✅ **Strategy 2: Reduce Posts Bundle (299 KB)**

**Current:** All blog metadata loads on every page via `+layout.svelte`:

```typescript
// src/routes/+layout.svelte
posts.set(res || [])  // Loads ALL posts upfront
tags.set(genTags(res || []))
```

**Fixes:**

#### 2.1 Paginate Posts Store
Only load recent/featured posts initially, load rest on-demand:

```typescript
// src/lib/stores/posts.ts
export const recentPosts = writable<Post[]>([])  // Last 10
export const allPosts = writable<Post[]>([])     // Load when needed

// src/routes/+layout.svelte
recentPosts.set((res || []).slice(0, 10))

// src/routes/archive/+page.svelte
// Only load all posts when viewing archive
onMount(async () => {
  const response = await fetch('/posts.json')
  const data = await response.json()
  allPosts.set(data)
})
```

**Estimated savings:** 200-250 KB on initial load

---

#### 2.2 Use Virtualized Lists for Archive
Install `svelte-virtual` for large post lists:

```bash
pnpm add svelte-virtual
```

```svelte
<!-- src/routes/archive/+page.svelte -->
<script>
  import VirtualList from 'svelte-virtual'
  
  let items = filteredPosts
</script>

<VirtualList {items} let:item>
  <PostCard post={item} />
</VirtualList>
```

---

### ✅ **Strategy 3: Image Optimization (CRITICAL)**

#### 3.1 Compress Large Images

**Tools to use:**
- `sharp` (already installed!)
- `@squoosh/cli` for WebP conversion

```bash
# Add image optimization script
pnpm add -D @squoosh/cli

# Add to package.json scripts:
"optimize:images": "squoosh-cli --webp auto --output-dir static/optimized static/assets/**/*.{png,jpg,jpeg}"
```

**Manual fixes needed:**

```bash
# 1. Pokemon sprite sheet (2.8 MB)
# Split into smaller sprites or use sprite atlas with lazy loading

# 2. Committee photo (4.13 MB → target: <500 KB)
npx sharp-cli \
  static/assets/guide-to-tech/mac_committee_2023.png \
  --resize 1200 \
  --quality 85 \
  --format webp \
  --output static/assets/guide-to-tech/mac_committee_2023.webp

# 3. Profile pic (2.66 MB → target: <200 KB)
npx sharp-cli \
  static/assets/pfp.png \
  --resize 400 \
  --quality 90 \
  --format webp \
  --output static/assets/pfp.webp
```

**Update image references:**

```svelte
<!-- Use picture element for WebP with fallback -->
<picture>
  <source srcset="/assets/pfp.webp" type="image/webp" />
  <img src="/assets/pfp.png" alt="Profile" loading="lazy" />
</picture>
```

**Estimated savings:** 8-9 MB total image size reduction

---

#### 3.2 Pokemon Sprite Optimization

Current: Single 2.8 MB sprite sheet  
Problem: Loads entire sheet even if only showing 1-2 Pokemon

**Options:**

**A) Use individual sprites (recommended):**
```typescript
// Generate individual sprites from sheet
// Load only the sprites used on each page
<img src="/sprites/{pokemon}.png" loading="lazy" />
```

**B) Use CSS sprite sheet with lazy loading:**
```css
/* Only load sprite sheet when needed */
.pokesprite {
  background-image: image-set(
    url('/sprites/sheet.webp') type('image/webp'),
    url('/sprites/sheet.png') type('image/png')
  );
}
```

---

### ✅ **Strategy 4: Build Configuration Optimization**

#### 4.1 Enable Compression

**Already done:** ✅ CSSNano for CSS minification

**Add:** Brotli pre-compression for static files

```typescript
// vite.config.ts
import compression from 'vite-plugin-compression'

export default defineConfig({
  plugins: [
    // ... existing plugins
    compression({
      algorithm: 'brotliCompress',
      ext: '.br',
      threshold: 10240  // Only compress files > 10KB
    })
  ]
})
```

```bash
pnpm add -D vite-plugin-compression
```

---

#### 4.2 Adjust Chunk Strategy

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        // Split vendor chunks
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // Split by package
            if (id.includes('elkjs')) return 'elk'
            if (id.includes('three')) return 'three'
            if (id.includes('force-graph')) return 'force-graph'
            if (id.includes('d3')) return 'd3'
            if (id.includes('mermaid')) return 'mermaid'
            if (id.includes('katex')) return 'katex'
            if (id.includes('svelte')) return 'svelte-vendor'
            // Other node_modules go to common vendor chunk
            return 'vendor'
          }
          // Split route chunks
          if (id.includes('src/routes/monash-graph')) return 'monash-graph'
          if (id.includes('src/routes/growth')) return 'growth'
        }
      }
    },
    // Increase chunk size warning to match reality
    chunkSizeWarningLimit: 600  // From default 500
  }
})
```

---

### ✅ **Strategy 5: PWA & Caching Strategy**

#### 5.1 Fix PWA Configuration

**Current issue:** Large files not precached

```typescript
// vite.config.ts - SvelteKitPWA config
SvelteKitPWA({
  registerType: 'autoUpdate',
  manifest: false,
  workbox: {
    // Increase precache limit
    maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,  // 3 MB
    
    // More specific glob patterns
    globPatterns: [
      '**/*.{js,css,html,svg,ico}',  // Remove large images from precache
      'posts.json'
    ],
    
    // Runtime caching for images
    runtimeCaching: [
      {
        urlPattern: /\.(?:png|jpg|jpeg|webp|avif)$/,
        handler: 'CacheFirst',
        options: {
          cacheName: 'images',
          expiration: {
            maxEntries: 100,
            maxAgeSeconds: 30 * 24 * 60 * 60  // 30 days
          }
        }
      },
      {
        urlPattern: /^https:\/\/fonts\.googleapis\.com/,
        handler: 'StaleWhileRevalidate',
        options: {
          cacheName: 'google-fonts'
        }
      }
    ]
  }
})
```

---

### ✅ **Strategy 6: Defer Non-Critical JS**

#### 6.1 Background Canvases
Already lazy loading ✅, but can improve:

```svelte
<!-- src/routes/+layout.svelte -->
<!-- Only load backgrounds after page is interactive -->
{#if currentMode === 'three' && ThreeCanvas}
  <svelte:component this={ThreeCanvas} />
{/if}

<!-- Add intersection observer to only render when visible -->
<script>
  let canvasVisible = false
  
  onMount(() => {
    const observer = new IntersectionObserver(([entry]) => {
      canvasVisible = entry.isIntersecting
    })
    observer.observe(document.body)
  })
</script>
```

---

### ✅ **Strategy 7: Font Loading Optimization**

Check if custom fonts are causing delays:

```html
<!-- src/app.html -->
<!-- Preload critical fonts -->
<link rel="preload" href="/fonts/pokemon-gb.woff2" as="font" type="font/woff2" crossorigin>

<!-- Use font-display: swap to prevent invisible text -->
<style>
  @font-face {
    font-family: 'Pokemon GB';
    src: url('/fonts/pokemon-gb.woff2') format('woff2');
    font-display: swap;  /* Shows fallback immediately */
  }
</style>
```

---

## Implementation Priority

### Phase 1: Quick Wins (1-2 hours)
1. ✅ Compress 3 large images (4.13 MB, 2.66 MB, 2.8 MB)
2. ✅ Add manual chunks to `vite.config.ts`
3. ✅ Fix PWA precache limits
4. ✅ Add Brotli compression plugin

**Expected impact:** 50% reduction in initial load time

---

### Phase 2: Code Splitting (2-3 hours)
1. ✅ Implement lazy posts loading
2. ✅ Split Pokemon sprite sheet
3. ✅ Add virtualized lists for archive
4. ✅ Optimize font loading

**Expected impact:** Additional 30% reduction in JS bundle size

---

### Phase 3: Advanced Optimization (3-4 hours)
1. ⚠️ Investigate node 25 (5.26 MB chunk) - identify and split
2. ⚠️ Investigate node 32 (1.1 MB chunk)
3. ⚠️ Consider moving graph visualizations to separate subdomains
4. ⚠️ Implement progressive image loading

---

## Monitoring & Measurement

### Tools to use:
- **Lighthouse:** Check Core Web Vitals
- **WebPageTest:** Measure real-world performance
- **Bundle Analyzer:** `pnpm add -D rollup-plugin-visualizer`

```typescript
// vite.config.ts
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  plugins: [
    visualizer({
      open: true,
      filename: 'bundle-analysis.html',
      gzipSize: true
    })
  ]
})
```

### Key metrics to track:
- **LCP (Largest Contentful Paint):** Target <2.5s
- **FID (First Input Delay):** Target <100ms
- **CLS (Cumulative Layout Shift):** Target <0.1
- **Total Bundle Size:** Target <500 KB initial
- **Time to Interactive:** Target <3s

---

## Quick Start Commands

```bash
# 1. Install optimization dependencies
pnpm add -D vite-plugin-compression @squoosh/cli rollup-plugin-visualizer svelte-virtual

# 2. Optimize images (manual, one-time)
pnpm run optimize:images

# 3. Analyze current bundle
pnpm run build
# Check build-output.txt for chunk sizes

# 4. Visualize bundle composition
# (Add visualizer plugin first)
pnpm run build
# Opens bundle-analysis.html in browser
```

---

## Next Steps

Would you like me to:
1. **Implement Phase 1 (Quick Wins)?** - Compress images, add chunk splitting
2. **Investigate the 5.26 MB chunk?** - Find and fix the huge node 25
3. **Set up bundle analyzer?** - Visualize what's taking up space
4. **All of the above?** - Full performance overhaul

Let me know which approach you prefer!


