---
title: "Building a Circles Clone for Monash"
author: Sai Kumar Murali Krishnan
created: 2024-10-09 
categories: [University, Graphs]
tags: [university, graph]
---


I've previously written on Circles, an amazing, student-built course planner maintained by DevSoc, a society that used to be a branch of CSESoc. Monash has its course planner, named [MonPlan](https://monplan.apps.monash.edu/) which was formerly student-led by people such as Eric Jiang. Unlike UNSW, however, the project came into the hands of Monash Esolutions, which meant that development would then be relegated to Monash. While MonPlan is a great base for developing a Circles clone, it has not seen any development in a while, primarily due to internal politics.

During my time at Monash, I took several swings at looking for a consistent method of retrieving unit requisites, with my most successful attempt with a microservice that MonPlan uses giving rise to the Monash Graph available on my site. I also learned about how Circles was developed from some DevSoc directors who also interned at Canva with me, along with some other online friends. Since I've developed a reliable way to scrape and format the requisites for a unit reliably, I believe that the Monash student community has the potential to develop resources that are similar to Circles. This way, the resources are more relevant to students as it's developed by students, and can be passed down.

I also think Monash is in a slightly better position than other universities because we have an exposed microservice that gives (mostly) correct requisites.

## An Upgraded Handbook

I rewrote my handbook scraper in Go, which retrieves the units, courses, and areas of study (aos) from the Monash handbook. I've only made use of the units to draw the unit graph on my site, but we can also format the courses and areas of study. The immediate implication is that we can use this for course auto-planning, along with verifying the completion of a course map.

An immediate enhancement I can see is a better handbook, baked into the course planner like Circles does [here](https://circles.csesoc.app/course-selector). This could factor in your selected course and aos and allow for smart selection. Some easy wins:

- Developing an enhanced handbook experience 
- Tells you what units you unlock by undertaking a unit (an indirect recommendation system)
- An explicit recommendation system (using the former, and your other units)
- The explicit cost of units, pulled from the SCA band and an up-to-date cost calculator
- Gives you proper, strictly formatted requisites for a unit that are easier to interpret 
    - Think, of a DAG representing the units required to unlock a unit

These features fall out from the requisite data we already possess.


## The Monash Unit Graph

The Monash Unit Graph on my site is a fun experience but doesn't provide much use to students who want to interpret the data. I wanted to replicate the [original Circles](https://circles360.github.io/#/3778/COMPA1/FINSA2) with their click-to-complete graph view, though I ended up adding a build mode that visualises units as a DAG. 

Some things I think can be done:

- Using a DAG as a base to create more detailed progression diagrams that can be used in guides
- A click-to-add view which stores the selection data from the other modes for visualisation purposes


## Other features

Some more features off the top of my head:

- Auto-planning with operations research (basically 2SAT the problem) similar to how [Circles does it](https://devsoc.atlassian.net/wiki/spaces/C/pages/754356/Auto-Planning)
    - This requires representing the requisites as an AST, which is how they unlock new units when you add units
- The semester planner; I don't think this is a big priority since MonPlan does a good job at this
- An API for querying; this is just a natural consequence of hosting stuff on a site and having an API from which to request resources. 


Additionally, incorporating SETU data into the previously mentioned software. The data can be exported and then mined for the user ratings for each unit. Visualising the data gives you a way to compare units with the different learning outcomes.