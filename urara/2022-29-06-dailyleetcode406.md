
---
title: Daily Leetcode 406 - 29/06/2022
author: Sai kumar Murali Krishnan
date: 2022-06-29
categories: [Leetcode,Daily]
tags: [daily-leetcode]
---

## Problem Summary

Today's problem is [406. Queue Reconstruction by Height.](https://leetcode.com/problems/queue-reconstruction-by-height/) For a list of people, we have their heights and need to construct the queue order. For `people[i] = [h_i,k_i]` we have `h_i` their height, and `k_i` is the number of people in front of this person who has a height greater than equal to `h_i`

## My thought process

One of the first things I noted was that the length of the array was `2000` which is very small, and could even permit a cubic solution, if it somehow arose. Additionally, I felt that sorting by decreasing height followed by increasing `k_i` value would lead somewhere. Post sorting, I would have `[[7, 0], [7, 1], [6, 1], [5, 0], [5, 2], [4, 4]]` as an example. I interpreted this as `7` at the start has `0` people tall than them, so insert at the front, the next one would be inserted one ahead and when we got to `6`, they'd have one person (`7`) ahead of them, so insert them at position `1`. We'd repeat this until we've reconstructed our array.

## The code 

```py
class Solution:
    def reconstructQueue(self, people: List[List[int]]) -> List[List[int]]:
        
        '''
        Sort by height first, largest first, then sort by how many are ahead 
        '''
        people.sort(key=lambda x:(-x[0],x[1]))
        print(people)
        output = []
        for x,y in people:
            output.insert(y,[x,y])
        return output
```

There are other solutions, of which some include a priority queue.

## Pitfalls, and where I stumbled

Typically, leetcode questions avoid use of the insert operation, so it took a while to think of using it, as it can be roughly linear in flops, yielding a quadratic solution. This is also a rather unusual question, and the sort of pattern has not appeared in anything else I've solved. I've also noticed that this question has the segment tree tag, a data structure I'm not familiar with.