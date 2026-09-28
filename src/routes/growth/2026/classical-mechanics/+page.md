---
title: 'Classical Mechanics'
created: 2026-01-02
updated: 2026-01-02
tags: [yggdrasil, Lagrangian, Hamiltonian, dynamics, physics]
growth:
  node_id: 'classical-mechanics'
  branch: 'physics'
  tier: 'roots'
  estimate_hours: 15
---

## Overview

The study of classical mechanics involves understanding the motion of bodies under the influence of forces. We assume no relativistic effects are at play and study simple systems using Newtonian, Lagrangian, and Hamiltonian frameworks.

## Learning Path

Progress through Taylor's *Classical Mechanics*.

## Resources


- [Classical Mechanics - John R. Taylor](https://www.amazon.com/Classical-Mechanics-John-R-Taylor/dp/189138922X)


## Newton's Laws of Motion

We first establish the Cartesian coordinate system with basis vectors $(e_1, e_2, e_3)$ and position vector $\mathbf{r} = x e_1 + y e_2 + z e_3$ which is written as $(x,y,z)$. We have all the standard vector operations for $\mathbb{R}^3$ such as dot product $\mathbf{a} \cdot \mathbf{b}$ and cross product $\mathbf{a} \times \mathbf{b}$.

For instance, consider a force $\mathbf{F}$ acting about the origin (like a stone). The torque $\mathbf{\Gamma} = r \times \mathbf{F}$ is defined as such.

We then have a vector valued function $\mathbf{r}(t) = (x(t), y(t), z(t))$ which can be differentiated and integrated with minimal issue. Most importantly, we note that $\mathbf{r}(t) = x(t) e_1 + y(t) e_2 + z(t) e_3$, and so when we differentiate wrt time $t$, each term is constant, and so you have three terms. This is special to the Cartesian coordinate system, and doesn't hold for the Polar Coordinate system.

## First and Second Law of Motion

The First Law of Motion states that an object with no forces acting on it will maintain constant velocity, i.e $\mathbf{F} = 0 \implies \frac{d^2 \mathbf{r}}{dt^2} = 0$.

And more generally, for an object with mass $m$ and force $\mathbf{F}$ acting on it, we have the Second Law of Motion:

$$
\mathbf{F} = m \frac{d^2 \mathbf{r}}{dt^2} = m \mathbf{a}
$$

Recalling that momentum is defined as $\mathbf{p} = m \mathbf{v}$, we also have that $\mathbf{F} = \frac{d \mathbf{p}}{dt}$.

## Inertial Frames 

Note that the laws of motion only hold in inertial frames of reference, which are frames that are either at rest or moving with constant velocity. The easiest example of a non-inertial frame is an object moving inside a train that is accelerating. In such a frame, fictitious forces (like the Coriolis force) may appear to act on objects.

## Third Law of Motion

For a pair of objects $A$ and $B$, the force exerted by $A$ on $B$ is equal in magnitude and opposite in direction to the force exerted by $B$ on $A$, i.e $F_{AB} = - F_{BA}$.


Now consider a system of two objects $A$ and $B$, we can write out their net forces as $F_A^{net} = F_{AB} + F_{A}^{ext}$ and $F_B^{net} = F_{BA} + F_{B}^{ext}$. Adding these two equations, we have:

$$
F_{A}^{net} + F_{B}^{net} = F_{A}^{ext} + F_{B}^{ext} = F_{ext}
$$

If $F_{ext} = 0$, then we have $F_{A}^{net} + F_{B}^{net} = 0$, which implies that the total momentum of the system is conserved. Interestingly enough, the third law doesn't even always hold up in classical mechanics, for instance, in electromagnetic interactions. Take two positive charges moving orthogonally to each other, the magnetic forces they exert on each other do not satisfy the third law by the Right Hand Rule.


## Polar Newton 

Recall $r^2 = x^2 + y^2$, $x = r \cos(\theta)$, $y = r \sin(\theta)$, and $\theta = \tan^{-1}(y/x)$. We have new unit vectors $\hat{r}$ and $\hat{\theta}$ defined as:  

$$
\hat{r} = \cos(\theta) e_1 + \sin(\theta) e_2, \quad \hat{\theta} = -\sin(\theta) e_1 + \cos(\theta) e_2
$$
This follows from $\hat{r} =r(cos(\theta), sin(\theta))/r$ and $\hat{\theta}$ being orthogonal to $\hat{r}$ in the counter-clockwise direction. Trivially, swapping components and adding a negative sign achieves this.

Now that we have basis vectors that are not simple, we need to take care in differentiating. For a force $\mathbf{F} = F_r \hat{r} + F_\theta \hat{\theta}$ we want to determine what this is written as. Take a stone rotating around the origin on a string, $F_r$ is the tension in the string and $F_{\theta}$ is any air resistant perpendiular to the string.

To compute $\ddot{\mathbf{r}}$ so we can equate to $F_r/m$, need to differentiate:

$$
\dot{\mathbf{r}} = \frac{d \mathbf{r}}{d \theta} \frac{d \theta}{d t} = \mathbf{\theta} \cdot \dot{\theta}
$$
Then similarly compute $\dot{\mathbf{\theta}} = - \mathbf{r} \dot{\theta}$. We can differentiate again to obtain the acceleration.


#### Example: Skateboard on a Half Pipe

Consider a Skateboard with mass $m$ on a half pipe of radius $R$. It's dropped from rest at an angle $\theta$ from the center of the half-pipe. As the radius is constant, we can simplify the acceleration formula by dropping out the $\ddot{r}$ terms yielding $F_r = - m R \dot{\theta}^2$ and $F_{\theta} = m R \ddot{\theta}$. The forces acting on the skateboard are $F_r =mg \cos(\theta) - N$ and $F_{\theta} = - mg \sin(\theta)$ where $N$ is the normal force from the half-pipe. Looking at the $\theta$ equation, we have:

$$
\ddot{\theta} = - \frac{g}{R} \sin(\theta)
$$

This is a nonlinear differential equation with no closed form solution. However, supposing that the skateboard is dropped near the center, we assume a small angle approximation $\sin(\theta) \approx \theta$, yielding $\ddot{\theta} = - \frac{g}{R} \theta$. This is a simple harmonic oscillator with solution Let $\omega = \sqrt{\frac{g}{R}}$, then we have:

$$
\theta(t) = \theta_0 \cos(\omega t)
$$
