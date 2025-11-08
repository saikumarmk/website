<script lang="ts">
  import type { UnitGeneralInfo, UnitNode, GraphData } from '../types'
  import { calculateUnitCost, formatRequisites, getHandbookUrl } from '../utils/unitUtils'
  
  export let node: UnitNode | null = null
  export let graphData: GraphData | null = null
  
  $: unitData = node && graphData ? graphData.general_info[node.id] : null
  $: unlockedUnits = node?.unlocks || []
  $: formattedReqs = unitData?.requisites ? formatRequisites(unitData.requisites) : null
</script>

{#if node && unitData}
  <div class="card bg-base-200 p-4 space-y-4">
    <!-- Title -->
    <div>
      <a 
        href={getHandbookUrl(unitData.code)} 
        target="_blank"
        rel="noopener noreferrer"
        class="text-lg font-bold hover:text-primary transition-colors">
        {unitData.code} - {unitData.title}
        <span class="i-heroicons-outline-arrow-top-right-on-square w-4 h-4 inline-block ml-1"></span>
      </a>
    </div>
    
    <!-- Basic Info -->
    <div class="space-y-1 text-sm">
      <div>
        <span class="font-semibold">CSP Cost:</span>
        ${calculateUnitCost(unitData.credit_points, unitData.sca_band)}
      </div>
      {#if unitData.school !== unitData.academic_org}
        <div>{unitData.school}</div>
      {/if}
      <div>{unitData.academic_org}</div>
    </div>
    
    <!-- Requisites -->
    {#if formattedReqs}
      <div class="collapse collapse-arrow bg-base-300 border border-base-content/10">
        <input type="checkbox" class="peer" />
        <div class="collapse-title font-semibold">Requisites</div>
        <div class="collapse-content">
          <div class="space-y-2 text-sm pt-2">
          <div>
            <span class="font-semibold">Permission:</span> {formattedReqs.permission}
          </div>
          
          {#if formattedReqs.prohibitions.length > 0}
            <div>
              <span class="font-semibold">Prohibitions:</span>
              <ul class="list-disc list-inside ml-2">
                {#each formattedReqs.prohibitions as prohibition}
                  <li>{prohibition}</li>
                {/each}
              </ul>
            </div>
          {/if}
          
          {#if formattedReqs.corequisites.length > 0}
            <div>
              <span class="font-semibold">Corequisites:</span>
              {#each formattedReqs.corequisites as coreq}
                <div class="ml-2">
                  {coreq.NumReq} of:
                  <ul class="list-disc list-inside ml-4">
                    {#each coreq.units as unit}
                      <li>{unit}</li>
                    {/each}
                  </ul>
                </div>
              {/each}
            </div>
          {/if}
          
          {#if formattedReqs.prerequisites.length > 0}
            <div>
              <span class="font-semibold">Prerequisites:</span>
              {#each formattedReqs.prerequisites as prereq}
                <div class="ml-2">
                  {prereq.NumReq} of:
                  <ul class="list-disc list-inside ml-4">
                    {#each prereq.units as unit}
                      <li>{unit}</li>
                    {/each}
                  </ul>
                </div>
              {/each}
            </div>
          {/if}
          
            <div>
              <span class="font-semibold">CP Required:</span> {formattedReqs.cpRequired}
            </div>
          </div>
        </div>
      </div>
    {:else}
      <div class="text-sm opacity-70">No requisites</div>
    {/if}
    
    <!-- Unlocks -->
    <div class="collapse collapse-arrow bg-base-300 border border-base-content/10">
      <input type="checkbox" class="peer" />
      <div class="collapse-title font-semibold">
        Unlocks ({unlockedUnits.length})
      </div>
      <div class="collapse-content">
        <div class="pt-2">
          {#if unlockedUnits.length > 0}
            <ul class="list-disc list-inside text-sm space-y-1">
              {#each unlockedUnits as unit}
                <li>{unit}</li>
              {/each}
            </ul>
          {:else}
            <p class="text-sm opacity-70">Does not unlock any unit</p>
          {/if}
        </div>
      </div>
    </div>
  </div>
{:else}
  <div class="card bg-base-200 p-8 text-center">
    <span class="i-heroicons-outline-information-circle w-12 h-12 mx-auto mb-4 opacity-30"></span>
    <p class="text-sm opacity-70">Click on a node to view unit information</p>
  </div>
{/if}

