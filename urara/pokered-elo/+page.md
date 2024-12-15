---
title: Approximating pimanrules Pokemon Red ELO World
author: Sai kumar Murali Krishnan
created: 2024-12-15 
categories: [assembly, pokemon, simulation]
tags: [pokemon, simulation]
---

<script>
import PokemonSprite from '$lib/components/pkmn/pokemon.svelte'
import Sprite from '$lib/components/pkmn/sprite.svelte'
import Framed from '$lib/components/pkmn/frame.svelte'
</script>

In case it's not already clear to the reader, I love Pokemon. Part of my obsession with Pokemon included simulating the trainer AI from the older games. pimanrules has a series of videos which simulate all $\sim 391^2$ possible trainer AI battles in [Pokemon Red](https://www.youtube.com/watch?v=8yUPhRJtNJM), [equalising all trainer levels to level 50](https://www.youtube.com/watch?v=247qD1qulSQ), and running the same tournament for [Pokemon Crystal](https://www.youtube.com/watch?v=Q6E6OaWb7LQ). The simulation is done directly via a Gameboy emulator, with the memory addresses swapped to make battle decisions. That means the hours required to simulate all the battles come to around 192 hours. My goal was to see if I could achieve this speed-up. Battling is the heart of Pokemon, and being able to analyse the trials set before the player is a very interesting way to to look at the way the games were design for players. In the end, I cut down the simulation time for all $391^2$ battles in Pokemon Red from 192 hours (computing hours) to **two and a half minutes**. The GitHub project can be found at [saikumarmk/pokered-trainer-tournament](https://github.com/saikumarmk/pokered-trainer-tournament), and the necessary bindings are available at [saikumarmk/PyKMN](https://github.com/saikumarmk/PyKMN/).

My journey began years ago, with the [pokered](https://github.com/pret/pokered) dissassembly project. The first idea that came to mind would be simulating the [core](https://github.com/pret/pokered/blob/master/engine/battle/core.asm) battle system by implementing a rudimentary ASM interpreter, however, I realised that the complexity of the project would shoot up because I'd need to go from ASM to some higher level language.

This idea stagnated till I had a rewatch of the video, and learned that the [Pokemon Showdown](https://github.com/smogon/pokemon-showdown) battle logic was available online. I immediately revisited the disassembly, since I knew if I could scrape the trainer and Pokemon data, all I'd have to do is recreate the trainer AI and then run all the battles.


## Pokemon Trainer AI tidbits

The generation one trainer AI is relatively straightforward, and can be found [here](http://wiki.pokemonspeedruns.com/index.php/Pok%C3%A9mon_Red/Blue/Yellow_Trainer_AI). However, some trainers have custom AI modifiers, like the gym leaders and the elite four. More information can be found on this [Gamefaqs guide](https://gamefaqs.gamespot.com/gameboy/367023-pokemon-red-version/faqs/64175/ai). In short, the three primary modifications for Pokemon RBY are:

### Modifier 1 - Don't use status moves

If the enemy Pokemon has a status condition, discourage using a non-attacking status move. There's a list of moves that fall under this.

### Modifier 2 - Buff on turn ~~one~~ two

If there's a move that buffs your Pokemon, on the second turn, prioritise those moves. Because of an off-by-one error, this modifier really should be applied on the first turn.

### Modifier 3 - Use supereffective moves

If there's a move that's considered 'super effective' against the **first** type of enemy Pokemon, prioritise that. Additionally, check to see if the Pokemon can use any 'alternative moves' (moves with a special damage calculation [^1]). If these moves are useable, then penalise using moves that are not very effective/ineffective. Note that there's no damage check here, so you can get into situations such as Lorelei's Dewgong spamming rest (which is patched in Yellow).

In generation one, trainer Pokemon movesets are determined by the last four moves they learned from their level [^2].

## The pkmn/engine

While exploring the [different implementations of the Pokemon Showdown modules](https://github.com/pkmn/ps), I found a project called [pkmn/engine](https://github.com/pkmn/engine). The project is a minimal Pokemon battle simulation engine built in Zig, a modern successor to C and is touted as a minimal battle engine. Being compiled in Zig means that the simulation is 1000x faster than the Showdown battle simulation, which is desirable for us. It also intends to be as close to both the original game and Pokemon showdown. This was genuinely amazing when I found it, as it meant that I could use the [Python bindings](https://github.com/AnnikaCodes/PyKMN) and simulate all the battles with relative ease. 


## PyKMN

PyKMN is the project that exposes the `engine` to Python. Unfortunately, the task was never going to be as straightforward as just compiling the bindings. My fork of PyKMN is available [here](https://github.com/saikumarmk/PyKMN) and you can use it to compile the necessary wheels to install `PyKMN` and use it with the [pokered-trainer-tournament](https://github.com/saikumarmk/pokered-trainer-tournament) project.

Off the bat, the C headers didn't compile because there was a static assertion that required removing. I wanted the bindings to be compatible with the latest version of the engine, so I made it target the master branch of `pkmn/engine`. I also needed to change `-Dtrace` to `-Dlog`, though I picked up on this relatively quickly as it complained that the argument was invalid.

After that, I had to make some modifications to `pykmn/engine/gen1.py`. For the time being, I've set the engine to always enable tracing as it previously wasn't picking up on the `HAS_TRACE` flag. The final modifications involved renaming some variables such as `disabled_duration` to `disable_duration` or `PKMN_OPTIONS_SIZE` to `PKMN_CHOICES_SIZE` which was accomplished by debugging a battle and inspecting the present variables. That made nearly all the tests pass, with the exception of a few oddities with the move disable, which causes a test case to fail as it wears off earlier than it should have. That was good enough for me anyway. This was a mildly irritating experience as I had to check the headers each time the FFI interface encountered an error, then potentially modify the headers and regenerate the wheel.

## Getting relevant trainer data

The relevant `asm` files from `pokered` include the:

- `base_stats` folder which contains their level one learnset
- `dex.asm` which contains the Pokedex numbers of each Pokemon
- `evos_moves.asm` contains the way each Pokemon evolves and its learnset
- `move_choices.asm` contains the AI modifiers each trainer class has
- `moves.asm` contains each move, any effects, its power, the type, accuracy and powerpoints
- `parties.asm` contains the trainer Pokemon data for each trainer. Note that trainers with custom moves (Gym + E4) are in a separate file

There are a couple of Pokemon names such as Mr Mime, and Nidoran M/F that are also spelt inconsistently, so we added some extra processing for them. We parse these and then store them in a pickled format.

## The Battle Engine

At a high level, the battle engine is straightforward - You specify two teams and then update the state of the battle by selecting a valid choice. These valid choices consist of swapping Pokemon, choosing a move, or passing (when you cause an enemy Pokemon to faint).

```py
def run_battle(trainer1: Trainer, trainer2: Trainer, log=True) -> ResultType:
    team1 = trainer1.pokemon
    team2 = trainer2.pokemon

    battle = Battle(
        p1_team=team1,
        p2_team=team2,
    )
    slots: Slots = Slots(([p.species for p in team1], [p.species for p in team2]))

    # Turn 0
    (result, trace) = battle.update(Choice.PASS(), Choice.PASS())
    choice = 1
    while result.type() == ResultType.NONE:
        choice += 1
        (result, trace) = advance_battle(battle, result, trainer1, trainer2)
        if choice > 1000:  # any stalling = tie
            return ResultType.TIE

    return result.type(), choice
```

The Pokemon data class allows you to specify the species, the moveset, and optionally, the level of the Pokemon.


## Putting it all together

We then pit each trainer against every other trainer. Originally, I had it so that each trainer would fight each other twice (one from the POV of P1 and one from the POV of P2) but left this out to see how close it could get to results from pimanrules' video.

Overall, the ELO ranking [^3] looked something like this:

```
Trainer: Green1 - Green1-C, LR Elo: 216.54730776458132
Trainer: Green1 - Green1-B, LR Elo: 224.5904410299538
Trainer: Green1 - Green1-A, LR Elo: 263.5018156696094
Trainer: BugCatcher - Route 3-C, LR Elo: 484.2755546418754
Trainer: BugCatcher - Viridian Forest-C, LR Elo: 484.68162792183057
Trainer: BugCatcher - Viridian Forest-A, LR Elo: 485.53990646640864
Trainer: SuperNerd - Mt. Moon 1F-A, LR Elo: 486.99372378593375
Trainer: Green1 - Route 22-C, LR Elo: 487.50635955968653
Trainer: BugCatcher - Mt. Moon 1F-B, LR Elo: 527.9433109209984
Trainer: BugCatcher - Viridian Forest-B, LR Elo: 542.0513046912079
Trainer: BugCatcher - Route 3-B, LR Elo: 553.9063718053528
Trainer: Green1 - Route 22-A, LR Elo: 557.79961894872
Trainer: Lass - Route 3-C, LR Elo: 559.1822159583655
Trainer: BugCatcher - Mt. Moon 1F-A, LR Elo: 565.9331459744931
Trainer: Hiker - Rock Tunnel B1F-B, LR Elo: 595.3713903703574
...
...
Trainer: Green2 - Route 22-A, LR Elo: 2473.3390468334183
Trainer: Green3 - Green3-A, LR Elo: 2497.382132748259
Trainer: Green3 - Green3-C, LR Elo: 2527.5603417405864
Trainer: Juggler - Victory Road 2F-A, LR Elo: 2528.905720644544
Trainer: Green3 - Green3-B, LR Elo: 2533.134741771907
Trainer: ProfOak - Unused-C, LR Elo: 2675.2609434721703
Trainer: ProfOak - Unused-A, LR Elo: 2704.059987738582
Trainer: ProfOak - Unused-B, LR Elo: 2713.6055194321307
```

So while not exactly the same in terms of results (due to some minor implementation details), we get pretty close.

## Conclusion - Features to implement

I have yet to implement trainer AI features such as using potions, switching out Pokemon, or Gym Leader AI which may bias the results. I would also like to make nice visualisations for this project, though it's not nearly a top priority as pimanrules' video does that already. It would be very cool to see how `pkmn/engine` develops, and whether we can recreate the same setup for Pokemon Crystal.


<PokemonSprite pokemonName="alakazam" size="medium"/>

[^1]: Dragon Rage, Fly, Psywave, and Super Fang are some examples of these special damage moves.
[^2]: It's a little more complicated than this - you can check the AI Pokemon move sets section of the [Gamefaqs guide](https://gamefaqs.gamespot.com/gameboy/367023-pokemon-red-version/faqs/64175/ai)
[^3]: The ELO algorithm is the same as the Pokemon Red Redux tournament where linear regression is used to estimate the rankings of trainers.

