---
title: Mathematica and the potential gaming of VCE
author: Sai kumar Murali Krishnan
date: 2021-01-08 
categories: [Wolfram Mathematica]
tags: [vce,mathematica]
---



## Background

Following my high school graduation, Marty Ross and I had worked on an article discussing the application of Mathematica in the context of high school mathematics and how programming can subvert mathematics testing. After a relentless flurry of corrections, addendums, errata and other edits, the paper was finally published to the Vinculum, a mathematics journal targeted at secondary school maths education. You may find it in volume 57, issue 3. Marty's blog can be found over at [https://mathematicalcrap.com/](https://mathematicalcrap.com/).

## Introduction

Last year I completed VCE, including Mathematical Methods (CBE) and Specialist Mathematics. At my school, these subjects employed the computer system Mathematica in place of handheld CAS calculators. The CBE (Computer-Based Examination) version of Methods also entailed the direct submission of SACs and the second (tech-active) exam on the Mathematica platform.[^1]

Mathematica is extraordinarily powerful and, as it happens, I consider myself a decent programmer. During VCE, I entertained myself by creating custom functions to automate tedious computations, which I then shared with my fellow students. We were able to store these functions in a paclet (package), ready for use on the SACs and the exam. While handheld CAS calculators can also store (less complex) custom-made functions, Mathematica's vast in-built library and ease of use moves it into a different class. Mathematica enables the creation of exam-ready functions to perform any computation a student might require.

I have witnessed, and experienced, many problems with the implementation of Mathematica, but in this article I will focus upon the two most glaring and most important issues. First and foremost, Mathematica is so powerful that it can trivialise the testing of the mathematics for which it is purported to be a tool. It enables any student who can program in Mathematica or, more perversely, who has a friend, teacher or tutor who can program in Mathematica, to perform well in VCE mathematics. Secondly, and as an inevitable consequence of this trivialisation, the current partial implementation of Mathematica could create a grossly unfair competition, an unfairness enhanced in Methods CBE by effectively permitting Mathematica code to be submitted as an answer. The students equipped with handheld CAS calculators are the victims. Armed with toys sporting 70s Nintendo displays, they are being outgunned by students deploying full-screen guided missiles.

In this article I will illustrate how Mathematica can trivialise exam questions in Mathematical Methods. In Part 2, I provide an example of the use of Mathematica's in-built functions. In Part 3, I consider the application of custom-built functions. In Part 4, I summarise, and I indicate why I believe the problems with the implementation of Mathematica are only likely to worsen.

## In-built functions

We begin by looking at Question 5, Section B of 2019 Exam 2, which concerns the cubic $f(x) =1-x^3$.

![](https://mathematicalcrap.com/wp-content/uploads/2020/07/CubicArea.bmp)

The question first prompts us to find the tangent at *x* = *a*, which we perform in one step with the function **TangentLine**.[^2] We then find the intersection points *Q* and *P* with two applications of the function **Solve**. Next, the area of the shaded region as a function of *a* is found by subtracting the area under the cubic from a triangular area: the former is found using the function **Integrate**, and the latter is found directly from the coordinates using the functions **Polygon** and **Area**. Finally, we are required to find the value of *a* that minimises the area, which is found in one step with the function **ArgMin**.

What follows is the complete Mathematica code to answer this five-part question:

![](https://mathematicalcrap.com/wp-content/uploads/2020/07/Cubic.bmp)

This solution requires little mathematical understanding beyond being able to make sense of the questions. In particular, the standard CAS approach of setting up integrals and differentiating is entirely circumvented, as is the transcription. In Methods CBE, the above input and output would be considered sufficient answers.

## Created functions

We'll now venture into the world of custom Mathematica functions, where programmers can really go to town. We'll first look at the topic of functions and the features of their graphs. Mathematica does not have a built-in function to give all the desired features, so I created the function **DetailPlot**. To begin, I use a module to gather data about a function, including endpoints, axial intercepts, stationary points, inflection points and, if required, asymptotes. I then turn the module into an image to place over the graph.

Let's fire this new weapon at Q2(c), Section B of 2016 Exam 2, which concerns the pictured quartic. We are given the equation of the graph and the point *A*, and we are told that the tangents at *A* and *D* are parallel. We are then required to find the point *D* and the length of *AE*.

![](https://mathematicalcrap.com/wp-content/uploads/2020/07/TangentDetailPlot.bmp)

And, here we are:

![](https://mathematicalcrap.com/wp-content/uploads/2020/07/DetailPlot2.bmp)

![](https://mathematicalcrap.com/wp-content/uploads/2020/07/DetailPlot.bmp)

With very little input, **DetailPlot** has provided a rich graph, with every feature one might require within easy reach. The intersection points are 'callouts', which means that the points are labelled with their coordinates. In particular the coordinates of *D* and *E* have been revealed by **DetailPlot**, without any explicit calculation. We can then press forward and finish by finding the length of *AE*, a trivial calculation with the in-built function **EuclideanDistance**.

In the next example I demonstrate that a multi-stage question can still be trivialised by a single piece of pre-arranged code. In the multiple choice question MCQ10 from 2017 Exam 2, the function $f(x) = 3\sin(2[x+\frac{\pi}{4}])$ undergoes the transformation $\boldsymbol{T\left(\Big[\begin{smallmatrix}x \\ y\end{smallmatrix}\Big]\right) = \Big[\begin{smallmatrix}2 & 0 \\ 0&\frac13\end{smallmatrix}\Big]\Big[\begin{smallmatrix}x \\ y\end{smallmatrix}\Big]}$ and we are required to identify the resulting function. For such questions I created the function **Transform**, and then the in-built function **FullSimplify** polishes off the question:

![](https://mathematicalcrap.com/wp-content/uploads/2020/07/Transform.bmp)

My last example is on functional equations, for which I created two functions, **FTest** and **RFTest**. I will illustrate the use of the latter function. For MCQ11 on 2016 Exam 2, the equation *f*(*x*) -- *f*(*y*) = (*y* -- *x*) *f*(*xy*) is given and it is required to determine which of the given functions satisfies the equation. Here is my entire solution:

![](https://mathematicalcrap.com/wp-content/uploads/2020/07/RFTest.bmp)

## Conclusion

It is impossible to have a proper sense of the power of Mathematica unless one is a programmer familiar with the package. This article presents just a few examples from the vast library of functions I created for Mathematical Methods and I found even more so for Specialist Mathematics. My libraries for both subjects barely scratch the surface of what is possible.

Creating such packages requires skill in both programming and mathematics, but the salient point is that any subsequent application of those programs by another student requires no comparable skill. The programs I have written may improve the performance of mathematically weaker students. Conversely, any student without access to such programs or, worse, is required to use handheld CAS instead of Mathematica, will be at a significant disadvantage.

This demonstrates the potential power of Mathematica to change the focus of VCE mathematics and, consequently, to debase its teaching and its assessment. True, the same issues had already arisen with the introduction of handheld CAS; clever teachers and cleverer students have always engaged in creating and sharing push-a-button CAS programs. Mathematica, however, has massively elevated the seriousness of these issues, all the more so since only a fraction of students have access to the platform.[^3]

Technology, including Mathematica, calculators, spreadsheets and the many online programs, have tremendous potential to assist students with learning, understanding and applying mathematics. What is important for educators is to be careful that students are not using this technology to bypass learning and understanding mathematics.

[^1]\. All non-CBE students take the same tech-active exams and are considered in the same cohort for ATAR purposes. The Methods (CBE) exam appears to differ in only a superficial manner, and it appears that CBE students have not been considered a separate cohort since 2016.

[^2]\. The examination diagrams have been redrawn for greater clarity.

[^3]\. Although the Victorian Government offers Mathematica to all schools, to date many schools have not implemented it.