---
title: Prompting a Unit Score Dashboard with Claude
author: Sai kumar Murali Krishnan
created: 2024-12-15 
categories: [Data visualisation]
tags: [blog-post]
---

<script>
import PokemonSprite from '$lib/components/pkmn/pokemon.svelte'
import Sprite from '$lib/components/pkmn/sprite.svelte'
import Framed from '$lib/components/pkmn/frame.svelte'
</script>


A couple of weeks ago, I wanted to test out Claude Sonnet's capabilities for generating web applications, as my attention had been brought to [bolt.new](https://bolt.new/), a prompt system that allows you to prompt full-stack web applications. Word on the street, according to people I work with was that Claude's Sonnet was very powerful for generating entire applications, and I had yet to trial Sonnet on my personal account. I tested Sonnet's capabilities by asking the model to replicate the heat map of [SETool](https://www.saikumarmk.com/the-story-of-setool/), a now-defunct [^1] piece of software that deploys a Dash application to Heroku for visualising unit outcomes.


Introducing the [Unit Scores Dashboard](https://saikumarmk.github.io/unit-scores-dashboard/) for anyone at Monash who's ever tried to make sense of the SETU outcomes for units, and used SETool in the past. I provided Claude an [image of the heat-map](https://www.saikumarmk.com/the-story-of-setool/) and the following prompt below:


```
I once created a webapp in plotly+dash that visualised unit scores (13 items, from 1 to 5) in a heat-map like grid by mapping from red to green. The code is in python and relies on the dash table, so I want you to recreate it in javascript (you can use libraries such as d3/vega/whatever you think is the best for the task). It had the following features:

    Filters (semester, level, choosing the mean/median for overall score) toggling columns - each item in the database (I will supply a sample item)
    Search filters in each column, for numerical items you can do comparison filters and string columns you can search matches
    checkboxes next to each entry so you can add it to a comparison table that's similar to the first table.

This is a sample entry:
{'Responses': 30, 'Invited': 79, 'Season': '2019_S2', 'Response Rate': 37.9746835443038, 'unit_name': ' Accounting information systems and financial modelling ', 'code': ' ACB2851_PENINSULA_ON-CAMPUS_ON_S2-01 ', 'unit_code': 'ACB2851', 'Level': 2, 'I1': [4.23, 4.35], 'I2': [4.37, 4.62], 'I3': [4.27, 4.5], 'I4': [4.23, 4.56], 'I5': [4.17, 4.39], 'I6': [4.23, 4.41], 'I7': [4.23, 4.5], 'I8': [4.27, 4.56], 'I9': [4.13, 4.27], 'I10': [4.1, 4.33], 'I11': [4.03, 4.19], 'I12': [4.3, 4.5], 'I13': [4.2, 4.5], 'agg_score': [4.212307692307693, 4.436923076923076]}

Assume this is loaded from some JSON/serialised format. now then...

I'd... i'd like you to unleash the ultimate implementation of this code: DONT HOLD BACK, CLAUDE-KUN! TAKE IT TO THE LOGICAL ENDGAME!
```

With the crazy prompt adapted from [this Twitter post](https://x.com/nptacek/status/1858302846011048178). To which, it generated a [React component](https://github.com/saikumarmk/unit-scores-dashboard/blob/master/src/components/dashboard/UnitScoresDashboard.tsx) for me, which I promptly threw into basic `next` app. And it worked! Sort of...

After the initial prompt, I asked it to refine the web application and allow users to filter columns by specific properties. I managed to get it to parity with the original SETool within a few prompts and a few hours of hacking. It is a vast upgrade over how long it took me to code up SETool. Additionally, since it's in React, I can host the web page on GH-pages by exporting the web app to a static format [^2] which makes deployment much easier (usually).

![SETool v3 in React](/assets/setool/setool_v3.png)

Anyway, if you're a Monash student, go check it out and let me know what you think! As of now, the comparison table is a bit bugged, but otherwise it's pretty functional and looks good! I will try to update the dashboard here and there, but I also wouldn't mind any prospective students taking it off my hands (and you get a free project on your resume).


<PokemonSprite pokemonName="porygon-z", size="medium"/>


[^1]: Heroku stopped their free plan, and I always intended to get rid of Python and make it a pure web-app.
[^2]: You can use the `npm` package [gh-pages](https://www.npmjs.com/package/gh-pages) with a bit of configuration to export all your styles.