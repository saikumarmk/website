
---
title: AI in Software Engineering and My Thoughts
author: Sai Kumar Murali Krishnan
created: 2026-03-09
categories: [ai-coding]
tags: [ai-coding]
summary: "Some thoughts on AI tooling from someone who's been using it a lot."
---

I have not been posting regularly, but have been meaning to write on something. The world has been taken by storm by the Claude line of products — with hysteria soon following on the stock markets and in the news. People have taken to extreme sides: some claiming AI is useless and can't do meaningful work, others having essentially embraced ~~cyber~~ AI-psychosis, convinced a mass unemployment event is imminent. There are also persistent beliefs about "model collapse" from an AI ouroboros of models training on their own outputs.

So I want to write about what I actually think. I've been following this space since recurrent neural networks were state of the art, I train language and vision models at work, and I recently became a Senior Applied Scientist. I think AI is part of the reason for that — it's let me translate ideas into working products much faster. My take is roughly that AI accelerates people who already know how to build and problem solve. It's not a replacement for that.

## The noise

The "AI is useless" camp mostly mistakes a bad experience — usually caused by not knowing how to direct the model — for a fundamental ceiling. The "mass unemployment" camp sees fluent code generation and assumes judgment and problem framing come along for free.

The model collapse thing is worth addressing briefly too. Frontier labs aren't passively ingesting whatever is on the internet — they're running curated, task-specific synthetic data pipelines and actively deciding what goes into training. "AI-generated slop proliferating on the web" and "what goes into the next model" are separate things. The models haven't collapsed. They've gotten substantially better.

## What this actually requires from you

There's a pattern in how engineering careers progress. Early on it's solving well-defined problems. Later, more complex and ambiguous ones. At a senior level the job shifts again — more about identifying which problems are worth solving and packaging them to be executed.

AI compresses the execution layer. The people who benefit most are exactly those who've already developed the instinct for what's worth building, because that's the part AI doesn't help with. It can't replicate years of frustration telling you that a problem needs solving, or the domain knowledge to evaluate whether an output is actually correct, or the taste to reject something technically functional but wrong.

An agent is an orchestrator — it shouldn't be treated as a repository of domain knowledge, especially in specialised areas where there's not much relevant signal in the training data. If you can't evaluate the output, you can't catch mistakes. The force multiplier only works if there's something to multiply. A strong programmer amplified by agentic AI usage produces something different. Someone who doesn't know what they're doing produces slop, faster.

## The Monash Handbook Plus

While at Monash, I spent years frustrated by the university handbook. Units had complex prerequisite chains, poorly structured requirements, and no good way to see what completing something would unlock or how to plan a degree efficiently. I wrote [a whole article](/universe-of-units) about this previously, and over the years made various failed attempts and prototypes at it.

The [Monash Handbook Plus](https://github.com/saikumarmk/monash-handbook) ended up being a full React app: unit search and filtering, an interactive force-directed prerequisite graph, pathway finding, an auto-scheduler, cost calculator, shareable plans, 85 tests. The high-level concepts — how to model the prerequisite structure, which views would be useful, how to handle the edge cases in Monash's data — came from years of thinking about the problem. What AI handled was the execution: the scraping and parsing of the handbook (genuinely nontrivial, inconsistent HTML formats throughout), and the frontend implementation. I had built an earlier graph view that GPT one-shotted at the time, which was useful but limited. The newer generation let me do something far more ambitious, much faster.

## The Pokémon Trainer Tournament

This one's a better example, because it's not just AI making things faster — it made a project possible that wasn't before.

The [Pokémon Trainer Tournament](https://github.com/saikumarmk/pokemon-trainer-tournament) runs every in-game trainer from Red, Crystal, and Emerald against every other trainer in a full round-robin — around 450,000 battles across all three generations — with each generation's trainer AI faithfully reproduced. I've written about the [Gen 1 version](/pokered-elo-1) before. The goal was always to extend to Gen 2 and Gen 3.

Gen 1's trainer AI is relatively simple: three modifiers adjusting move priority based on status, setup timing, and type matchups. Gen 2's Crystal AI is a full scoring system with 10 layers (AI_BASIC through AI_RISKY), voluntary switching, and item usage. Gen 3's Emerald AI is more complex and was the wall that stopped me the first time.

The Emerald AI is a custom bytecode-like DSL in `battle_ai_scripts.s` — over 3,200 lines of assembly with around 30 opcodes controlling 9 script flags. My original attempt was to write an ASM interpreter that could run the battle logic directly. The complexity grew too fast and the project stalled. 

With AI the approach changed. Rather than interpreting the ASM, I transpiled it — each routine translated into idiomatic TypeScript across 6 files, preserving original quirks for accuracy. CHECK_VIABILITY alone has 120+ effect-specific handlers, ability interactions (Wonder Guard, Levitate), weather scoring, HP-tier thresholds. Not boilerplate — a genuinely difficult translation task requiring understanding of both the source language and the target.

I built the entire Gen 1, Gen 2, and Gen 3 systems in a single evening. Three agents ran in parallel, each handling a different part of the combat system, and I combined their outputs.

![Three agents working in parallel on the tournament](/assets/tournament_agents.png)

A project that had sat as an impossible idea for years, done in one night. That's more or less the thesis in practice.

## At Canva

Canva gives us access to AI tooling in essentially unlimited amounts, which means real room to experiment with how agents work inside a large complex monorepo. It works well, as long as the person using it knows what they're working with. Some less obvious useful cases: catching subtle bugs in unfamiliar code, helping researchers who write correct ideas in broken code actually get to something that runs, or just pointing Opus at a hard debugging problem and seeing what it does.

## Donald Knuth and Terence Tao

Knuth had previously dismissed GPT-4 — correctly, it wasn't capable enough for what he wanted. He then wrote about using Claude to generate an algorithm for an open conjecture, which he went on to solve. Not credulous enthusiasm — a practitioner noticing a model had crossed a meaningful capability threshold.

Tao has been involved in autoformalization and has used LLMs as a kind of search engine for mathematical problem-solving — not replacing the reasoning, but using it to explore a larger space of approaches faster.

Both of them are using AI as a tool that becomes useful in the hands of someone who already knows their field well. Neither is using it as a substitute for knowing it.

## Hiring

The discourse around hiring is its own separate hysteria. CEOs attributing layoffs to AI is at least partly a correction from a period of overhiring, not a clean demonstration of AI replacing engineers.

That said, the economics are shifting. Token spend is cheap relative to engineering headcount. The realistic trajectory is fewer hires overall but stronger ones, with higher expectations for what a single engineer delivers. The premium on knowing what to build — rather than just being able to build it — is going up.

## Where things stand

These aren't last year's models. The gap between GPT-4 and the current generation is significant — not just in raw capability but in holding complex context, following nuanced instructions, reasoning across unfamiliar domains. They're improving quickly.

If you have the judgment to know what's worth building and the domain knowledge to evaluate the output, you now have access to a multiplier that wasn't available before. If you don't, AI will get you to the wrong destination faster.
