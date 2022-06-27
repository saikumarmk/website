
---
title: Daily Leetcode 1689 - 27/06/2022
author: Sai kumar Murali Krishnan
date: 2022-06-27
categories: [Leetcode,Daily]
tags: [daily-leetcode]
---

## Problem Summary

Today's problem is [1689: Partitioning Into Minimum Number Of Deci-Binary Numbers.](https://leetcode.com/problems/partitioning-into-minimum-number-of-deci-binary-numbers/) Our goal is to write `n`, an integer as the minimum number of deci-binary numbbers, e.g `32 = 10+11+11`. There are multiple ways to write `32` as the sum of deci-binary numbers but we're looking at the smallest.

## My thought process

This one is tricky, but has a very short solution. I simply tabulated values, noticing that single digit numbers are their own answer. Then, if I took a number, say `17`, I'd need `1+1+1+1+1+1+11` which is `7` terms. Then, I looked at `39 = 11+11+11+(1+1+1+1+1+1)` which is `9` terms. There is a pattern of the result being the largest digit in `n`. The idea is that we're going to need `k` terms to build up that specific digit, and is the limiting factor.

## The code 

```py
class Solution:
    def minPartitions(self, n: str) -> int:
        
        '''
        for 0 <= n <= 9:
        return n
        
        12 -> 11 + 1
        
        13 -> 11 + 1 +1
        ..
        17 -> 11+ 1+...+1 (7)
        
        25 -> 10+10+1+1+1+1+1 -> 11 + 11 + 1 + 1 + 1
        
        We need k for the largest digit
        
        '''
        return int(max(n))
```

A rather short solution, but not obvious without a bit of writing.

## Pitfalls, and where I stumbled

It took a while to realise the pattern, and the independence of digits to the left/right of the largest digit. I also had considered a recursive solution but this is overkill, and would be too slow. There are similar such number related problems where you'll need to look for a pattern to simplify your logic to $O(n)$.