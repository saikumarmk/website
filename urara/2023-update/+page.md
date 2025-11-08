---
title: Year in review - 2022
author: Sai kumar Murali Krishnan
created: 2023-01-29
categories: [Update]
tags: []
---

<script>
import PokemonSprite from '$lib/components/pkmn/pokemon.svelte'
import Sprite from '$lib/components/pkmn/sprite.svelte'
import Framed from '$lib/components/pkmn/frame.svelte'
</script>


# The year in review

2022 has been an interesting year, and while I started with a few failures, I ended the year on a high note, with several notable goals that I've achieved.

## Monash Handbook

Over the last few months, I've worked with some other members of my club to work towards a more informed source of unit information for Monash units, espescially requisite information. One needs only look at [FIT3047](https://handbook.monash.edu/current/units/FIT3047) to understand the massive issue students face when making an informed decision regarding what they can take. The manually inputted enrollment rules can also be downright impossible to parse, so we have to look elsewhere.

In the journey to scrape requisites, I discovered MonPlan, a now discontinued course planner, can verify course plans, which means it can indirectly return course requisites. After some fiddling and a bit of grouping, I managed to get a rough collection of requisites. Then, I used the Monash Handbook API to scrape any other information and collated it. All this code may be found in [this repository](https://github.com/monashcoding/TheBetterHandbookAPI).


After compiling these requisites, I whipped up a network visualisation of all 5360 or so Monash units. You may find the graph [here](/monash-graph).


## Canva

Sometime in September, I applied to Canva's machine learning engineer internship role, after accepting an offer from CBA. To my surprise, I ended up getting an offer from Canva, where I am now interning over the summer, working with Stable Diffusion. I've discovered that Canva is a major powerhouse when it comes to machine learning, and that the web design front you see does not capture how much cutting edge work is being done here. It's amazing.


## MAC

And finally, I'm now president of the Monash Association of Coding. Which means more responsibilities, but as it's also going to be my last year in university, there's a lot I want to get done before I'm gone, especially concerning better student engagement for students in the faculty of IT, and an open source program people can get behind.

<PokemonSprite pokemonName="lucario", size="medium"/>