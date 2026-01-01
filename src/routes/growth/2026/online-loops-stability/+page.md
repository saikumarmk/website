---
title: 'Online Loops & Stability'
created: 2025-12-31
updated: 2025-12-31
tags: [online, distribution-shift, stability, iterative-training, RL]
growth:
  node_id: 'online-loops-stability'
  branch: 'rl'
  tier: 'trunk'
  estimate_hours: 20
---

<script context="module">
  export const concepts = [
    { id: 'online-rl', title: 'Online RL: Data Collection + Training Loop' },
    { id: 'distribution-shift', title: 'Distribution Shift: Policy vs Reward Model' },
    { id: 'reward-hacking', title: 'Reward Hacking: Detection & Mitigation' },
    { id: 'kl-regularization', title: 'KL Regularization: Reference Policy Anchoring' },
    { id: 'reward-model-updates', title: 'Reward Model Updates: When & How' },
    { id: 'stability-knobs', title: 'Stability Knobs: LR schedules, KL budgets, RM freezing' },
    { id: 'llm-learning-dynamics', title: 'LLM Learning Dynamics: SFT - PPO - DPO' }
  ];
</script>

<script>
  import ConceptChecklist from '$lib/components/growth/ConceptChecklist.svelte';
</script>

## Overview

Master the art of iterative online RL training. Understand distribution shift, reward hacking, and the stability knobs needed to keep training on track when both policy and reward model evolve.

**Goal:** Build robust online RL systems that don't collapse or hack rewards.

## Key Concepts

<ConceptChecklist nodeId="online-loops-stability" {concepts} />

## Online RL Loop

**Classic RL:** Fixed environment, train policy.

**RLHF/Online RL:** Environment (reward model) and policy both evolve.

**Loop:**
1. Collect data with current policy $\pi_\theta$
2. Train reward model $r_\phi$ on new preferences
3. Run PPO to optimize $\pi_\theta$ against $r_\phi$
4. Repeat

**Challenge:** How to keep this stable when both $\pi$ and $r$ are moving targets?

## Distribution Shift

**Problem:** Reward model trained on data from $\pi_{\text{old}}$, but we're using it to evaluate $\pi_{\text{new}}$.

**Consequence:** Reward model becomes **miscalibrated** on new policy outputs.

**Symptoms:**
- Reward scores inflate without quality improvement
- Policy generates adversarial examples that fool RM
- Human raters disagree with RM scores

**Solutions:**
1. **KL regularization:** Keep policy close to reference $\pi_{\text{ref}}$
2. **Iterative RM updates:** Collect new preferences on $\pi_{\text{new}}$ outputs
3. **Ensemble RMs:** Use multiple RMs to detect disagreement

## Reward Hacking

**Definition:** Policy learns to exploit flaws in the reward model without improving actual quality.

**Examples:**
- Generating verbose but low-content responses (RM prefers length)
- Using rare tokens RM hasn't seen (RM assigns high uncertainty - high reward)
- Repeating patterns RM can't detect (e.g., subtle repetition)

**Detection:**
1. **Human eval diverges from RM:** RM says great, humans say bad
2. **RM ensemble disagrees:** RMs give wildly different scores
3. **KL explodes:** Policy strays far from reference

**Mitigation:**
1. **KL penalty:** $\text{reward} = r_\phi(\text{output}) - \beta \cdot \text{KL}(\pi || \pi_{\text{ref}})$
2. **RM ensemble:** Only trust reward if all RMs agree
3. **Human-in-the-loop:** Regular human audits
4. **Adversarial RM training:** Collect hacked examples, retrain RM

## KL Regularization

**Objective:**
$$
\max_\theta \mathbb{E}_{x, y \sim \pi_\theta} \left[ r_\phi(x, y) - \beta \cdot \text{KL}(\pi_\theta(y|x) || \pi_{\text{ref}}(y|x)) \right]
$$

**Intuition:** Optimize reward but don't stray too far from reference policy.

**Tuning $\beta$:**
- Too small - reward hacking
- Too large - policy doesn't improve
- Typical range: 0.01ΓÇô0.1 (tune empirically)

**Adaptive KL:** Use KL budget that adjusts based on training progress.

## Reward Model Updates

**When to update RM:**
- Γ£à After every N iterations (e.g., every 5 PPO rounds)
- Γ£à When KL divergence crosses threshold (policy drifted too far)
- Γ£à When human eval shows RM miscalibration

**How to update RM:**
1. Collect new preference data from current policy outputs
2. Finetune RM (don't reset!) on mixed dataset (old + new)
3. Validate RM on held-out preferences
4. If RM quality degrades, rollback or use ensemble

**Risk:** RM overfitting to current policy - amplifies hacking.

**Solution:** Keep diverse preference dataset spanning many policy checkpoints.

## Stability Knobs

### Learning Rate Schedules
- Start with high LR for fast initial progress
- Decay LR as policy stabilizes
- Use warmup for RM updates

### KL Budget Management
- Start with low KL budget (conservative)
- Gradually increase as RM gets more data
- Monitor KL per-iteration, not just cumulative

### RM Freezing Periods
- Freeze RM for N iterations to let policy catch up
- Update RM only when policy plateaus

### Checkpointing & Rollback
- Save policy checkpoints every iteration
- If reward hacking detected, rollback to last good checkpoint

## LLM Learning Dynamics

**SFT - PPO - DPO progression:**

1. **SFT (Supervised Fine-Tuning):** Learn from demonstrations
   - Fast initial progress
   - Upper bounded by demo quality
2. **PPO (Online RL):** Optimize reward model
   - Can surpass demos
   - Requires careful tuning
3. **DPO (Direct Preference Optimization):** Offline preference learning
   - Simpler, no reward model
   - Less prone to hacking

**Key insight:** Different algorithms shine at different stages of training.

## Key Resources

### ≡ƒôÜ Essential Papers

**Understanding LLM Learning Dynamics** (arXiv:2407.10490)  
[https://arxiv.org/abs/2407.10490](https://arxiv.org/abs/2407.10490)

Deep analysis of SFT, PPO, and DPO learning dynamics for LLMs. Essential for understanding when each algorithm works best and how they interact. **Must-read for RLHF practitioners.**

**The RLHF Book**  
[https://rlhfbook.com/](https://rlhfbook.com/)

Chapters on online training, distribution shift, and reward hacking with practical advice.

## Learning Path

### Phase 1: Understand the Dynamics (6 hours)
1. Read arXiv:2407.10490 (LLM learning dynamics)
2. Study RLHF Book chapters on online loops
3. Understand failure modes (reward hacking, distribution shift)

### Phase 2: Implement (10 hours)
1. Build online RL loop: PPO + iterative RM updates
2. Implement KL regularization with tunable \(\beta\)
3. Add monitoring: KL divergence, RM calibration, human eval
4. Simulate reward hacking and test mitigation strategies

### Phase 3: Stability Engineering (4 hours)
1. Experiment with different RM update frequencies
2. Tune KL budget over training
3. Implement RM ensemble for hacking detection
4. Build rollback system for catastrophic failures

## Common Pitfalls

Γ¥î **Never updating RM:** Policy will eventually hack a fixed RM.

Γ¥î **Updating RM too often:** RM overfits to current policy.

Γ¥î **No KL regularization:** Guaranteed reward hacking.

Γ¥î **Ignoring human eval:** RM scores become meaningless without ground truth.

Γ¥î **No rollback plan:** When training goes off the rails, you're stuck.

## Next Steps

- - **Search / Test-Time Compute:** Use RMs at inference time for best-of-N sampling
- - **RL for Structured Outputs:** Apply online RL to constrained generation (layouts, CDFs)

## Assessment Criteria

Γ£à You understand this node when you can:
- Implement a full online RL loop with iterative RM updates
- Detect and mitigate reward hacking
- Tune KL regularization based on training dynamics
- Monitor distribution shift and RM calibration
- Explain SFT - PPO - DPO progression
- Build robust checkpointing and rollback systems

