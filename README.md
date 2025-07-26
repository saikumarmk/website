
## Personal Site
I keep my personal site contents here. You can visit it at [https://www.saikumarmk.com](https://www.saikumarmk.com)


## Powered by Urara
Check the repository out here: [https://github.com/importantimport/urara](https://github.com/importantimport/urara)


## Docs

`urara/*` contains all posts that are rendered via the standard route, and contain a `+page.md` which which are the contents of the page. You can include scripts e.g

```js
<script>
import PokemonSprite from '$lib/components/pkmn/pokemon.svelte'
import Sprite from '$lib/components/pkmn/sprite.svelte'
import Framed from '$lib/components/pkmn/frame.svelte'
</script>
```

To modify the home page, edit `src\routes\+page.svelte`.

To modify the actual post + container: `src\lib\components\post_container.svelte`