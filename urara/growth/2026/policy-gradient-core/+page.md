---
title: 'Policy Gradient Core'
created: 2025-12-31
updated: 2025-12-31
tags: [REINFORCE, actor-critic, policy-gradient, RL]
growth:
  node_id: 'policy-gradient-core'
  branch: 'rl'
  tier: 'roots'
  estimate_hours: 10
---

<script context="module">
  export const concepts = [
    { id: 'policy-gradient-theorem', title: 'Policy Gradient Theorem: Derivation' },
    { id: 'reinforce', title: 'REINFORCE Algorithm: Monte Carlo PG' },
    { id: 'variance-reduction', title: 'Variance Reduction: Baselines' },
    { id: 'actor-critic', title: 'Actor-Critic Architecture' },
    { id: 'advantage-estimation', title: 'Advantage Estimation (GAE)' }
  ];
</script>

<script>
  import ConceptChecklist from '$lib/components/growth/ConceptChecklist.svelte';
</script>

## Overview

Build the foundational understanding of policy gradient methods from first principles. Derive the policy gradient theorem, implement REINFORCE, and understand the actor-critic paradigm.

**Goal:** Deeply understand **why** we can optimize policies directly by maximizing expected reward.

## Key Concepts

<ConceptChecklist nodeId="policy-gradient-core" {concepts} />

## The Policy Gradient Theorem

**Core idea:** Instead of learning Q-values (value-based RL), directly parameterize and optimize the policy $\pi_\theta(a|s)$.

**Policy Gradient Theorem:**

$$
\nabla_\theta J(\theta) = \mathbb{E}_{\tau \sim \pi_\theta} \left[ \sum_{t=0}^T \nabla_\theta \log \pi_\theta(a_t | s_t) \cdot R(\tau) \right]
$$

Where:
- $\theta$: Policy parameters
- $\tau$: Trajectory (sequence of states, actions)
- $R(\tau)$: Return (total reward)

**Intuition:** Increase probability of actions that led to high reward.

## REINFORCE Algorithm

The simplest policy gradient algorithm:

1. Collect trajectories by running policy \(\pi_\theta\)
2. Compute returns \(R(\tau)\) for each trajectory
3. Update policy: \(\theta \leftarrow \theta + \alpha \nabla_\theta \log \pi_\theta \cdot R(\tau)\)

**Problem:** High variance! Single trajectory return is noisy.

**Solution:** Baselines and advantage estimation.

## Variance Reduction: Baselines

**Key insight:** Subtract a baseline from returns without biasing the gradient.

$$
\nabla_\theta J(\theta) = \mathbb{E}_{\tau} \left[ \nabla_\theta \log \pi_\theta(a_t | s_t) \cdot (R(\tau) - b(s_t)) \right]
$$

**Common baseline:** Value function $V(s_t)$ leads to **actor-critic**.

## Actor-Critic Architecture

**Two networks:**
- **Actor:** Policy $\pi_\theta(a|s)$ (what to do)
- **Critic:** Value function $V_\phi(s)$ (how good is this state)

**Advantage:** $A(s, a) = Q(s, a) - V(s)$

**Update rule:**
$$
\theta \leftarrow \theta + \alpha \nabla_\theta \log \pi_\theta(a|s) \cdot A(s, a)
$$

**Benefit:** Lower variance than pure REINFORCE, faster learning.

## Generalized Advantage Estimation (GAE)

**Problem:** Bias-variance trade-off in advantage estimation.

**GAE solution:** Exponentially weighted average of n-step advantages.

$$
\hat{A}_t = \sum_{l=0}^\infty (\gamma \lambda)^l \delta_{t+l}
$$

Where $\delta_t = r_t + \gamma V(s_{t+1}) - V(s_t)$ (TD error).

**Tuning $\lambda$:**
- $\lambda = 0$: Low variance, high bias (TD learning)
- $\lambda = 1$: High variance, low bias (Monte Carlo)
- $\lambda = 0.95$: Good default

## Key Resources

### 📚 Essential Reading

**REINFORCE Algorithm Tutorial** (Substack)  
[https://substack.com/inbox/post/170790602](https://substack.com/inbox/post/170790602)

Clear walkthrough of the REINFORCE algorithm with derivations.

**The RLHF Book**  
[https://rlhfbook.com/](https://rlhfbook.com/)

Comprehensive resource for RL in the context of LLM post-training. Covers policy gradients, PPO, and RLHF applications. **Essential for applied RL.**

### 📖 Books

**Foundations of Deep Reinforcement Learning** by Graesser & Keng

Practical, code-first approach to deep RL. Includes PyTorch implementations of REINFORCE, actor-critic, and PPO.

## Learning Path

### Phase 1: Theory (4 hours)
1. Derive policy gradient theorem from scratch
2. Read REINFORCE tutorial
3. Work through actor-critic derivation

### Phase 2: Implementation (4 hours)
1. Implement REINFORCE on CartPole
2. Add baseline (value function)
3. Implement actor-critic
4. Compare variance: REINFORCE vs actor-critic

### Phase 3: Deep Dive (2 hours)
1. Read RLHF Book chapter on policy gradients
2. Implement GAE
3. Understand connection to PPO (next node)

## Common Pitfalls

❌ **Forgetting the log:** It's $\nabla \log \pi$, not $\nabla \pi$.

❌ **Biased baselines:** Only state-dependent baselines are unbiased.

❌ **Ignoring variance:** High variance = slow/unstable learning. Always use baselines.

❌ **Wrong advantage signs:** Positive advantage - increase action probability.

## Next Steps

- - **PPO from Scratch:** The de facto standard policy gradient algorithm
- - **Preference Data & Eval Design:** How to get reward signals from human preferences

## Assessment Criteria

✅ You understand this node when you can:
- Derive the policy gradient theorem
- Implement REINFORCE from scratch
- Explain why baselines reduce variance without bias
- Code up an actor-critic agent
- Implement GAE and tune \(\lambda\)

