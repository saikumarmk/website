---
title: "Essence of Associativity, Halving and Logarithmic Structures"
author: Sai Kumar Murali Krishnan
created: 2026-06-16
tags: [blog]
summary: "Exploiting associativity on binary operators to speed up operations"
---

# Musings on Sparse Tables and Associativity

While learning about sparse tables, I found something quite insightful; the ideas behind binary lifting, where we we compute jump pointers to the nth ancestor, we break it up as the n/2th ancestor of the n/2th ancestor for a node. i.e `ancestor(node, n) = ancestor(ancestor(node, n/2), n/2)`. We can go further but more importantly, why does this structure look familiar? 

If we think back to binary exponentiation, we can write $a^n = (a^{n/2}) * (a^{n/2})$ assuming $n$ is even, and then in general:

```python

def fast_exp(a, n):
    if n == 0:
        return 1 
    if n == 1:
        return a 
    else: 
        res = 1
        b = fast_exp(a, n//2)
        res *= b*b 
        if n % 2 == 1:
            res *= b 
        return res
```

Or in ocaml: 
```ocaml

let fast_exp base exp = 
    let rec fast_exp_aux acc b e =
    if e <= 0 then acc 
    else if e mod 2 = 0 then fast_exp_aux acc (b*b) (e/2)
    else fast_exp_aux (acc*b) (b*b) (e/2) 
    in fast_exp_aux 1 base exp
```

Notice that we quickly turn the problem into a logarithmic problem. This is actually a feature of associativity, believe it or not! In general, for a semigroup $S$ and binary operation $*: S \times S \to S$, when we write $a_1 * a_2 * \cdots * a_n$, associativity gives us that $a_1 *(a_2 * \cdots * a_n) = (a_1 * \cdots a_{n-1}) *a_n$. This is a signal that the order in which you evaluate doesn't matter, so be aggressive and split the domain in half! 


## The Sparse Table

That brings us to the humble Sparse Table. For problems where we are given an array $A$, queries $Q = \{ [L_i, R_i]\}_{i=1}^{i=L}$ and a binary operator $*$, where we can say that $A \subset S$ and $(S, *)$ forms a semigroup, we can speed up the computation of time here. I will use $f(A[L,R]) = a_L * \cdots * a_R$ as a form of notation here to basically mean applying our binary operator across the range.

Naively, you can just run that for each query, which would mean $Q$ queries that could be $O(N)$ steps, which means the time complexity here is $O(N*Q)$, on the assumption that $*$ is a constant time operation. Not amazing. We ask ourselves, what can easily be computed? And can we reuse these building blocks?

![Sparse Table Decomposition](/assets/essence/sparse_table.svg)
Yes you can. With powers of 2, we can break them up into smaller and smaller intervals. The diagram above tells us we have a natural relation:

$$
\text{memo}[k][i] = f(\text{memo}[k-1][i], \text{memo}[k-1][i+2^i])
$$
 
In english, this means we can compute the property of a $2^k$ length interval by splitting it up into two evenly split $2^{k-1}$ sized intervals. And in code:

```python
N = len(array)
K = ceil(math.log2(N))
memo = [[array[idx] if layer == 0 else 0 for idx in range(N)] for layer in range(K+1)]

for k in range(1, K): # O (log N )
    for idx in range(0, N): # O(N)
        if right := idx+int(2**(k-1)) < N:
            memo[k][idx] = f(memo[k-1][idx], memo[k-1][right])
```

In $O(N \log N)$ steps, which is great, but not quite there for some $n\in \mathbb{N}$ that isn't a power of $2$. We know that $n = \sum_{i \in I} 2^i$, that is we can read off it's binary representation to form a set of disjoint intervals that are powers of $2$ to get our result, which is $O(\log N)$. Recall that `(1 << i) & n` tells you whether the ith bit of `n` is on, so then we simply iterate over:

```python 
# Assume L is defined 
value = None 
query_len = R-L+1
for k in range(K):
    if (1 << k) & query_len: # bit hit 
        if value is None:
            value = memo[k][L]
        else:
            value = f(value, memo[k][L])
        L += int(2**k)


```

And thus, we have a really cool way of remembering how sparse tables work. To summarise:

- Compute intervals in powers of 2 in logarithmic time thanks to associativity
- Compute general interval lengths because of the binary representation 


Also, it turns out, binary lifting is really just a sparse table implementation, but on trees. The binary operation in this case, is function composition, e.g $f \circ f \circ \cdots \circ f = f^n = f^{n/2} \circ f^{n/2}$, because you're doing 'jumps'. Neat!
## Idempotency

Idempotency is the idea that for some operation $*$ we have that $x * x = x$, i.e there is no change to the operation if applied repeatedly. In real world systems, such as payment systems, idempotency is a good property to ensure you don't get double charged. It's because of idempotency, that we can go from $O(\log N)$ look-up to constant time look-up. In this case, we don't really mind if there's overlap in our intervals, so just pick the two intervals that tightly cover our desired query range $[L,R]$. More concretely, I claim that its given by this formula. 


Which operations are idempotent though?

- minimum, maximum 
- GCD, LCM 

There are probably more, but note that these operations all form a semigroup. If our function doesn't change under repeated application, this means we can reduce the time for a query to constant time, by picking $i = \lfloor{\log_2{R-L+1}} \rfloor$, then computing $f(\text{memo}[i][L], \text{memo}[i][R-2^i +1])$. We illustrate this with a diagram.


![Idempotency and Sparse Tables](/assets/essence/sparse_table_idem.svg)

Bringing us to $O(Q)$ query time, and $O(N \log N+Q)$ total time complexity.

## Prefix Sums 

It turns out when your operation has more structure, e.g an inverse (so you have a group structure), you can actually use an easier technique, prefix+suffix sums. Implicitly, you need the idea of being able to cancel/invert an operation. For range sum queries, it suffices to instead compute the prefix and suffix sums, so that when you want $\sum A[L,R]$, you can simply look at `sum(l,r) = prefix[R]-suffix[L-1]`.

## Problems 

There are less problems on Leetcode that cover this format, so we head to the more competitively aligned programming sites. In general, I find CodeChef questions extremely confusing to read, and preferred the problems from CSES.


## Reflections

Python sucks for type checking, as it really lets you do stupid things that won't raise an error, e.g indexing with a float (when raising to an exponent) won't be immediately caught. Aside from this, once I had the intuition of associativity, I was mostly able to code up the implementation of a sparse table then recall that you can use `(1 << i) & n` to see if the ith bit was set. I did run into some intuition issues where I was computing the wrong ranges, but a good diagram really helps here. Additionally, other sites TLE even though my solution is within complexity :( - it's easy enough to rewrite it in C++ fortunately as we don't rely on any magical Python data structures.

Also, did you know Excalidraw has libraries that you can import from? For instance I can import a System design library for icons that I would have otherwise crudely drawn, or for DSA!

I found a relevant [Codeforces](https://codeforces.com/blog/entry/79108) article that outlines the insight that I found as well, while also generalising the idea to any monoid. I did mention that you can do this with a semigroup, but a monoid with identity makes this a bit nicer because you don't need to deal with the weird empty edge case, and/or default initialise your values.


## What's next?

I want to learn about Fenwick trees and Segment trees, as they go further, and allow you to work with modifications to your data structure. I suspect that some properties of a monoid may help here. I found that the easiest way to think about learning how a sparse table works is through understanding the underlying algebraic requirements for it to work. It feels like a motivator for why category theory matters here, and why we even compute a sparse table to start within.


## Resources

- [cp-algorithms - Sparse Table](https://cp-algorithms.com/data_structures/sparse-table.html)
- [sesalt.sh - 1 DS|A a day - Sparse Table](https://seasalt.sh/words/dsa-sparse-tables)
