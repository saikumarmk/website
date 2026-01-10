<script lang="ts">
  export let name: string;
  export let colors: string[] = ['#666666', '#666666', '#666666', '#666666'];
  export let small: boolean = false;

  // Color utilities
  function lighten(color: string, amount: number = 0.5): string {
    const num = parseInt(color.replace('#', ''), 16);
    const r = Math.min(255, Math.floor((num >> 16) + (255 - (num >> 16)) * amount));
    const g = Math.min(255, Math.floor(((num >> 8) & 0x00FF) + (255 - ((num >> 8) & 0x00FF)) * amount));
    const b = Math.min(255, Math.floor((num & 0x0000FF) + (255 - (num & 0x0000FF)) * amount));
    return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`;
  }

  function darken(color: string, amount: number = 0.25): string {
    const num = parseInt(color.replace('#', ''), 16);
    const r = Math.floor((num >> 16) * (1 - amount));
    const g = Math.floor(((num >> 8) & 0x00FF) * (1 - amount));
    const b = Math.floor((num & 0x0000FF) * (1 - amount));
    return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`;
  }

  // Scale text based on length
  $: scaleFactor = name.length <= 5 ? 1 
    : name.length <= 6 ? 0.9 
    : name.length <= 8 ? 0.7 
    : 0.6;

  $: size = small ? { width: '120px', height: '40px', fontSize: '9px' } 
    : { width: '184px', height: '56px', fontSize: '14px' };
</script>

<div class="tech-badge" style="width: {size.width}; height: {size.height};">
  <!-- 4x4 grid for 3D effect -->
  <div class="badge-cell" style="background: #ffffff;"></div>
  <div class="badge-cell" style="background: {lighten(colors[0])};"></div>
  <div class="badge-cell" style="background: {lighten(colors[1])};"></div>
  <div class="badge-cell" style="background: {colors[1]};"></div>

  <div class="badge-cell" style="background: {lighten(colors[0])};"></div>
  <div class="badge-cell" style="background: {colors[0]};"></div>
  <div class="badge-cell" style="background: {colors[1]};"></div>
  <div class="badge-cell" style="background: {darken(colors[1])};"></div>

  <div class="badge-cell" style="background: {lighten(colors[2])};"></div>
  <div class="badge-cell" style="background: {colors[2]};"></div>
  <div class="badge-cell" style="background: {colors[3]};"></div>
  <div class="badge-cell" style="background: {darken(colors[3])};"></div>

  <div class="badge-cell" style="background: {colors[2]};"></div>
  <div class="badge-cell" style="background: {darken(colors[2])};"></div>
  <div class="badge-cell" style="background: {darken(colors[3])};"></div>
  <div class="badge-cell" style="background: #333333;"></div>

  <!-- Corner dots -->
  <span class="dot top-left"></span>
  <span class="dot top-right"></span>
  <span class="dot bottom-left"></span>
  <span class="dot bottom-right"></span>

  <!-- Text overlay -->
  <div class="badge-text" style="font-size: {size.fontSize}; transform: scale({scaleFactor}, 1);">
    {name.toUpperCase()}
  </div>
</div>

<style>
  .tech-badge {
    position: relative;
    display: grid;
    grid-template-columns: 4px repeat(2, 1fr) 4px;
    grid-template-rows: 4px repeat(2, 1fr) 4px;
    margin: 6px;
    box-shadow: 4px 0 #333, -4px 0 #333, 0 4px #333, 0 -4px #333;
    cursor: pointer;
  }

  .badge-cell {
    width: 100%;
    height: 100%;
  }

  .dot {
    position: absolute;
    width: 4px;
    height: 4px;
    background-color: rgba(0, 0, 0, 0.2);
    display: inline-block;
  }

  .dot.top-left { top: 8px; left: 8px; }
  .dot.top-right { top: 8px; right: 8px; }
  .dot.bottom-left { bottom: 8px; left: 8px; }
  .dot.bottom-right { bottom: 8px; right: 8px; }

  .badge-text {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    color: white;
    text-shadow: 4px 4px 0 #666;
    font-family: 'Press Start 2P', monospace;
    font-weight: bold;
    white-space: nowrap;
    pointer-events: none;
    transform-origin: center;
  }
</style>


