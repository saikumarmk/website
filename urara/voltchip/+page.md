---
title: VoltChip
author: Sai kumar Murali Krishnan
created: 2021-01-24 
categories: [C]
tags: [webassembly,emulation,C,blog-post]
---

<script>
import PokemonSprite from '$lib/components/pkmn/pokemon.svelte'
import Sprite from '$lib/components/pkmn/sprite.svelte'
import Framed from '$lib/components/pkmn/frame.svelte'
</script>

# A simple Chip-8 emulator ported to WASM

VoltChip is a simple demonstration of the potential of deploying to WebAssembly, which allows for binary execution of code via webpages. While emulating Chip-8, an interpreted language with 35 opcodes is not unique, implementing the logic and finding that the code works relatively well with minor adjustments shows that the implementation could be upscaled to a Gameboy. The underlying emulation code was written in C, which may not be helpful for testing, but was simplistic for writing up code. The most fascinating aspect of this experiment was the lack of JavaScript written which would normally be essential to web-based projects normally. I intend to deploy the project to a github page in due course with more flexibility, which does require some JavaScript code written. You may find the project here [https://github.com/Theorvolt/web-voltchip](https://github.com/Theorvolt/web-voltchip).

<PokemonSprite pokemonName="magnemite", size="medium"/>