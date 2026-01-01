---
title: 'Flow Matching Fundamentals'
created: 2025-12-31
updated: 2025-12-31
tags: [ODE, flow-matching, trajectory, diffusion, continuous-normalizing-flows]
growth:
  node_id: 'flow-matching-fundamentals'
  branch: 'gen-media'
  tier: 'roots'
  estimate_hours: 12
---

<script context="module">
  export const concepts = [
    { id: 'ode-trajectory', title: 'ODE Trajectory Mental Model' },
    { id: 'flow-matching-objective', title: 'Flow Matching Objective: Conditional & Marginal' },
    { id: 'vs-diffusion', title: 'Flow Matching vs Diffusion Models' },
    { id: 'sampling', title: 'ODE Solvers for Sampling (Euler, RK4, DPM-Solver)' },
    { id: 'training', title: 'Training: Regression on Vector Fields' }
  ];
</script>

<script>
  import ConceptChecklist from '$lib/components/growth/ConceptChecklist.svelte';
</script>

## Overview

Master the conceptual foundation of flow matching and continuous normalizing flows. Understand how to learn a trajectory from noise to data by training a vector field.

**Goal:** Build intuition for the ODE perspective on generative modeling and understand why flow matching is often simpler than diffusion.

## Key Concepts

<ConceptChecklist nodeId="flow-matching-fundamentals" {concepts} />

## The ODE Trajectory Mental Model

**Core idea:** Generative modeling as learning a **continuous path** from noise $z_0 \sim \mathcal{N}(0, I)$ to data $z_1 \sim p_{\text{data}}$.

Define an ODE:
$$
\frac{dz_t}{dt} = v_\theta(z_t, t)
$$

Where $v_\theta$ is a learned **vector field**.

**Forward process:** $z_0 \to z_1$ (noise to data)  
**Sampling:** Solve ODE forward from $z_0$ to get $z_1$

**Intuition:** Instead of learning to denoise (diffusion), learn the **velocity** at each point along the path.

## Flow Matching Objective

**Goal:** Train $v_\theta$ to match the true vector field $v_t$.

**Conditional flow matching loss:**
$$
\mathcal{L}(\theta) = \mathbb{E}_{t, z_1, z_t} \left[ \| v_\theta(z_t, t) - u_t(z_t | z_1) \|^2 \right]
$$

Where:
- $z_1 \sim p_{\text{data}}$: Real data sample
- $z_t = \alpha_t z_1 + \sigma_t \epsilon$: Interpolated sample at time $t$
- $u_t(z_t | z_1)$: Target vector field (analytically computable!)

**Key insight:** Unlike diffusion (which requires score matching), flow matching has a **simple regression objective**.

## Flow Matching vs Diffusion Models

| Aspect | Diffusion Models | Flow Matching |
|--------|-----------------|---------------|
| **Forward process** | Stochastic (SDE) | Deterministic (ODE) |
| **Training objective** | Score matching (∇ log p) | Vector field regression |
| **Sampling** | SDE/ODE solvers | ODE solvers only |
| **Simplicity** | More complex | Simpler math |
| **Flexibility** | Fixed noise schedule | Flexible paths |

**When to use flow matching:**
- You want a simpler training objective
- You want to design custom interpolation paths
- You prefer deterministic generation

**When to use diffusion:**
- You want stochasticity for diversity
- You're using existing diffusion codebases (Stable Diffusion, etc.)

## ODE Solvers for Sampling

**Euler method** (simplest):
$$
z_{t+\Delta t} = z_t + \Delta t \cdot v_\theta(z_t, t)
$$

**Runge-Kutta 4 (RK4)** (more accurate, fewer steps):
More complex multi-stage method, but allows larger $\Delta t$.

**DPM-Solver** (optimized for generative models):
Exploits structure of learned vector fields for fast sampling.

**Trade-off:** Accuracy vs speed. Euler needs ~100 steps, RK4 ~50 steps, DPM-Solver ~20 steps.

## Training Flow Matching Models

### Algorithm

1. Sample data $z_1 \sim p_{\text{data}}$
2. Sample noise $\epsilon \sim \mathcal{N}(0, I)$
3. Sample time $t \sim U(0, 1)$
4. Interpolate: $z_t = \alpha_t z_1 + \sigma_t \epsilon$
5. Compute target: $u_t = \frac{d}{dt}(\alpha_t z_1 + \sigma_t \epsilon)$
6. Loss: $\| v_\theta(z_t, t) - u_t \|^2$

**Key:** The target $u_t$ is analytically known (no score estimation needed).

### Interpolation Schedule

**Linear interpolation:**
$$
z_t = (1-t) z_0 + t z_1
$$

**Variance-preserving (VP):**
$$
z_t = \sqrt{1-\sigma_t^2} z_1 + \sigma_t \epsilon
$$

**Choice matters:** Affects sample quality and training stability.

## Key Resources

### 📚 Essential Reading

**Flow Matching for Generative Modeling** (arXiv:2510.21890)  
[https://www.arxiv.org/abs/2510.21890](https://www.arxiv.org/abs/2510.21890)

Comprehensive tutorial on flow matching for diffusion modeling. Explains the connection between diffusion and flows, and why flow matching often leads to simpler training. **Start here.**

**MIT Diffusion Course 2025**  
[https://diffusion.csail.mit.edu/2025/](https://diffusion.csail.mit.edu/2025/)

MIT course covering diffusion models and flow matching with lectures, notes, and code. **Excellent for structured learning.**

## Learning Path

### Phase 1: Theory (5 hours)
1. Read flow matching arXiv paper (2510.21890)
2. Work through ODE trajectory derivations
3. Compare to diffusion formulation

### Phase 2: Implementation (5 hours)
1. Implement flow matching on 2D toy data (moons, circles)
2. Visualize learned vector fields
3. Experiment with different interpolation schedules
4. Compare Euler vs RK4 sampling

### Phase 3: Deep Dive (2 hours)
1. Watch MIT Diffusion Course lectures on flow matching
2. Read original Conditional Flow Matching paper (Lipman et al.)
3. Understand Rectified Flow (next node prerequisite)

## Common Pitfalls

❌ **Confusing forward/backward:** Sampling goes **forward** in time (0to1), not backward like diffusion.

❌ **Wrong target vector:** Make sure to use the conditional target \(u_t(z_t | z_1)\), not the marginal.

❌ **Too few sampling steps:** Euler method needs ~100 steps. Use adaptive solvers for faster sampling.

❌ **Ignoring interpolation schedule:** Linear interpolation works but VP schedules often train faster.

## Next Steps

- to **Rectified Flow / Consistency Toolkit:** Modern training and distillation methods
- to **Conditioning & Control:** Add T2V, I2V, camera control to flow models

## Assessment Criteria

✅ You understand this node when you can:
- Explain the ODE trajectory view of generative modeling
- Derive the flow matching loss from scratch
- Implement flow matching on toy datasets
- Articulate the difference from diffusion models
- Choose appropriate ODE solvers for sampling

