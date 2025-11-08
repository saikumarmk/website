<script lang="ts">
  import FilterTags from './FilterTags.svelte'
  
  export let searchQuery = ''
  export let schoolTags: string[] = []
  export let unitCodes: string[] = []
  export let showUnlocks = true
  export let showRequirements = true
  export let onSearch: (query: string) => void = () => {}
  export let onClearUnits: () => void = () => {}
  export let isCollapsed = false
  
  function handleSearchKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      event.preventDefault()
      onSearch(searchQuery)
    }
  }
  
  function addSchoolTag(tag: string) {
    schoolTags = [...schoolTags, tag]
  }
  
  function removeSchoolTag(tag: string) {
    schoolTags = schoolTags.filter(t => t !== tag)
  }
  
  function addUnitCode(code: string) {
    unitCodes = [...unitCodes, code]
  }
  
  function removeUnitCode(code: string) {
    unitCodes = unitCodes.filter(c => c !== code)
  }
</script>

<div class="h-full overflow-y-auto space-y-6 p-4">
  <!-- Search -->
  <div>
    <h3 class="text-lg font-bold mb-3">Search for a Unit</h3>
    <div class="join w-full">
      <input
        type="text"
        bind:value={searchQuery}
        on:keypress={handleSearchKeyPress}
        placeholder="Enter unit code (e.g., FIT1008)"
        class="input input-bordered join-item flex-1"
      />
      <button
        on:click={() => onSearch(searchQuery)}
        class="btn btn-primary join-item">
        <span class="i-heroicons-outline-magnifying-glass w-5 h-5"></span>
      </button>
    </div>
  </div>
  
  <!-- Filter by School -->
  <div>
    <h3 class="text-lg font-bold mb-3">Filter by School</h3>
    <FilterTags
      bind:tags={schoolTags}
      placeholder="Enter school code (e.g., FIT, ENG)"
      onAdd={addSchoolTag}
      onRemove={removeSchoolTag}
    />
    <p class="text-xs opacity-60 mt-2">
      Tip: Enter 3 or 4 letter school codes
    </p>
  </div>
  
  <!-- Build Mode -->
  <div>
    <h3 class="text-lg font-bold mb-3">Build Mode</h3>
    <FilterTags
      bind:tags={unitCodes}
      placeholder="Enter unit codes (comma-separated)"
      onAdd={addUnitCode}
      onRemove={removeUnitCode}
    />
    {#if unitCodes.length > 0}
      <button
        on:click={onClearUnits}
        class="btn btn-sm btn-ghost mt-2 w-full">
        <span class="i-heroicons-outline-trash w-4 h-4"></span>
        Clear All Units
      </button>
    {/if}
    <p class="text-xs opacity-60 mt-2">
      Build a custom view with specific units
    </p>
  </div>
  
  <!-- Display Options -->
  <div>
    <h3 class="text-lg font-bold mb-3">Display Options</h3>
    <div class="space-y-2">
      <label class="label cursor-pointer justify-start gap-3">
        <input
          type="checkbox"
          bind:checked={showRequirements}
          class="checkbox checkbox-primary"
        />
        <span class="label-text">Show Requirements</span>
      </label>
      
      <label class="label cursor-pointer justify-start gap-3">
        <input
          type="checkbox"
          bind:checked={showUnlocks}
          class="checkbox checkbox-primary"
        />
        <span class="label-text">Show Unlocks</span>
      </label>
    </div>
  </div>
  
  <!-- Stats -->
  {#if schoolTags.length > 0 || unitCodes.length > 0}
    <div class="alert alert-info">
      <span class="i-heroicons-outline-funnel w-5 h-5"></span>
      <div class="text-sm">
        <div class="font-bold">Active Filters</div>
        {#if schoolTags.length > 0}
          <div>Schools: {schoolTags.length}</div>
        {/if}
        {#if unitCodes.length > 0}
          <div>Units: {unitCodes.length}</div>
        {/if}
      </div>
    </div>
  {/if}
</div>

