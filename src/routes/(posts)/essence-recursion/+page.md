---
title: "Essence of Recursion"
author: Sai Kumar Murali Krishnan
created: 2026-06-14
tags: [recursion, dynamic-programming, linked-lists, trees, leetcode]
summary: "Framing recursion and dynamic programming as mathematical induction, with worked examples from linked lists and binary trees."
topic: maths
---

Recursion is the idea of self-invocation until a base case is reached. Search algorithms like DFS fall out of it almost naturally, and when examined mathematically, it is just induction in disguise.

## Uses

- Recursive data structures (linked lists, trees, graphs)
- Dynamic programming (memoised recursion over a state space)

## Recursion as Mathematical Induction

The idea of induction is as follows. Suppose I have some statement $P(n)$ that I believe to be true over some domain, e.g. $\mathbb{N}$. The goal is to assume $P(n)$ holds for some $n$ and demonstrate that $P(n+1)$ follows. The standard cookbook:

- Prove the base case $P(1)$ holds
- Assume for $n = k$ that $P(k)$ is true (or for strong induction, all $n \leq k$)
- Use that to demonstrate $P(k+1)$ also holds

One useful approach (taught in graph theory) is to start from $P(k+1)$ and reduce it to $P(k)$, rather than building up. As an example:

**Claim:** A tree with $n$ vertices has $n - 1$ edges.

*Proof by induction.* A tree is a connected, acyclic graph. In the base case $n = 1$, a single vertex has no edges, so $P(1)$ holds.

Assume $P(k)$: a tree with $k$ vertices has $k - 1$ edges. Now suppose $T$ is a tree with $k + 1$ vertices. By a corollary (proved in the appendix below), every tree has at least two leaves; pick one, $v_1$. Deleting $v_1$ along with its single edge yields a tree $T'$ on $k$ vertices; no cycles form because we removed a leaf, and connectivity is preserved because a leaf is not a cut vertex. By $P(k)$, $T'$ has $k - 1$ edges, so $|E(T)| = |E(T')| + 1 = k$, which is what we needed to show. $\square$

The key pattern: we relied on the truth of a smaller case to construct the present one. Recursion works the same way. When approaching a recursive problem, ask:

- **Base case:** what does the smallest valid input look like?
- **Sub-problem:** what result from a smaller input do I need?
- **Construction:** how do I assemble my answer from that result?

The challenge in recursion is usually the construction step. In DP, the harder question is choosing the right state representation. Both are fundamentally induction.

## Basic Examples

**Linked list sum.** Applying the three questions:

- *Base case:* empty list → 0
- *Sub-problem:* sum of the tail
- *Construct:* add the head value to the tail sum

```ocaml
(* OCaml: pattern matching makes the structure explicit *)
let rec sum = function
    | [] -> 0
    | head :: tail -> head + sum tail
```

**Coin change.** Minimise the number of coins needed to make amount $n$ from denominations $C = \{C_1, \ldots, C_k\}$:

- *Base case:* $n = 0$ → 0 coins needed; $n < 0$ → impossible
- *Sub-problem:* the minimum coins for $n - C_i$ for each $C_i \in C$
- *Construct:* take 1 plus the minimum of those sub-problems

```python
def coin_change(denoms, n):
    if n == 0:
        return 0
    return min(
        (1 + coin_change(denoms, n - c) for c in denoms if c <= n),
        default=float('inf')
    )
```

These examples track a single piece of state. Harder problems track multiple values, have more edge cases, or require careful thought about what the recursive call should return.

## Leetcode: Twin Sum

[Leetcode 2130: Maximum Twin Sum of a LinkedList](https://leetcode.com/problems/maximum-twin-sum-of-a-linked-list/description/): pair the first and last nodes, second and second-last, and so on, then return the maximum pair sum.

A naive approach (collect the first half into an array, then walk the second half) works but is inelegant. Three cleaner approaches:

- Reverse the first half in place and iterate together
- Hare-and-tortoise to find the midpoint, then reverse
- A **zipper**: descend recursively to the end, then walk the front pointer forward as the call stack unwinds

The zipper approach fell out most naturally to me. The key insight: on the way back up the call stack, we're naturally iterating the *back* pointer from last to first, while the *front* pointer steps forward.

![Twin Sum zipper diagram](/assets/essence/rec_twin_sum.svg)

The recursive function carries the current front node and returns the updated front pointer together with the running maximum:

```python
def recurse(front, back, max_val):
    if back.next is None:
        # base: at the last node, form the first pair
        return max(max_val, back.val + front.val), front.next

    best_val, next_front = recurse(front, back.next, max_val)
    # unwinding: back is now moving backwards; front advances via next_front
    return max(best_val, next_front.val + back.val), next_front.next
```

At every frame on the way up, `back` is one step closer to the front while `next_front` steps forward; they meet in the middle.

## Practice Problems

**Linked lists**

- [234. Palindrome Linked List](https://leetcode.com/problems/palindrome-linked-list/description/)
- [206. Reverse Linked List](https://leetcode.com/problems/reverse-linked-list/description/)
- [24. Swap Nodes in Pairs](https://leetcode.com/problems/swap-nodes-in-pairs/description/)
- [25. Reverse Nodes in k-Group](https://leetcode.com/problems/reverse-nodes-in-k-group/description/)

**Trees**

- [104. Maximum Depth of Binary Tree](https://leetcode.com/problems/maximum-depth-of-binary-tree/description/)
- [110. Balanced Binary Tree](https://leetcode.com/problems/balanced-binary-tree/description/)
- [124. Binary Tree Maximum Path Sum](https://leetcode.com/problems/binary-tree-maximum-path-sum/description/)
- [687. Longest Univalue Path](https://leetcode.com/problems/longest-univalue-path/description/)

## Worked: Reverse Nodes in k-Group

The trick is to isolate the recursive leap of faith. Assume the suffix starting from position $k+1$ is already correctly reversed. Then all you need to do is reverse the current $k$-group and attach it to that sorted suffix: iterate `curr → prev` while threading `curr → next`.

## Worked: Binary Tree Maximum Path Sum

This one tripped me up because you track two different things:

- **Global best:** the best path seen anywhere in the tree (updated at each node)
- **Local best:** the best *continuous* path rooted at this node that a *parent* can extend

Applying the template:

- *Base case:* null node contributes 0; a leaf is just its value
- *Sub-problem:* left and right subtrees each give a global best and a local best (one-sided path)
- *Construct:* try stitching `L + node + R` to update the global best; the local best is `node + max(L, R, 0)`

Keep your variable names precise: confusing `l_best` (global best from left subtree) with `l_path` (best path rooted at left child) is an easy way to get wrong answers.

![Maximum path sum diagram](/assets/essence/rec_path_sum.svg)

**Longest Univalue Path** follows the same pattern, but the "stitching" condition becomes value equality rather than unconstrained addition. Watch your sentinel values: if node values can be negative, don't use `-1` as "impossible".

## How Rusty Was I?

As a form of self-humiliation, a log of the mistakes that actually happened:

- Used `|` instead of `&` in a boolean expression
- Missing brackets around an inequality comparison
- Forgot to `return` the recursive call (classic)
- Returned the whole tuple where only one element was needed
- In Swap Nodes in Pairs: `head.next, head = head, head.next` and `head, head.next = head.next, head` are **not** the same (Python evaluates the right-hand side first as a tuple)
- Struggled to see why you need a temporary when swapping
- The bracket placement in `balanced = (abs(l_height - r_height) <= 1) & l_bal & r_bal`
- Mixed up argument order in a recursive call
- Used the global best from the left subtree to compute the best continuous sum (these are different things)
- Used a sentinel of $-1$ for Longest Univalue Path when node values lie in $[-1000, 1000]$

Despite all that, a few problems was enough to shake the rust off. The main lesson: for trees, you often want to compute a global property while threading local subtree state upwards. Linked list problems often involve a second pointer tracking a different part of the list.

## Appendix: Every Tree Has at Least Two Leaves

For a tree $T$ (connected, acyclic graph) with $n \geq 2$, we claim it has at least one leaf (a vertex of degree 1). Let $P = (u, v_1, \ldots, v)$ be a maximal path in $T$, i.e. one that cannot be extended at either end.

Because $P$ is maximal, no neighbour of $u$ lies outside $P$ (otherwise $P$ could be extended). And no neighbour of $u$ lies *inside* $P$ either: if some $s \in N(u)$ were adjacent to an interior vertex $v_i$, we could form a cycle through $s$, contradicting acyclicity. Both cases are illustrated below.

![Maximal path proof](/assets/essence/rec_maxpath.svg)

Therefore $\deg(u) = 1$, i.e. $u$ is a leaf. The same argument applies to $v$, giving at least two leaves. $\square$

## Conclusion

Recursion, dynamic programming, DFS, and most tree/linked-list problems are all induction over a state space. Internalising that framing makes it much easier to construct solutions systematically: identify the base case, decide what the recursive call should return, and build the answer from there.
