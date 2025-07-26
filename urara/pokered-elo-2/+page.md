---
title: More Pokemon Red Elo World
author: Sai Kumar Murali Krishnan
created: 2025-07-14 
categories: [assembly, pokemon, simulation]
tags: [pokemon, simulation]
summary: "An explanation on Elo"
---

<script>
import PythonCode from '$lib/components/prose/code.svelte'
</script>

So, I decided to revisit my Pokemon Red Elo estimation work, and decided to write this article up as a test for some of my new rendering capabilities. This article will primarily go over deriving Elo.


## Deriving Elo

Elo ratings are typically used in tournaments between players/teams, such as chess. It's well known that
if a player with a lower Elo defeats a player with a higher Elo, the increase/decrease for the player is larger than
say if they were comparable in 'skill'. The Elo rating is a measure of that skill. Let's derive it. Suppose we have a ratings vector $\theta = (R_1, R_2, ..., R_n)$, then our goal is to learn this vector. 


$P_1$ and $P_2$ battle with ratings $R_1$ and $R_2$. Then we define the Elo update for $P_1$ and $P_2$ as:

$$R_1' := R_1 + \alpha (\text{Outcome}(P_1,P_2)- \mathbb{P}(P_1\succ P_2)))$$

$$R_2' := R_2 + \alpha (\text{Outcome}(P_2,P_1)- \mathbb{P}(P_2\succ P_1)))$$

- Here $A \succ B$ means A dominates (beats) B
- Where $\text{Outcome}(P_1,P_2)=1$ if $P_1$, and $0$ if $P_2$ wins.
- $\alpha$ is the scale factor, or how impactful a loss is.

Note if it's a tie, then it's considered both a loss and win for simplicity. If $P_1$ was an underdog, say Youngster Joey, taking on E4 Agatha, then the probability of him beating her would be much
lower, and thus his Elo would go up quite a bit. On the other hand, it would be expected of Agatha to beat Joey, so the Elo increment is miniscule in comparison.

But what is $\mathbb{P}(P_1\succ P_2)$? We want the odds of $P_1$ beating $P_2$ to be a function of $R_1$ and $R_2$, that is there is some $f$ such that:

$$
\frac{\mathbb{P}(P_1\succ P_2)}{\mathbb{P}(P_2 \succ P_1)} = \frac{f(R_1)}{f(R_2)} = O_{P_1, P_2}
$$

And that $\mathbb{P}(P_1\succ P_2) + \mathbb{P}(P_2 \succ P_1) = 1$. We can disregard ties for the moment since they're not a substantial issue here.

Because the probabilities add to $1$, we have $O_{P_1, P_2} + 1 = \frac{1}{\mathbb{P}(P_2 \succ P_1)}$ yielding:

$$
\frac{O_{P_1, P_2}}{O_{P_1, P_2}+1} = \mathbb{P}(P_1\succ P_2) = \frac{f(R_1)}{f(R_1)+f(R_2)}
$$

Now, what function reasonably satisfies this? The simplest answer is an exponential of the form $f:(R) = \exp(k R)$, which when substituted yields:

$$
\mathbb{P}(P_1\succ P_2) = \frac{1}{1+\exp(-k(R_1-R_2))}  \tag{1}
$$

The choice of base and $k$ determines how much a win means at a certain odds ratio, and aren't really too important. This is essentially a sigmoid $\sigma$ as well. Now, let's say we have our data from the tournament, which could look something like the following:


```
win, trainer_1, trainer_2
1, AGATHA, YOUNGSTER
0, GREEN1, LANCE
...
```

Here, `trainer_1` is the defender and `trainer_2` is the contender, meaning that the `win` is whether the defender won or not. But this data sounds like it would come from something that's like a Bernoulli distribution! It so happens
that this formulation is a GLM with the [Logit link](https://en.wikipedia.org/wiki/Generalized_linear_model), which is what we commonly call the Logistic Regression. So, our data $\mathcal{D} = \{(x^{(i)}, y^{(i)})\}$ consists of:

- $y^{(i)} \in \{0,1\}$
- $x^{(i)}_{k,j} \in \mathbb{R}^{391}$, where the the vector is $0$ except for $1$ in the kth entry and $-1$ in the jth entry

Well, we know from equation $(1)$, what a good way of modelling the probability is. Via the PDF for the Bernoulli distribution, the probability of battle $x^{(i)}$ resulting in outcome $y_i$ is:

$$
\mathbb{P}(y^{(i)}=y_i | x^{(i)}; \theta) = \sigma(\theta^T x^{(i)})^{y^{(i)}} (1-\sigma(\theta^T x^{(i)}))^{1-y^{(i)}} \tag{Likelihood of a datapoint}
$$

Recalling that $\theta^T x^{(i)} = R_k - R_j$. How do we determine $\theta$? This is a classic Logistic problem, with $\mathcal{L}(\mathcal{D},\theta) = \prod_{i=1}^N \mathbb{P}(y=y^{(i)} | x^{(i)}; \theta)$, which we want to maximise, or alternatively minimise $\mathcal{J}(\theta) = - \log \mathcal{L}(\mathcal{D},\theta)$.

$$
\begin{align*}
\mathcal{J}(\theta) &= -\sum_{i=1}^N \left(\log \left( \sigma(\theta^T x^{(i)})^{y^{(i)}} (1-\sigma(\theta^T x^{(i)}))^{1-y^{(i)}}\right) \right)  \\
 &=-\sum_{i=1}^N \left( y^{(i)} \log \sigma(w^T x^{(i)} ) + (1-y^{(i)}) \log (1 - \sigma(w^T x^{(i)}))  \right)
\end{align*}
$$

To compute $\nabla \mathcal{J}(\theta)$, we note that $\partial_{\theta} (\sigma(\theta^T x)) = \sigma(x)(1-\sigma(x)) x^T$ via the chain rule and find that:

$$
\nabla \mathcal{J}(\theta) = -\sum_{i=1}^N \left(\sigma(w^T x^{(i)}) - y^{(i)} \right) x^{(i)} \tag{Gradient of NLL}
$$

There's no closed form solution for this, due to $y_i$, so we have to rely on Gradient Descent and company to approximate our rankings. The most basic update that you'd know is that $\theta_{i+1} = \theta_{i} - \eta \nabla \mathcal{J}(\theta_i)$, where $\eta$ is the learning rate. Since our problem is reasonably small, we don't really need to worry about providing a mini-batch of $k$ terms as our gradient. Though I will add that you can do an 'online' update where new matches provide gradient updates, and slowly update our rankings if needed, which is a cool connection. We could also contextualise momentum (e.g Adam) as smoothing our gradient from previous gradients as well.

Let's look through the annotated code now!

<PythonCode sourceUrl="/annotations/elo_calculator.py" title=""/>


