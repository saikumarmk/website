---
title: 'Ultra-Scale Heuristics Distillation'
created: 2025-12-31
updated: 2025-12-31
tags: [5D-parallelism, overlap, bucketing, ZeRO, playbook, ultra-scale]
growth:
  node_id: 'ultra-scale-heuristics'
  branch: 'systems-hpc'
  tier: 'trunk'
  estimate_hours: 30
---

<script context="module">
  export const concepts = [
    { id: '5d-parallelism', title: '5D Parallelism: DP + TP + PP + SP + CP' },
    { id: 'overlap-strategies', title: 'Overlap: Compute, Communication, I/O' },
    { id: 'bucketing', title: 'Gradient Bucketing & AllReduce Optimization' },
    { id: 'zero-interplay', title: 'ZeRO + Tensor Parallelism Interplay' },
    { id: 'memory-budgeting', title: 'Memory Budgeting: Activation, Gradients, Optimizer States' },
    { id: 'comm-compute-ratio', title: 'Communication-Compute Ratio Analysis' },
    { id: 'scaling-laws', title: 'Empirical Scaling Laws for Parallelism' }
  ];
</script>

<script>
  import ConceptChecklist from '$lib/components/growth/ConceptChecklist.svelte';
</script>

## Overview

Your **living playbook** for ultra-scale distributed training. Distill practical heuristics for 5D parallelism, overlap strategies, gradient bucketing, and the ZeRO + Tensor Parallelism interplay.

**This is the "scale bible"** — a constantly updated reference as you encounter real bottlenecks.

## Key Concepts

<ConceptChecklist nodeId="ultra-scale-heuristics" {concepts} />

## The 5D Parallelism Stack

Modern large-scale training combines multiple parallelism strategies:

1. **Data Parallelism (DP):** Replicate model across workers
2. **Tensor Parallelism (TP):** Shard individual layers across GPUs
3. **Pipeline Parallelism (PP):** Split model layers across stages
4. **Sequence Parallelism (SP):** Shard sequence dimension for long-context models
5. **Context Parallelism (CP):** Ring-style attention for ultra-long sequences

**The art:** Knowing which dimensions to parallelize for your model + hardware.

## Overlap Strategies

### Compute-Communication Overlap

Key insight: **Don't wait for communication to finish before computing.**

- **Gradient bucketing:** AllReduce gradients in buckets as they're computed
- **Pipeline bubbles:** Fill bubbles with microbatches
- **Prefetching:** Load next batch while current batch is computing

### ZeRO + Tensor Parallelism Interplay

**Naive approach:** Apply ZeRO-3 + TP independently leads to excessive communication

**Better approach:** 
- Use TP within nodes (high bandwidth)
- Use ZeRO across nodes (lower bandwidth)
- Hybrid sharding: `HYBRID_SHARD` in PyTorch FSDP

## Gradient Bucketing

**Problem:** Waiting for all gradients before AllReduce wastes time.

**Solution:** Bucket gradients and start AllReduce as soon as each bucket is ready.

**Tuning:** Bucket size trades off:
- Small buckets: more overlap, more kernel launches
- Large buckets: less overlap, fewer kernel launches

**Heuristic:** 25MB buckets is a good default for most models.

## Memory Budgeting

For a transformer with N parameters:

- **Parameters:** N
- **Gradients:** N
- **Optimizer states (AdamW):** 2N (momentum + variance)
- **Activations:** Depends on batch size, sequence length, hidden size

**ZeRO-3 savings:** (N + N + 2N) / num_gpus = 4N / num_gpus

**Activation checkpointing:** Trade compute for memory (recompute activations in backward pass)

## Communication-Compute Ratio

**Good scaling:** Communication time much less than Compute time

**Rule of thumb:** Aim for greater than 10:1 compute-to-communication ratio.

**How to achieve:**
- Increase batch size (more compute per communication)
- Use faster interconnect (NVLink better than PCIe, InfiniBand better than Ethernet)
- Reduce communication frequency (gradient accumulation)

## Key Resources

### 📚 Essential Playbooks

**Nanotron Ultra-Scale Playbook**  
[https://huggingface.co/spaces/nanotron/ultrascale-playbook](https://huggingface.co/spaces/nanotron/ultrascale-playbook)

The definitive reference for ultra-scale training heuristics. Covers 5D parallelism interplay, overlap strategies, and practical recipes for scaling to thousands of GPUs. **This is your bible.**

**Smol Training Playbook** (complementary)  
[https://huggingface.co/spaces/HuggingFaceTB/smol-training-playbook](https://huggingface.co/spaces/HuggingFaceTB/smol-training-playbook)

## Learning Path

### Phase 1: Understand the Dimensions (10 hours)
1. Read Nanotron Ultra-Scale Playbook cover-to-cover
2. Map each parallelism type to a concrete use case
3. Sketch communication patterns for hybrid TP+ZeRO

### Phase 2: Hands-On Profiling (12 hours)
1. Profile a 7B model with different parallelism configs
2. Measure communication-compute ratio
3. Experiment with gradient bucketing sizes
4. Compare memory usage: ZeRO-1 vs ZeRO-2 vs ZeRO-3

### Phase 3: Build Your Heuristics Library (8 hours)
1. Document your own scaling rules for your hardware
2. Create a decision tree: "Given model size X and N GPUs, use..."
3. Benchmark and record actual throughput numbers

## Practical Heuristics (Living Document)

### Model Size Decision Tree

**Under 1B params:**
- Pure DP (simplest, fastest)
- ZeRO-1 if memory tight

**1B - 13B params:**
- DP + ZeRO-2
- Consider TP=2 within nodes if very memory constrained

**13B - 70B params:**
- DP + ZeRO-3 or FSDP
- TP=2 or TP=4 within nodes
- PP=2 if model still doesn't fit

**Over 70B params:**
- Full 5D parallelism
- TP=4 or TP=8 within nodes
- PP=4+ across nodes
- ZeRO-3 or hybrid sharding
- Consider SP/CP for long-context variants

### Overlap Checklist

✅ Gradient bucketing enabled (25MB buckets)  
✅ Data prefetching in dataloader  
✅ Pipeline parallelism with microbatches (8-16 microbatches)  
✅ Activation checkpointing for memory-bound models  
✅ Mixed precision (bf16) to reduce communication volume  

## Common Pitfalls

❌ **Over-parallelizing:** More parallelism ≠ faster. Communication overhead can dominate.

❌ **Ignoring hardware topology:** Don't use TP across nodes (slow interconnect).

❌ **Skipping profiling:** Measure before optimizing. Your intuition will be wrong.

❌ **Cargo-culting configs:** What works for LLaMA 70B won't work for a video DiT.

## Next Steps

**Next Steps:**
- **Long-Context Parallelism:** Deep dive into SP/CP for 1M+ token contexts
- **Inference Serving:** Apply parallelism thinking to latency-constrained serving

## Maintenance

This is a **living document.** As you encounter new bottlenecks or discover better heuristics, update this page with:
- Empirical throughput numbers
- Hardware-specific tuning
- Model-specific quirks (e.g., DiT vs Transformer parallelism)

