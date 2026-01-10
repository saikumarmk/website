---
title: 'Competitive Programming'
created: 2026-01-10
updated: 2026-01-10
tags: []
growth:
  node_id: 'competitive-programming'
  branch: 'swe-craft'
  tier: 'roots'
  estimate_hours: 10
---

<script>
import PythonCode from '$lib/components/prose/code.svelte'
</script>


## Overview

Page for any competitive programming algorithms and techniques I learn.


## Edit Distance Revisited (1/10/2026)

A reminder, that for any dynamic programming problem, is that we can think of it as a mathematical optimisation problem, which is defined by 

- Overlapping Subproblems
- Optimal Substructure

We think about the recurrence that links different states, and define a state space that's helpful for our problem. In the case of edit distance, for strings $A$ and $B$, we defined the state $D(i,j)$ as the minimum edit distance between the prefixes $A[0:i]$ and $B[0:j]$. That way, our solution is simply $D(|A|, |B|)$.


We define the recurrence as:

$$
D(i,j) = \min \begin{cases} 
  D(i-1, j) + 1 & \text{(deletion)} \\
  D(i, j-1) + 1 & \text{(insertion)} \\
  D(i-1, j-1) + \text{cost}(A[i], B[j]) & \text{(substitution)}
\end{cases}
$$

Here, $\text{cost}(A[i], B[j])$ is $0$ if the characters are the same, and $1$ otherwise. If you think about the recurrence, cover the character at position $i$ and $j$ in $A$ and $B$ respectively. We can get to that point via insertion $(i,j-1)$, deletion $(i-1,j)$, or substituting a character $(i-1,j-1)$.


<PythonCode sourceUrl="/annotations/edit_distance.py" title=""/>

# Trees

To motivate the many ways we can solve LCA, we start with a naive implementation.

## Naive LCA 

## Binary Lifting

Think of this as an amazing teleportation technique. If we have the ability to ascend $2^k$ levels in one jump, then we can reach any ancestor in $O(\log N)$ jumps. After which, we can then trivially iterate on the remaining ones. As an example, if we want to go up $13$ levels, we can do $1+4+8$ jumps, which is $3$ jumps total. We look at the first ancestor of our node, then the $2^2$ ancestor of that node, and then the $2^3$ ancestor of that node.

All of this corresponds to looking at a table repeatedly until we get to our destination.


<PythonCode sourceUrl="/annotations/binary_lifting.py" title=""/>

## Resources

- Resource 1
- Resource 2
