---
title: The story of SETool
author: Sai kumar Murali Krishnan
date: 2021-01-08 
categories: [Python,Dash,Data visualisation]
tags: [Python,Dash, Data visualisation]
---

# The story of SETool

### Introduction

During the second semester of 2020, I undertook MTH2051 - Introduction to Computational Mathematics. The details of the unit are irrelevant, it is an introductory course on designing algorithms for numerical methods. I mention this unit because it had an unfortunate form of assessment; quizzes with negative marking. The final exam consisted of 20 multiple choice questions, each of which had a negative marking attached to them. Long story short: people were upset with the immutability and unfairness of the exam, attempted to complain, and a lot of bureaucratic action that amounted to nothing.

The anger over the inaction raised attention to the SETU, a set of statistics published for each unit and is the collation of student reviews of the unit, namely satisfaction, and forms of assessment, just to name a few. While MTH2051/3051 received scores that reflected the form of assessment and student dissatisfaction, students were outraged at the lack of visibility concerning the SETU data, which were found in obscure locations, accessible, but hard to find. A student had the idea to scrape SETU data and perform some exploratory data analysis, such as grouping units by their school and determining the aggregated scores. At the time, I was experimenting with data visualisation, particularly with the Dash library, which created web dashboards in Python that could be deployed to the internet. Naturally, as most of the software I had written was designed for the general public, I decided it would be incredibly valuable for the Monash community to have easier access to SETU data, and in a more convenient format.

### Designing a web app with Dash

The actual data scraped ranged over nearly all units offered at Monash University, along with SETU completion, the number of people doing the unit, 8-13 learning outcomes, each ranked from 1 to 5, and other less important data points. My first attempt at a dashboard was a simple radar chart, seen below.

![SETool v1. It's not very pretty...](the-story-of-setool/setool_v1.png)

While a radar chart gives you a generous idea of the performance of a unit, it can’t be easily compared to another unit, and it gives off the feeling of taking up too much space (which, it certainly does!). At this point, I received a recommendation to use a data table with shaded entries, visualising the score, with red being worse, and green being better. So, back to the drawing board, it was. Until I stumbled across the DataTable, an interactive and insanely customisable component that could colour in my cells. The conditional filtering was coded across the colour range of 2 to 5 and works surprisingly fast. All the other details such as unit name, code, invited and responded numbers didn’t require any modifications and I was done with my dashboard. Well, not really, I ended up adding a comparison table where you could drill down units and compare them against each other.

![SETool v2's comparison bar. Much better!](the-story-of-setool/setool_v2.png)

### On Dash

Regarding Dash itself, the library is intuitive when being used, they have plenty of examples in their gallery and their documentation is fleshed out. One idea I could not (easily) bring to fruition was turning the site into a static one, mainly because this would require the use of WebAssembly, namely through Pyodide, which to my knowledge does not support Dash in complete capacity, however, there exists an alpha version for which an extremely limited handful of Dash components work here: [https://github.com/ibdafna/webdash](https://github.com/ibdafna/webdash). Nonetheless, Dash is a great library and has forced me to learn about deployment solutions, namely Heroku for hosting my site.

### Deployment to Heroku

Heroku is a platform as a service (PaaS), meaning they’ll host your applications… for a fee, at least if it's active enough. It’s free for 450 hours a month of usage, but you have to pay for SSL, something I disagree with because TLS encryption shouldn’t be paywalled, as things, like Let’s Encrypt, exists. Anyway, it’s a decent platform for beginners and is a good introduction to deployment. I did struggle with deploying to Heroku, for a range of beginner-related issues, which I’ll write up on, but getting into Heroku sooner than later is a really good idea.

### Changes, and Reception

Throughout the two years I’ve been working on SETool, I’ve continuously thought about rewriting the code in R and implementing a dashboard that can be turned into a static site, or using `d3.js` and rewriting it to be a front-end project. Overall, people find it very intuitive to use, and I’ve recorded over 1000 unique user visits, which is pretty amazing.