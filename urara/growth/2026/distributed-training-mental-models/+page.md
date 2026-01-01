---
flags:
  - unlisted
title: 'Distributed Training Mental Models'
created: 2025-12-31
updated: 2025-12-31
tags: [distributed, DP, FSDP, ZeRO, sharding, mental-models]
growth:
  node_id: 'distributed-training-mental-models'
  branch: 'systems-hpc'
  tier: 'roots'
  estimate_hours: 15
---
flags:
  - unlisted

<script context="module">
  export const concepts = [
    { id: 'data-parallelism', title: 'Data Parallelism (DP) Mental Model' },
    { id: 'fsdp', title: 'Fully Sharded Data Parallel (FSDP)' },
    { id: 'zero', title: 'ZeRO: Memory Optimization Stages' },
    { id: 'sharding-strategies', title: 'Sharding Strategies & Trade-offs' },
    { id: 'communication-patterns', title: 'Communication Patterns (AllReduce, AllGather)' },
    { id: 'gradient-accumulation', title: 'Gradient Accumulation & Micro-batching' }
  ];
</script>

<script>
  import ConceptChecklist from '$lib/components/growth/ConceptChecklist.svelte';
</script>

## Overview

Build foundational mental models for distributed training. Understand the **why** behind DP, FSDP, ZeRO, and sharding strategies before diving into implementation.

**Goal:** Develop intuition for when to use which parallelism strategy and understand the memory/communication trade-offs.

## Key Concepts

<ConceptChecklist nodeId="distributed-training-mental-models" {concepts} />

## Core Mental Models

### 1. Data Parallelism (DP)

The simplest distributed training pattern:
- Each GPU has a **full copy** of the model
- Data is split across GPUs
- After forward/backward, gradients are synchronized (AllReduce)

**When it works:** Small models that fit in GPU memory.

**When it breaks:** Model larger than GPU memory. Enter FSDP/ZeRO.

### 2. Fully Sharded Data Parallel (FSDP)

Extension of DP that shards model parameters:
- Each GPU holds only a **shard** of the model
- Parameters are gathered (AllGather) when needed for computation
- Gradients are reduced (ReduceScatter) after backward

**Memory win:** Model parameters divided by N GPUs.

**Communication cost:** More frequent AllGather/ReduceScatter operations.

### 3. ZeRO: Memory Optimization Stages

ZeRO progressively shards different training states:

- **ZeRO-1:** Shard optimizer states only (~4× memory reduction)
- **ZeRO-2:** Shard optimizer states + gradients (~8× reduction)
- **ZeRO-3:** Shard optimizer states + gradients + parameters (~N× reduction, equivalent to FSDP)

**Trade-off:** Higher ZeRO stages = more memory efficient, more communication overhead.

### 4. Sharding Strategies

**Full Shard:** Maximum memory savings, maximum communication (ZeRO-3/FSDP)

**Hybrid Shard:** Shard within nodes, replicate across nodes (balance memory & communication)

**No Shard:** Pure data parallelism (DP)

### 5. Communication Patterns

**AllReduce:** Sum gradients across all GPUs (DP)

**AllGather:** Gather sharded parameters before forward/backward (FSDP)

**ReduceScatter:** Sum gradients and shard result (FSDP)

Understanding these primitives is key to reasoning about distributed training bottlenecks.

## Key Resources

### 📚 Essential Reading

**Smol Training Playbook** (HuggingFace)  
[https://huggingface.co/spaces/HuggingFaceTB/smol-training-playbook](https://huggingface.co/spaces/HuggingFaceTB/smol-training-playbook)

Comprehensive guide to designing model architecture, choosing parallelism strategies, and understanding distributed training trade-offs. **Start here.**

## Learning Path

1. **Conceptual Understanding (4 hours)**
   - Read Smol Training Playbook sections on parallelism
   - Draw diagrams of DP vs FSDP communication patterns
   - Understand when each strategy applies

2. **Mental Model Building (6 hours)**
   - Work through ZeRO stages: what gets sharded at each level?
   - Calculate memory savings for a sample model (7B params)
   - Map communication patterns to actual operations

3. **Hands-On Exploration (5 hours)**
   - Instrument a small model with torchrun + FSDP
   - Profile memory usage at different ZeRO stages
   - Measure communication overhead

## Common Pitfalls

❌ **"FSDP is always better"** — No! Pure DP can be faster for small models due to lower communication overhead.

❌ **"ZeRO-3 = free memory"** — Communication cost increases. Understand the trade-off.

❌ **"Sharding is enough"** — You also need pipeline parallelism for very large models (coming in later nodes).

## Next Steps

After mastering these mental models:
- - **Fault Tolerance & Suspend/Resume:** How to make distributed training reliable
- - **Ultra-Scale Heuristics:** Practical playbook for 5D parallelism + ZeRO interplay
- - **Research Harness v2:** Apply these concepts to a reusable training template

## Assessment Criteria

✅ You understand this node when you can:
- Explain when to use DP vs FSDP vs ZeRO-3 for a given model size
- Draw the communication pattern for each strategy
- Calculate memory savings from sharding
- Articulate the trade-offs (memory vs communication)

