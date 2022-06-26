
---
title: Daily Leetcode 1423 - 6/26/2022
author: Sai kumar Murali Krishnan
date: 2022-06-26
categories: [Leetcode,Daily]
tags: [daily-leetcode]
---

## Problem Summary

This is a primarily self-imposed challenge to see how often I can post daily leetcode solutions. Today's problem is 1423: Maximum Points You Can Obtain from Cards. In essence, 
our goal is to pick `k` elements from the start or end and maximise said sum. So, we could take 2 elements from the left, and `k-2` elements from the right, or take `k` elements from the left, and none from the right.


## My thought process

This is reminiscent of the equilibrium point question, so we'll need to compute prefix and suffix sums. After this, I considered writing $k = 1+(k-1) = (k-1)+1 = 2+(k-2) = (k-2)+2 = \cdots$, which represent the number of elements we take from each side. Since computing prefix sums is $O(k)$, we then just need to iterate over the $k$ possible combinations of left and right, and determine their maximum. Easy prefix-sum question, but a good warmup exercise.

## The code 

```py
class Solution:
    def maxScore(self, cardPoints: List[int], k: int) -> int:
        '''
        Sliding window of prefix and suffix
        
        [P[1],P[2],..,P[k]]
        [S[1],S[2]...,S[k]]
        
        N :=  < 10^5 is input size
        k is the number 
        
        k = 1+(k-1) = (k-1) + 1
        k = 2 + (k-2) = (k-2) + 2 (this is what we can choose)
        '''
        N = len(cardPoints)
        
        if k == N:
            return sum(cardPoints)
        p_sum, s_sum = [0], [0]

        p_sum.extend(cardPoints[idx] for idx in range(k) )
        s_sum.extend(cardPoints[N-idx-1] for idx in range(k)) # n-1, n-2, ..., n-k-1
        
        for idx in range(1,k+1):
            p_sum[idx] += p_sum[idx-1] # Add previous to compute prefix sum
            s_sum[idx] += s_sum[idx-1] # add previous here as well

        max_points = 0
        
        for s in range(k+1):
            max_points = max(max_points, p_sum[s] + s_sum[k-s])
            max_points = max(max_points, s_sum[s] + p_sum[k-s])
        
        return max_points
```


## Pitfalls, and where I stumbled

Conceptually, prefix-suffix questions tend to confuse me when it comes to indexing, as I usually go for the wrong end of the suffix sum array. I've found the best way to combat this is to just stick to one format for computing and indexing said sums. I also made a few braindead mistakes and took the maximum of prefix and suffix instead of adding them, which can be chalked up to being braindead.