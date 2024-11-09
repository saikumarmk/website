<script lang="ts">
  import PokemonSprite from '$lib/components/pkmn/pokemon.svelte'
  import pokemonClasses from '../../../resources/pokemonClasses.json'

  // Function to select a random Pokémon name
  function getRandomPokemonClass() {
    const randomIndex = Math.floor(Math.random() * pokemonClasses.length)
    return pokemonClasses[randomIndex]
  }

  let randomPokemonName = getRandomPokemonClass()
</script>

<PokemonSprite pokemonName={randomPokemonName} size="small" />
