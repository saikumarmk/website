---
title: "A Brief, Mathematical Explanation of Big O"
author: Sai kumar Murali Krishnan
created: 2024-05-31
categories: [Computer Science]
tags: [technical]
---

Big O is commonly used in the context of computer science, specifically about the time complexity of algorithms. You'll often hear things such as "Binary search is $O(\log(n))$", or "O(n) means linear time", though I often find that students have a poor understanding of what Big O is. 


### What is Big O, mathematically?

Big O is a mathematical notation which describes the behaviour of a function ($f:\mathbb{R}\to\mathbb{R}$) as the function argument tends towards infinity. You can also look at the behaviour as the argument approaches some value but we'll ignore that. In particular, it describes the growth of a function as it tends towards $\infty$. 

For real-valued functions $f$ and $g$, we write $f(x) = O(g(x))$ or $f \in O(g)$ (which is more correct, but CS students are more used to the former), that is, $f$ is big O of $g$. For $f(x)\in O(g(x))$, that means there exists $M > 0$ and $x_0 \in \mathbb{R}$ such that $|f(x)| \leq M g(x)$, for all $x \geq x_0$. Intuitively, it means $g$ eventually bounds $f$, ignoring constant multiples, or smaller terms that get dominated.

As an example, $2n^2+n \in O(n^2)$ because $n < n^2$ for $n>1$, so $2n^2+n< 2n^2+n^2 = 3n^2$, and thus for all $n \geq 1$, $2n^2+n \leq 3n^2$. In the field of mathematics, Big O notation is used in Taylor series, to describe terms that grow at a certain rate but are mostly irrelevant, or encode an "error" term. However, if we go off the definition from prior, we also find that $\log n \in O(n^2)$, despite logarithms not looking very quadratic. A better way to informally think about big O in particular is if $f\in O(g)$, that means the growth rate of $f$ is bounded above by $g$.


### The RAM model of Computation

Now we build up to Big O in computer science. For a given algorithm, we want a way to measure the number of steps taken to execute the algorithm, with respect to some input size. We're not interested in language-specific features, so we look to the Random Access Machine (RAM), an abstract model that we use to count the number of steps executed in an algorithm. We assume the following:

- Operations such as arithmetic and comparison on integers, assignment, memory access, and function calling takes up one step
- A loop is built off a variable number of simple operations. So iterating over $10$ objects would consist of $10$ simple operations.

With the RAM model, we can now perform time complexity analysis. That is, we look at the inputs to a function that could cause the number of execution steps to increase. Consider the function below with integer input `n`:

```
function f(n):
 sum = 0  # 1 operation
 for i=1 to i=n do:
    for j=1 to j=n do:
        for k=1 to k=n do:
            sum = sum+i+j+k # This is 5 operations 
 return sum
```

Let $T(n)$ be the number of steps it takes for $f$ to run on an input $n$. The innermost operation is nested, so we use summations to tabulate the number of steps it takes. Then:

$$T(n) = 1+ \sum_{i=1}^n\sum_{j=1}^n\sum_{k=1}^n 3= 1+5 n^3 \in O(n^3)$$

We say that the time complexity of the algorithm $f$ is $O(n^3)$. We use Big O because we're not currently concerned with the constants, or smaller terms (though you shouldn't just disregard them). If you wanted to examine the space complexity of an algorithm, you would carry out a similar process, except you would count points where new memory is allocated. As an immediate result, you shouldn't be able to have a space complexity that's larger than your time complexity.

### Recursive Functions

In the case that your function is recursive, it becomes a bit more intuitive to reason about the time complexity of your function. Consider the famous factorial function, defined as:

```
function factorial(n):
 if n > 0:
    return n*factorial(n-1)
 else:
    return 1
```

Suppose $T(n)$ is our time complexity function for `factorial`, where `n` is the input. If we're counting the number of steps it takes for `factorial(n)`, we'd need to know how many steps it takes `factorial(n-1)` to execute. We do one comparison operation, so we can say that $T(n) = T(n-1)+1$. Remember that $T(n-1)$ is the time complexity function for `factorial(n-1)`. We could keep doing this until we hit the base case, corresponding to $T(0)=1$ since we're doing one operation (returning an integer). Now, all we need is a way to solve this relation.


### Solving recurrence relations via Telescoping

From what I've seen, telescoping is a skill that seems seldom taught. If you want to figure out what a closed-form solution to the recurrence relation underpins the time complexity of your function, you could always throw it into a CAS such as Wolfram Alpha, or you could telescope the relation. The idea behind telescoping is to progressively write out the nth term of a relation in terms of more and more terms till you can discern a pattern. 

Let's revisit our factorial example. We had the information $T(n)=T(n-1)+1$ and $T(1)=1$ which we use to construct the relation:

$$
T(n) =
\begin{cases} 
T(n-1) + 1 & \text{if } n > 0 \\
1 & \text{if } n = 0
\end{cases}
$$

So, we know that $T(n)=T(n-1)+1$, but we also know that T$(n-1)=T(n-2)+1$. Substituting for $T(n-1)$ gives us:

$$
T(n) =T(n-2)+2
$$

We can keep going back, but it becomes clear that we can write $T(n)=T(n-k)+k$. We want to go all the way backwards till we hit the base case, where $n=k$. Putting this into our relation gives $T(n)=T(0)+n = n+1$. This makes sense to us since it takes $n+1$ multiplications to get to $n!$. 


Telescoping won't solve every recurrence you have. As an exercise, try to find the complexity of the recursive Fibonacci function. Sketch a diagram of the call-tree, and reason about how many operations you may end up with.


### Examples

Let's attempt to determine the time complexity of some functions.

```
function binary_search(container, start, end, target):
 if start <= end:
    middle = floor((start+end)/2)
    if container[middle] == target:
        return middle
    if container[middle] > target:
        return binary_search(container, start, middle)
    if container[middle] < target:
        return binary_search(container, middle,end)
 else:
    return -1         
```

Let $T(n)$ be the number of steps it takes for `binary_search` to execute where $n$ is the length of the container (assume it's an array). For a list of size $n$, binary search reduces the problem to binary searching a list of size $n/2$, with a few operations for comparison. That means we can write $T(n)$ as a recurrence relation:

$$
T(n) =
\begin{cases} 
T\left(\frac{n}{2}\right) + a & \text{if } n > 1 \\
c & \text{if } n = 1
\end{cases}
$$


From here, you may use the Master theorem (if you remember it), or telescope the recurrence relation to solve it:

$$
T(n)=T(n/2)+O(1) =(T(n/4)+a)+a = ((T(n/8)+a)+a)+a = \cdots \\

T(n) = T(n/2^k)+ak
$$

We hit the base case when $n/2^k =1 \iff n=2^k$ which yields $k = \log_2 n$. Substituting this back in gives us $T(n) = T(1) + a \log_2 n  = c + a\log_2 n$. That is, $T(n) \in O(\log n)$. Note that the base is irrelevant here due to the change in the base formula.


```
function g(n):
 for i=1 to i=n do:
    for j=1 to j=n/i do:
        mystery(n) # Assume this function takes n steps to execute

```

We now have an algorithm $g$ which calls a mystery function `mystery`. You're told that it takes `n` steps to execute `mystery(n)`. So it's time to figure out the time complexity $T(n)$ for $g$. We write out the following summation:

$$
T(n)=\sum_{i=1}^n \sum_{j=1}^{n/i} n
$$

You can pull out the $n$, since it's not a summation variable, leaving us with:

$$
T(n) =n \cdot \sum_{i=1}^n \sum_{j=1}^{n/i} 1 = n \cdot \sum_{i=1}^n n/i = n^2 \cdot \sum_{i=1} 1/i
$$

The summation on the right is the sum of the first $n$ terms of the Harmonic series. A pretty niche approximation is $\sum_{i=1}^n 1/i \approx \ln n$. We may substitute this *approximation* to get $T(n)\approx n^2 \ln n \in O(n^2 \ln n)$.




## Other Asymptotics

There are other asymptotic terms for describing the limiting behaviour of a function. These terms appear in computer science in a range of forms, though they'll more commonly appear in mathematics. I add this section because VCE Algorithmics does a horrifying job of relating the various notations to the concepts of 'best-case', 'average-case', or 'worst-case' time complexity. They are completely separate concepts, but we can use *any* of the notations mentioned here to describe what the time complexity is like.

### Theta

We may tighten the idea of big Oh by also bounding it from below. We introduce $\Theta$. For $f(x)\in\Theta(g(x))$, that means there exists $M_1 > M_2 > 0$ and $x_0 \in \mathbb{R}$ such that $M_1 g(x) \leq |f(x)| \leq M_2 g(x)$, for all $x \geq x_0$. So, while $n^2 = O(n^3)$, $n^2 \neq \Theta(n^3)$. You may commonly see this used as a more precise descriptor for the time complexity of an algorithm, since it pins down the lower bound as well, preventing people from asking whether $\log n \in O(n)$, because while the intent may have been to say that the function is roughly linear, you could also say that the function could be sub-linear.

### Omega

Big Omega has two definitions that vary slightly, but we'll be using the definition that indicates an asymptotic lower bound.  For $f(x)\in\Omega(g(x))$, that means there exists $M 0$ and $x_0 \in \mathbb{R}$ such that $|f(x)| > M g(x)$, for all $x \geq x_0$. For example, $\sqrt{n} \in \Omega(\log n)$, because the square root function asymptotically grows faster than $\log n$. Additionally, comparison-based sorting algorithms take $\Omega(n \log n)$ steps to execute (no optimisations) due to how many comparisons you need to compare a whole list. A sketch of the proof would involve drawing out the tree of comparisons and reasoning about what a lower-bound on the number of comparisons would be.

### Little Oh

Little Oh is a stronger variant of Big Oh. For $f(x)\in o(g(x))$, that means there exists $M > 0$ and $x_0 \in \mathbb{R}$ such that $|f(x)| < M g(x)$, for all $x \geq x_0$. This means that while $n^2 = O(n^2)$, $n^2 \neq o(n^2)$, though $n \log n = o(n^2)$. If $f \in o(g)$, we say that $f$ is dominated by $g$ asymptotically. You may find this symbol in number theory, or other areas of maths. 

### The Master Theorem

For an algorithm whose time complexity $T(n)$ can be expressed in the form $T(n) = a T\left(\frac{n}{b}\right) + f(n)$ (constants $a,b$, function $f$), we can use the Master theorem to determine an asymptotically tight ($\Theta$ notation) bound for $T(n)$. Suppose $f \in \Theta(n^d)$ where $d$ is a constant, then:

$$
T(n) \in \begin{cases} 
\Theta \left( n^d \right) & a < b^d \\
\Theta \left( n^d \log n \right) & a = b^d \\
\Theta \left( n^{\log_b a} \right) & a > b^d
\end{cases}
$$

As an exercise, prove the Master Theorem using the telescoping method shown earlier.

## Conclusion

This was primarily written to test the MathJax on my site since it was annoying to set up. However, I wanted to write up a brief explanation as a reference article since I'm lazy and prefer to point to things rather than repeat myself. It is important to have a strong understanding of complexity analysis, to the point where it becomes subconscious when you write code. As usual, resources are below:

- [Big O Cheatsheet](https://www.bigocheatsheet.com/)
- [Exercises on Big O](https://www.cs.auckland.ac.nz/courses/compsci220s1t/lectures/lecturenotes/GG-lectures/220exercises1.pdf)