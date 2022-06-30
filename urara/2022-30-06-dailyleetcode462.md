
---
title: Daily Leetcode 462 - 30/06/2022
author: Sai kumar Murali Krishnan
date: 2022-06-30
categories: [Leetcode,Daily]
tags: [daily-leetcode]
---

## Problem Summary

Today's problem is [462. Minimum Moves to Equal Array Elements II.](https://leetcode.com/problems/minimum-moves-to-equal-array-elements-ii/) Our objective is to make all the array elements equal, given that we can increment/decrement an element by `1` in a single move.

## My thought process

I immediately thought to use the median of the list, as that would minimise the absolute distance to every other element. We could reframe this as finding $x$ such that $f(x) = \sum_{i=1}^N |x-A[i]|$ is minimised, which is a linear programming problem, when you convert the absolute values into a linear term. This is commonly known as the sum of absolute deviations, which can be derived via rudimentary calculus or intuition.

## The code 

```py
from statistics import median
class Solution:
    def minMoves2(self, nums: List[int]) -> int:
        '''
        Hypothesis 1: The median of the list
        '''
        med = int(median(nums))
        return sum(abs(num-med) for num in nums)
```

## Pitfalls, and where I stumbled

Typically, leetcode questions avoid use of the insert operation, so it took a while to think of using it, as it can be roughly linear in flops, yielding a quadratic solution. This is also a rather unusual question, and the sort of pattern has not appeared in anything else I've solved. I've also noticed that this question has the segment tree tag, a data structure I'm not familiar with.