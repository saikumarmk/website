---
title: SETools
author: Sai kumar Murali Krishnan
created: 2021-01-09
categories: [Python,Webapp]
tags: [data-science,visualization,python,summary]
---

<script>
import PokemonSprite from '$lib/components/pkmn/pokemon.svelte'
import Sprite from '$lib/components/pkmn/sprite.svelte'
import Framed from '$lib/components/pkmn/frame.svelte'
</script>

# A way to summarize dull and hard to visualize unit data

SETools is a data visualization web application that takes in unit data and student satisfaction to create a colorful visualization of how well received a unit is. The libraries involved include Dash, Plotly and Pandas. The use of Dash circumvented the need to use a language such as javascript for a frontend and provided powerful interactive visualizations. The aim of this project was to summarize unit information so that anyone could decide which unit to undertake upon having a glance at the colors of the data. You may find a heroku app instance at [http://setool.herokuapp.com](http://setool.herokuapp.com) and the source code here [https://github.com/Theorvolt/SETool](https://github.com/Theorvolt/SETool).


<PokemonSprite pokemonName="porygon", size="medium"/>