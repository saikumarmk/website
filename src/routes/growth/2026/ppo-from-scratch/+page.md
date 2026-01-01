---
title: 'PPO from Scratch'
created: 2025-12-31
updated: 2025-12-31
tags: [PPO, implementation, evaluation, RL, GRPO]
growth:
  node_id: 'ppo-from-scratch'
  branch: 'rl'
  tier: 'roots'
  estimate_hours: 15
---

<script context="module">
  export const concepts = [
    { id: 'clipped-objective', title: 'PPO Clipped Surrogate Objective' },
    { id: 'importance-sampling', title: 'Importance Sampling & Probability Ratios' },
    { id: 'kl-penalty', title: 'KL Penalty vs Clipping' },
    { id: 'implementation', title: 'Full PPO Implementation' },
    { id: 'hyperparameters', title: 'Hyperparameter Tuning (clip_eps, GAE lambda)' },
    { id: 'evaluation-discipline', title: 'Evaluation Discipline & Debugging' },
    { id: 'grpo', title: 'GRPO: Group Relative Policy Optimization' }
  ];
</script>

<script>
  import ConceptChecklist from '$lib/components/growth/ConceptChecklist.svelte';
</script>

## Overview

Implement Proximal Policy Optimization (PPO) from scratch and build strong evaluation discipline. PPO is the workhorse of modern RLHF and the foundation for understanding post-training.

**Goal:** Build a production-grade PPO implementation you can trust and extend.

## Key Concepts

<ConceptChecklist nodeId="ppo-from-scratch" {concepts} />

## Why PPO?

**Problem with vanilla policy gradients:** Large policy updates can catastrophically degrade performance.

**PPO solution:** Constrain policy updates to a "trust region" using a clipped objective.

## The PPO Objective

**Clipped surrogate objective:**

$$
L^{CLIP}(\theta) = \mathbb{E}_t \left[ \min(r_t(\theta) \hat{A}_t, \text{clip}(r_t(\theta), 1-\epsilon, 1+\epsilon) \hat{A}_t) \right]
$$

Where:
- $r_t(\theta) = \frac{\pi_\theta(a_t|s_t)}{\pi_{\theta_{\text{old}}}(a_t|s_t)}$: Probability ratio (importance sampling)
- $\hat{A}_t$: Advantage estimate (from GAE)
- $\epsilon$: Clip range (typically 0.2)

**Intuition:** If ratio greater than 1+╬╡ or less than 1-╬╡, clip it. Don't let policy change too much.

## Implementation Checklist

### Core Components

Γ£à **Policy network** ($\pi_\theta$): Output action probabilities  
Γ£à **Value network** ($V_\phi$): Estimate state values  
Γ£à **Advantage computation** (GAE with $\lambda = 0.95$)  
Γ£à **Probability ratio**: $r_t = \pi_{\text{new}} / \pi_{\text{old}}$  
Γ£à **Clipped objective**: $\min(r \cdot A, \text{clip}(r, 1-\epsilon, 1+\epsilon) \cdot A)$  
Γ£à **Value loss**: MSE between predicted and actual returns  
Γ£à **Entropy bonus**: Encourage exploration  

### Training Loop

1. **Collect rollouts** using current policy
2. **Compute advantages** using GAE
3. **Multiple epochs** of minibatch updates (e.g., 4 epochs)
4. **Update policy** with clipped objective
5. **Update value function** with MSE loss
6. **Log metrics**: KL divergence, clip fraction, explained variance

## KL Penalty vs Clipping

**Two ways to constrain policy updates:**

1. **Clipping (PPO-Clip):** Hard constraint via clipping
2. **KL Penalty (PPO-KL):** Soft constraint via penalty term

$$
L^{KL}(\theta) = \mathbb{E}_t \left[ r_t(\theta) \hat{A}_t - \beta \cdot \text{KL}(\pi_{\theta_{\text{old}}} || \pi_\theta) \right]
$$

**In practice:** PPO-Clip is simpler and works just as well. Use that.

## Hyperparameter Tuning

**Critical hyperparameters:**

- **clip_eps (╬╡):** 0.1ΓÇô0.3 (default 0.2)
- **GAE lambda (╬╗):** 0.9ΓÇô0.99 (default 0.95)
- **Learning rate:** 3e-4 (tune with lr schedule)
- **Minibatch size:** 64ΓÇô256
- **Number of epochs:** 3ΓÇô10 (watch for overfitting)
- **Entropy coefficient:** 0.01 (decay over training)

**Tuning strategy:** Start with defaults, watch KL divergence and clip fraction.

## Evaluation Discipline

### Metrics to Track

Γ£à **Episode return** (mean, std, min, max)  
Γ£à **KL divergence** (should be small, less than 0.05)  
Γ£à **Clip fraction** (what % of updates were clipped)  
Γ£à **Explained variance** (how well V predicts returns)  
Γ£à **Entropy** (should decay slowly)  
Γ£à **Policy loss, value loss**  

### Debugging Checklist

Γ¥î **KL divergence exploding?** Reduce learning rate or clip_eps  
Γ¥î **Clip fraction = 1?** Policy changing too fast, reduce LR  
Γ¥î **Explained variance negative?** Value function broken, check value loss  
Γ¥î **Entropy going to 0 too fast?** Increase entropy coefficient  

## GRPO: Group Relative Policy Optimization

**Recent variant:** Instead of comparing to a value function baseline, use **group-wise relative rewards**.

**Idea:** Normalize rewards within each batch/group before computing advantages.

$$
\hat{A}_i = R_i - \frac{1}{G} \sum_{j \in \text{group}} R_j
$$

**Benefit:** Simpler (no value function), more stable for some tasks.

## Key Resources

### ≡ƒôÜ Essential Reading

**PPO and GRPO Comparison** (Yugeten)  
[https://yugeten.github.io/posts/2025/01/ppogrpo/](https://yugeten.github.io/posts/2025/01/ppogrpo/)

Deep dive into PPO implementation details and comparison with GRPO. **Must-read for implementation.**

**The RLHF Book**  
[https://rlhfbook.com/](https://rlhfbook.com/)

Chapters on PPO for LLM post-training with code examples.

### ≡ƒôû Books

**Foundations of Deep Reinforcement Learning** by Graesser & Keng

Chapter on PPO with PyTorch implementation.

## Learning Path

### Phase 1: Understand the Theory (4 hours)
1. Review importance sampling & probability ratios
2. Derive clipped objective from first principles
3. Read Yugeten PPO/GRPO post

### Phase 2: Implement (8 hours)
1. Implement PPO on CartPole or MuJoCo
2. Track all key metrics (KL, clip fraction, explained variance)
3. Debug until you get smooth learning curves
4. Compare to baseline implementation (e.g., Stable-Baselines3)

### Phase 3: Deep Dive (3 hours)
1. Implement GRPO variant
2. Compare PPO vs GRPO on same task
3. Read RLHF Book chapters on LLM post-training with PPO

## Common Pitfalls

Γ¥î **Not normalizing advantages:** Always normalize per-batch.

Γ¥î **Too many epochs:** Overfitting leads to high KL divergence.

Γ¥î **Forgetting old policy probabilities:** Store log probs from rollouts!

Γ¥î **Wrong advantage signs:** Double-check your advantage computation.

Γ¥î **Ignoring clip fraction:** If it's 0 or 1, something's wrong.

## Next Steps

- **DPO-Family Competence:** Modern alternatives to PPO (offline RL)
- **Online Loops & Stability:** Iterative PPO training with reward model updates

## Assessment Criteria

Γ£à You understand this node when you can:
- Implement PPO from scratch with all bells and whistles
- Explain why clipping constrains policy updates
- Tune hyperparameters based on logged metrics
- Debug training instabilities (KL explosion, clip fraction issues)
- Compare PPO to GRPO and articulate trade-offs

