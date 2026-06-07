<script lang="ts">
  import { onMount, onDestroy } from 'svelte'
  import { browser } from '$app/environment'

  let instance: any = null

  onMount(async () => {
    if (!browser) return
    try {
      const mod = await import('@fiddle-digital/string-tune')
      const StringTune = mod.default || mod.StringTune
      const StringProgress = mod.StringProgress
      if (!StringTune) {
        console.error('[StringTune] Failed to import StringTune class')
        return
      }
      if (!StringProgress) {
        console.error('[StringTune] Failed to import StringProgress module')
        return
      }
      instance = StringTune.getInstance()
      instance.use(StringProgress)
      instance.start(60)
    } catch (e) {
      console.error('[StringTune] Init error:', e)
    }
  })

  onDestroy(() => {
    instance?.destroy?.()
    instance = null
  })
</script>
