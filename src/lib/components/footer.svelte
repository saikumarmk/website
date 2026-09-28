<script lang="ts">
  import Embroidery from '$lib/components/thread/Embroidery.svelte'
</script>

<footer class="site">
  <Embroidery
    class="sprig"
    width={110}
    height={52}
    compose={(b, W, H) => {
      b.stem(b.curve(W, H * 0.98, W * 0.6, H * 0.9, W * 0.2, H * 0.98))
      b.leaf(W * 0.62, H * 0.92, W * 0.42, H * 0.36, 9, 0.25)
      b.leaf(W * 0.8, H * 0.94, W * 0.9, H * 0.3, 8, -0.2)
      b.knot(W * 0.26, H * 0.62, 2.2, 'g1', b.tick(60))
    }} />
  <a href="https://github.com/saikumarmk">GitHub</a>
  <a href="/cv">CV</a>
  <a href="/atom.xml">RSS</a>
  <a href="/playbook">Playbook</a>
  <a href="/growth/2026">Yggdrasil</a>
  <span class="set-in">Set in Newsreader &amp; IBM Plex Mono</span>
</footer>
