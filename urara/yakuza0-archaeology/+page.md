---
title: "Mining Yakuza 0 for Money Island Data"
author: Sai Kumar Murali Krishnan
created: 2026-06-15
tags: [reverse-engineering, yakuza, blog-post]
summary: "Decoding Yakuza 0's data tables"
toc: true
---

<script>
  import ArchaeologyGraph from '$lib/components/yakuza/ArchaeologyGraph.svelte'
</script>


During Yakuza 0, Kiryu decides he wants to take over the real estate business in Kamurocho. Finishing the minigame means acquiring all the property, or shaking down Mr Shakedown. However, not all of the property you buy generate the same amount of cash, and you can often end up buying properties that cost more to run than they yield profit. In typical Sai-fashion, I wanted to know how Real Estate Royale actually pays out. The in-game UI tells you rank and share price, but not the underlying numbers, so I looked at the PC release files.


## Approach

Roughly in order:

1. **Index what's on disk**: file paths, sizes, which archive they came from. Paths live in `games/yakuza0/profile.yaml`.
2. **Unpack**: [Gibbed](https://github.com/gibbed/Gibbed.Yakuza0)'s tools for `stay.par` (minigames), `boot.par` (items/encounters), `battle.par` (combat dialogue and controller data).
3. **Decode**: most tables have a recognizable header (`20 07 03 19` descriptors, `*SB`/`*TB` fixed rows, `string_tbl` string pools, and a handful of battle-specific magics). Output goes to `data/tables/` as CSV + JSON.
4. **Promote into a graph**: interesting rows become entities with facts and links. Money Island was first; encounters and nawabari followed.

Locale files are parallel, not merged: `_bin_c` English, `_bin_j` Japanese, `_bin_k` Korean. Gameplay IDs stay stable; names come from whichever locale column you're reading. In addition, Real Estate Royale is called Money Island.
## Graph explorer

Blue nodes are Money Island. Pink is encounters, amber nawabari, green items. Gray blobs are decoded table families that haven't been promoted yet. Click a node to see the raw fields.

<div class="not-prose my-6 rounded-lg border border-base-300 overflow-hidden" style="height: 520px;">
  <ArchaeologyGraph />
</div>


## What's been cdecoded

| What | Count |
| --- | ---: |
| staypar tables decoded | 236 |
| bootpar tables decoded | 432 |
| battlepar tables decoded | 82 |
| Total | 750 |
| Graph entities | 743 |
| Graph edges | 1149 |

Still sitting in JSON but not in the graph: the full item list, virtue shop, 374 activity entries, cabaret data. Thousands of other `.par` files in the install haven't been touched.

## Real Estate Royale

The payout table is `money_island_shop.bin_c`: 50 rows, five areas with ten properties each. Each row has `profit_d` through `profit_s`. Comparing columns across shops gives clean rank multipliers:

| Rank | Multiplier |
| --- | ---: |
| D | 1.0× |
| C | 1.5× |
| B | 2.0× |
| A | 3.0× |
| S | 4.0× |

Disco City Boy in Entertainment is the highest base earner at ¥38.4M per round at D-rank (¥153.6M at S). Kamuro Soba in Gambling is the lowest at ¥320K.

All 50 properties from `money_island_shop.bin_c`, sorted by D-rank profit within each area. These are the numbers before rank upgrades: multiply by 1.5 / 2 / 3 / 4 for C / B / A / S.

### Entertainment (芸能)

| Property | D-rank profit |
| --- | ---: |
| Disco City Boy | ¥38.4M |
| Hotel Blue Light | ¥31.2M |
| Telekura Rinrin-bo | ¥28.8M |
| Hotel Diamond Palace | ¥18.7M |
| Hotel Mermaid | ¥17.3M |
| Hotel White | ¥17.3M |
| Kamuro Hot Springs | ¥6.1M |
| Kogetsu Theater | ¥5M |
| Pocket Circuit Stadium | ¥4.2M |
| Tokiwa Restaurant | ¥2.9M |

### Gambling (賭博)

| Property | D-rank profit |
| --- | ---: |
| Pachinko BIG STAR | ¥20.4M |
| Pachinko New Cosmos | ¥14M |
| Gibson Hall | ¥11.5M |
| Kamuro La Scala Cinema | ¥10.3M |
| TOKYO POPURI | ¥10.3M |
| Sanwa Leisure Hall | ¥10.1M |
| New Montmartre | ¥9.8M |
| NY Hot Dog | ¥2.6M |
| Mach Bowl | ¥1.8M |
| Kamuro Soba | ¥320K |

### Recreation (娯楽)

| Property | D-rank profit |
| --- | ---: |
| Pachinko New Eden | ¥3.5M |
| Pachinko Marufuku | ¥3.5M |
| Health Wild Apple | ¥1.8M |
| Sukiyaki Muranaka | ¥1.6M |
| Harashima Design | ¥1.5M |
| Sushi Gin | ¥1.4M |
| Kamuro Health Plaza | ¥1.4M |
| Poppo Tenkaichi St. | ¥510K |
| Nyoki-Nyoki Academy | ¥405K |
| Yurizake | ¥390K |

### Digital (電脳)

| Property | D-rank profit |
| --- | ---: |
| Pachinko 777 | ¥4.9M |
| Pachinko Aloha | ¥4.7M |
| Lovely Bunny | ¥3.5M |
| Shokichi Camera | ¥2.3M |
| Asai Building No. 3 | ¥1.9M |
| AMUSEMENT GAME YOU | ¥740K |
| Tenpo Sushi | ¥640K |
| HL SEGA Nakamichi St. | ¥640K |
| Beijing Chinese Eatery | ¥520K |
| DoReMiFa Zone | ¥280K |

### Adult (風俗)

| Property | D-rank profit |
| --- | ---: |
| Cabaret Valentine | ¥10M |
| No-Panties BBQ | ¥7.8M |
| Arabia Records | ¥5.9M |
| Ogando Arts | ¥4.3M |
| Kamuro World Theater | ¥4.1M |
| Sexual Harassment Cop | ¥3.8M |
| Quartier Latin | ¥3.4M |
| Moscow Western Cuisine | ¥1.3M |
| Tontenshan | ¥1.2M |
| Hayashi Construction | ¥320K |


## Other stuff worth noting

**Encounters**: spawn groups in `encounter_enemy_set`, loot weights in `encounter_drop_item`. Street drop pool 2 rolls Chestnut Shochu (栗焼酎) at 28%.

**Nawabari**: tenant names live in a `string_tbl` indirection table, not inline in the row. 320 shop types, keyed by row index.

**Battlepar**: 41 binaries decoded: 127 fighter controller entries (Kiryu through the zako archetypes), 568 wanderer speak symbols, 54 chase barks, 100 Coliseum endless arena fighters.

## Conclusion 

I found this to be a rather easy exercise in datamining, as the tooling mostly existed for it already. But it does bring a thought, where you could use Cheat Engine/PINCE to look at the memory in-game, then look around the game binaries to make datamining an easier effort, especially for games where precise information is less available.


![I'll make an offer... in cash!](/assets/offer.png)
