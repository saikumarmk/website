---
title: "The Grad/Intern Playbook: Part 3 - Acing the Interviews"
author: Sai kumar Murali Krishnan
created: 2024-03-18
categories: [University, Career]
tags: [university, career, playbook]
---



## Introduction

This is the fourth article in my series. So, you've got through the resume screen, and now are facing a barrage of interviews and assessments. How do you best prepare for these interviews? How many interviews are there? What sort of interviews are there? I'll go over each of the interview formats that I've seen in technical roles. While the term assessment can refer to a task that you need to complete to assess your candidacy, it also refers to interview items. I use the term assessment to refer to non-interview assessments and will split this article into assessments/interviews.


### The Objective of Interviews

When it comes to recruitment, the goal is largely based on avoiding a bad hire, whether due to a lack of skills, culture fit, or any other reason. As a university student, you have little to show for yourself in terms of professional experience, which usually raises the bar for the types of assessments you'll face, in an attempt to differentiate you. Whether this is fair or not is a separate debate that isn't usually worth having, since countless other people are willing to go through the process that you may think is unfair, or not representative.


Not all companies recruit with the same objectives either, some companies look for talent, or people who understand the business in hopes of training them, whereas other companies look for technical talent that they can further train. In short, a company often looks to cull the worst $N$ applicants, rather than hire the best applicants, as evidenced by the numerous interviews. 

### What sort of rounds are there?

While I called this article "Acing the Interviews", I'm also talking about pre-screen assessments, such as coding tests, psychometric testing, and other weird assessments. Companies may clump rounds together; they are sometimes called "super-days", which can be described as a wave of different interviews. All in all, you may expect an onslaught for a given intern application.

When it comes to the number of rounds a company has for a role, graduate roles usually have an extra round; what this round could be can vary from another behavioural interview to another set of technical interviews. The general rule of thumb is that quantitative trading firms have the most rounds, followed closely by big tech companies, then most other companies. Smaller companies or startups have the added benefit of usually not needing to filter for as many people, and recruitment could be as simple as a discussion for an hour. 


# Pre-Interview Assessments

Before you're able to prove yourself in an interview, companies will subject you to a variety of silly assessments, including Overcooked, random pattern matching tests, or an MBTI test. Yes, I think they're full of shit as well, but you're probably not in a position to be above them at this point. Such is the life of a student. The extent to which you can prepare for this can range from extensive practice to just biting the bullet, some tests are just stupid. 

## HackerRank / Coding Tests

The HackerRank. What else can be said about it? A company wants to filter out people who can't write a line of code to save their lives, so they ask you to complete a coding assessment. The coding test typically consists of a set of Leetcode/HackerRank style questions, with a set of visible test cases, that and not visible to you. Your goal is to pass enough test cases to make it to the next round. The threshold for passing depends on the company, sometimes they just want to see a response, even if it's not correct, while other companies may look at people who completed the test quickly.

It's worth noting that these assessment sites can pick up on cheating attempts, such as changing tabs, though not all companies care if you open another tab. I don't condone cheating, but you should be smart in what you do. So, how do you prepare for one of these assessments?

### Preparation Strategies

The answer is Leetcode. There are two rounds where Leetcode comes in handy; the coding assessment, and the technical interview. When it comes to what problems you should solve, there are curated lists of 75 to 150 problems that cover topics that are most likely to appear on a technical assessment. 

- [Grind75, a customisable study plan based on how much time you have](https://www.techinterviewhandbook.org/grind75)
- [Neetcode 150, a similar study plan](https://neetcode.io/roadmap)
- [Leetcode's top interview 150](https://leetcode.com/studyplan/top-interview-150/)

The content in these study plans follows a standard data structures and algorithms course at your university, and you may have an easier time approaching questions from certain topics after seeing them in class. Assuming you're familiar with a DSA class, the below resources build on the topics you would have seen in class. Some students also elect to use competitive programming sites, such as Codeforces, Codechef, AtCoder, etc, and participate in competitions which can supplement your practice but are often overkill for most places that may not even ask for technical problems.

- [Cracking the Coding Interview (available on Libgen)](https://www.amazon.com.au/Cracking-Coding-Interview-Programming-Questions/dp/0984782850)
- [14 patterns to ace any coding interview (available on Libgen as Grokking the Coding Interview)](https://hackernoon.com/14-patterns-to-ace-any-coding-interview-question-c5bb3357f6ed)
- [The Algorithm Design Manual](https://www.algorist.com/)
- [Introduction to Algorithms (CLRS)](https://www.amazon.com.au/Introduction-Algorithms-Thomas-Dartmouth-College/dp/0262033844), though this is more dense and designed for a course in algorithms and data structures

Beyond general problem-solving preparation, you should also be able to code in one of the languages that HackerRank lets you pick from. Some companies don't limit the languages you can choose from; Atlassian lets you choose any commonly used language. Optiver and IMC limit you to C, C++, and Java, which means you should be able to use the respective standard libraries in addition to the basics of programming. My advice is to warm up before you attempt an OA, as you may be rusty on specific data structures, or language-specific context. A list of common data structures you should know to use/implement include:

- **Arrays**:
    - Python: `list`
    - Java: `Array`, `ArrayList`
    - C++: `std::vector`
- **Stack**:
    - Python: `list` with `pop()`
    - Java: `java.util.Stack`
    - C++: `std::deque`
- **Queue**:
    - Python: `collections.deque`
    - Java: `java.util.Queue`
    - C++: `std::deque`
- **Hash Maps**:
    - Python: `dict`
    - Java: `java.util.HashMap`
    - C++: `std::unordered_map`
- **Heaps**:
    - Python: `heap` module
    - Java: `java.util.PriorityQueue`
    - C++: use `std::priority_queue`

Other data structures such as graphs, disjoint sets, tries, etc require you to implement them yourself. You must know how to use these data structures, especially for questions that ask you to extend the normal functionality of these data structures.


### The HackerRank

To succeed in the HackerRank round, you must fulfil their unknown criteria. For each question, there are typically test cases, visible and hidden. The objective is normally to clear as many test cases as you can (while also getting a submission that doesn't exceed the time limit), however, some companies are known to prefer people who quickly finish the assessment. Alternatively, you may not even solve any of the test cases, but an engineer may later look at your code and progress you to the next round. Ensure you have a look over every question and never spend too much time on one problem if you can't make progress.

Companies may also add multiple-choice questions on topics such as data science or computer hardware fundamentals, which is more frequent in data-adjacent roles but can also appear in coding tests, so be prepared.

![](/assets/guide-to-tech/proctoring.PNG)

The HackerRank environment [typically monitors whether you tab out](https://support.hackerrank.com/hc/en-us/articles/360011479133-Proctoring-HackerRank-Tests), along with any other potential interactions outside the browser, though not every company cares about whether you do this. 

### Companies that use this assessment

- Optiver, IMC, Akuna, SIG, Citadel Securities, and VivCourt all use coding tests in some form to filter out applicants who can't code in the relevant language.
- Google, Atlassian, Canva, TikTok, and Amazon are also known for using coding tests early on.
- NAB and ANZx are known to use coding tests, however this depends on the role.
- Thales, Telstra, and Xero also employ coding tests, while Quantium employs a coding knowledge quiz 


## Psychometric Tests

One of my less preferred assessment items, the psychometric test baffles me. I don't understand how it gauges much from a candidate, aside from being a time-consuming filter. The components that may be included in a psychometric test often include:

- Numerical Reasoning 
- Verbal Reasoning
- Inductive Reasoning
- Logical Reasoning
- Personality tests 

Not much can be said about these tests, and there's not much I can suggest to prepare for them. They're relatively basic and are often employed by **the banks**, or other non-tech organisations. Prosple has a [guide](https://au.prosple.com/interviews/top-5-tips-for-surviving-psychometric-testing) on how to survive a psychometric test and outlines what you may expect from a test. If you feel the need to brush up on this type of test, the [Careervidz'](https://www.youtube.com/watch?v=vowwzQx-fGY&list=PLCcteVWYyBts9bff--pGdSAGs8UeExjlF) link on the guide covers a variety of questions. You are often allowed a scientific calculator and are recommended to make use of it whenever possible. However, there are more interesting assessments ahead, that test applicants with games as well.

### Esoteric Tests (Cognitive Tests/Games)

Zap-N thought it would be funny to turn [Cooking Mama](https://youtu.be/DtZtbDA1wSY?t=160) into an assessment that tests your reaction time. Or better yet, how about [that game where you can pump it as many times as you want, but you lose if it pops](https://www.youtube.com/watch?v=UcLrdhGBQ9M). In case you're completely lost on what I'm talking about, **Optiver**, [and some other companies](https://www.tiktok.com/@jamesleonidas2/video/7283692043765894442) use more esoteric assessments such as Grill Master and the Balloon Game to measure your reaction time, how you approach risk tolerance, and so on.

![Fujiwara Chika pumping a balloon](/assets/guide-to-tech/chika.gif)

To me, these assessments are similar to pymetrics assessments, which consist of vague tasks that seem to be easier the more you possess skills that are required for a variety of video games. [Trading Interview](https://www.tradinginterview.com/courses/company-preparations-course/lessons/optiver/topic/first-round-zap-n-test/) lists some strategies for the balloon popping game, where you should discern around when the balloon pops, and plan accordingly. Grill Master being compared to [Overcooked](https://store.steampowered.com/app/448510/Overcooked/) should tell you that playing some reaction-based video games would be a good idea. As an aside, these games are reminiscent of flash games, and would not be hard to recreate. A potential side-project could entail recreating these mini-games to practice on.

This section will also be updated as I'm informed of any other strange assessment items, though it's also worth noting anyone applying for a trader role (IMC and Optiver specifically) will likely experience these games at some point. I also consider some of the games you get here to be psychometric testing as well, just in a more unusual form. The [Human Benchmark](https://humanbenchmark.com/) covers some games that may be similar to what you may find in a pymetrics assessment.

### Companies that use this assessment

It would honestly be easier to list the companies that don't start with psychometric tests... The below list is definitely not exhaustive (like all the other lists). 

- The Big 4 banks (+Macquarie) and accounting firms are known for starting with psychometric tests
    - ANZ has a game-based assessment consisting of 16 games
- Amazon and Xero also incorporate some personality tests in their initial assessments
- Telstra and Optus use psychometric tests
- Various government roles also use psychometric tests
- Optiver is known to utilise Zap-N as part of their software engineer OA



## One-way Video Interviews (Vieple, HireVue)

A one-way video interview, contrary to its name is an assessment where you're recorded and analysed based on your responses. Vieple and HireVue are common video interview platforms used, and you're typically given a set of questions to answer within a certain timeframe. The format starts with a question, along with a grace period to think about an answer, and then you are recorded. Some interviews allow you to be re-recorded. The software allegedly uses AI to recognise facial behaviour and patterns in conjunction with your verbal answers, though I cannot find sources online that corroborate that assessment.

My anecdotal advice for overcoming digital video interviews is as follows:

- Attempt to centre yourself and try to look at the web camera that you're using
- Be well-spoken, take your time to put together a response
- Incorporate keywords about the role in your responses where possible
- Prepare to be asked technical and behavioural questions

### Companies that are known to do this

- CBA/ANZ and Big 4 Consulting Firms use a one-way video interview (typically behavioural questions)
- IMC has a video interview that can consist of technical questions
- IAG/Optus/Rio Tinto/Car Sales/Leidos/Xero/REA have one-way video interviews 

With enough luck, you'll make it to an actual human interview.

# Interviews

Now we get to the interviews, the more impactful part of the application rounds. You'll be talking with recruiters, engineers, and managers during these rounds, and will be tasked with demonstrating your skills or experiences to convince the company that you're fit for the role.

## Recruiter Call/Phone Screen

With larger companies, the first human contact you'll arrive at is the talent acquisition team, or in other words, the recruiter who'll guide you through the process and give you updates on your progression. The recruiter round is usually known as a phone screen (though it's usually a Zoom call nowadays). The recruiter call serves as an opportunity for the recruiter to get a better understanding of you as a candidate, but also works the other way around; you should use the opportunity to learn more about the company. It's worth noting that in some cases, you may be interviewing with an engineer, but it's much more common to talk with a recruiter first.

- **What can you be asked?**
    - Basic behavioural questions, see the behavioural round for more info
    - Technical trivia specific to the role
    - General Computer Science Fundamentals (Data structures)
    - Coding Fundamentals (Language Specific features)
- **What should you ask?**
    - How many rounds there are, how to prepare for them
    - What the role entails, what you may be working on
    - Company culture
    - Any other questions you have about the company

The call is also used to confirm logistical details, such as when you graduate, whether you have any exploding offers, or are applying to any other places. If you're asked behavioural questions, see the Behavioural Interview section for more information. The technical trivia asked can include computer science fundamentals, computer hardware information, or role-specific concepts. If you can't answer them, preface that and give your best understanding of the concept. In the case that the phone screen you've received is technical, see the Technical Interviews section.

### Companies with this round

This round can take on various forms and will vary from company to company.

- Atlassian and Canva incorporate a recruiter round with technical trivia and behavioural questions 
- IMC and Optiver have a short behavioural round with a recruiter 

## Technical Interviews

Ah, the technical interview. [Likened to surviving a gruelling series of enhanced interrogation techniques](https://www.youtube.com/watch?v=ubOhA56G_tk), the technical interview is often seen as the true filter of getting a software engineering job. Nonetheless, we press on. It's worth noting that technical interviews are less common in Australia since they're more focused on hiring someone with the right mentality that they can train up, though companies in search of top talent can afford to be pickier. The big tech companies and HFTs are known for these rounds, and is important to prepare for them so that you're not caught unawares when you're thrown a Leetcode medium to solve in front of your interviewers.

Mock technical interviews are your best friend when it comes to technical interview practice. Take questions from the resources in the HackerRank question and work with a friend to solve them under interview conditions. There are plenty of opportunities to attempt mock interviews; your university society may run mock technical interview events, Discord servers that run various interview preparation sessions, dedicated study programs such as [Ravi's Study Program](https://www.youtube.com/watch?v=DBeklgUv1Rg), or asking your friends to mock interview you. The more you practice, the more familiar and confident you become with the process.

### Navigating the Interview

To demonstrate that you're an ideal candidate in the technical interview, you'll want to demonstrate in detail that you can write code, problem-solve, and communicate with your interviewer. There are templates for how you should conduct the technical interview; [REACTO](https://medium.com/@sarahscode/reacto-technical-interview-prep-the-fullstack-way-706929a44e90) comes to mind, or the practices outlined in the [Tech Interview Handbook](https://www.techinterviewhandbook.org/coding-interview-cheatsheet/). 

#### Start of the Interview

Ensure you introduce yourself! Keep it to the point. The interviewer(s) will introduce themselves, and then go over the question. You may have access to your text editor, Google Docs, or an online text editor such as CodePair; it would be a good idea to take down notes while they're going through the question. After they've finished it, you can choose to describe the question as you understood it back to the interviewer to clarify and ensure you've understood the question properly. Now, start asking questions about the problem you've been presented with, doing so indicates your communication skills and ability to request specific information. This could include questions such as:

- Assumptions about the input, will you need to deal with edge cases or invalid inputs
- How large the input is (which could give you hints about the approach you'll need)
- Does time complexity matter for a first pass?

Once you've got a good idea of what the question is, attempt an example test case by hand to communicate that you know what you're doing.

#### Coding a Solution

Before you begin writing code, start with pseudocode to describe your thought process. This could be as text, or it could be verbal, though I recommend writing it down so you can reference it when writing it. You may want to describe any pre-processing on the input, any data structures you may need, or any algorithms or techniques that solve the problem. If you're confident, you may also describe the time and space complexity of the algorithm you have in mind, though you can also defer that to after you've written the code. Once you're satisfied with your approach, ask the interviewer if you can start coding.


Now we get to writing the code. Because you're working with an interviewer, you'll need to explain your thought process as you're coding up a solution. Writing code while speaking code takes conscious effort, and it's alright to initially suck at it, that's what practice is for. You can choose to describe what you've done before, or after you've written some logic if talking while coding proves to be strenuous. Describe the logic you're writing at a high level, what it intends to accomplish, clarify why you've chosen to do it and take your time while doing so. When it comes to coding practice, ensure you use descriptive variable names while you write code that is clean and easy to read. The interviewer is your friend here, they'll need to be able to read your code if you get stuck down the line.

#### Code Review

After you've coded up a solution you're satisfied with, have a look back on your code, and scan for any immediate mistakes. You can take a test case and simulate the execution of the code to sanity-check your work. Afterwards, have a look at the constraints, and see if you can come up with any edge cases that potentially break your solution. If you're satisfied that your solution is sound, analyse the space and time complexity if you haven't already done so. Finally, ask the interviewer if you can test the code. If your code runs successfully, well done! You can talk about optimising your code, and repeat the process above, focusing on refactoring your code as necessary. If your code doesn't work, or if you're not sure about how to solve the problem, the interviewer can give you a nudge, which is a key signal to see how you work with other engineers.

After you're finished with the problem, you may be left with some time to ask questions. Come prepared with questions you want to know; this is commonly known as a reverse interview question. Once again, [the Tech Interview Handbook](https://www.techinterviewhandbook.org/final-questions/) has an extensive list of questions that you may want to ask, however, you should ideally ask questions that you'd be interested in hearing about, as opposed to doing so out of obligation.

### The Rubric

Many companies use a general rubric for scoring your performance in an interview. The [Tech Interview Handbook](https://www.techinterviewhandbook.org/coding-interview-rubrics/) goes into more detail about what this rubric looks like at different companies. In general, you can expect to be assessed across the following criteria:

- Communication: How well you work with the interviewer, ask for clarification, and explain your thought process while solving the problem
- Technical Competency: Does the code work, are there syntax errors, etc
- Problem Solving: Do they solve the problem, and is the approach optimal?

These criteria may not be weighted equally; sometimes the ability to communicate an approach and describe the time/space complexity is more important than having a working solution. [This Reddit thread](https://old.reddit.com/r/leetcode/comments/1aydvac/what_is_the_mindset_of_meta_interviewers/kruj9mg/) covers a rubric for a company where even if you get a solution that doesn't work, being able to communicate still gets you quite a way. The scores for a rubric are commonly from the set of values $\{1,2,3,4\}$ (though different companies may use their own scoring scale), and they roughly translate to being a "strong no hire" to a "strong hire". All of these scores are then combined with the scores of other final interviews, and then a hiring committee decides whether you make it in or not. For more information on what a potential "strong hire" looks like, have a look at the [Tech Interview Handbook](https://www.techinterviewhandbook.org/coding-interview-rubrics/), specifically the section on the detailed explanation of each evaluated criteria, and incorporate them in future interviews.

### Other Tips

The technical interview is not just about how well you solve the presented problem, or how elegant your code is, but also functions as a behavioural interview. The way you interact with your interviewer is akin to a pair coding session; that is, you can talk the process through with them and rubber-ducky debug your work. If you're also stuck with the problem, your interviewer may suggest an alternative line of thinking to put you back on track; seeing how you interact with the interviewer is also another aspect of the process.

### Companies with this round

- Every quantitative trading firm has at least one technical interview
- Google/Canva/Atlassian/TikTok/Amazon/Snap/Airwallex/AfterPay all have at least one technical interview


## System Design Interviews

The System Design interview is not very common at an intern level, often appearing in interviews for experienced hires or for some graduate programs, but it doesn't hurt to have a decent idea of how you'd design a system at a high level. These interviews can involve whiteboarding/diagramming as opposed to coding, as the round relies more on your knowledge. If you want an idea of what an exaggerated version of the interview looks like, Krazam's [Microservices](https://www.youtube.com/watch?v=y8OnoxKotPQ) video is a fun watch.

My personal recommendations include:


- [Grokking the System Design Interview (available on LibGen)](https://www.designgurus.io/course/grokking-the-system-design-interview)
- [System Design Primer](https://github.com/donnemartin/system-design-primer)
- [Designing Data Intensive Applications](https://www.oreilly.com/library/view/designing-data-intensive-applications/9781491903063/) (may be overkill for a beginner)
- The [Exponent Youtube channel](https://www.youtube.com/watch?v=NtMvNh0WFVM)
- [Top 50+ AWS Services Explained in 10 Minutes](https://www.youtube.com/watch?v=JIbIYCM48to)

It's worth reiterating that you most likely will not receive a system design question at the level of the Exponent interviews, but the general domain knowledge that comes from listening to the videos is useful. As an example, I've been asked to whiteboard a system for assigning tags to cards, which involves defining endpoints for the API, and how the databases store data, then moving onto topics such as the CAP theorem, scaling vertically, and horizontally.


### Companies with this round

You can expect to see some form of system design at Optiver, TikTok (team-dependent), and other big tech companies. Some companies may be interested in how your system scales, while other companies care about latency and low-level specifics.

## Behavioural Interviews

The behavioural interview is effectively a culture fit round, to see if you're capable of working with other people and aligning with the company's values. You want to pitch your best self, without embellishing the truth beyond what you can justify, while also proving that you're a culture fit. 

### Your Elevator Pitch

For any interview, you should be able to fire off a concise elevator pitch that portrays your best self. I typically begin with my name, the course I'm studying, the societies I'm involved in (and what I do), hobbies (can include job-relevant and non-relevant hobbies), and any relevant job experience I have. This is typically a response to the question "Tell me about yourself", so you really want to hit it home, why you'd be perfect for the job from the get-go, while also leaving bread crumbs for the interviewer to ask about in more detail. I typically keep the responses to these questions around a minute or two at most, as you'll have more opportunities to talk about the specifics of what you mentioned later on.

### STAR - Preparing stories

The recommended answering strategy for most behavioural questions is STAR. The underlying idea is to tell a story in response to a question about a scenario and reveal the soft skills learned through the story. It stands for:

- Situation: What was the background, the problem, and why was it a problem?
- Task: What were you tasked with? 
- Action: What did you do to solve the task?
- Results: What did your actions lead to? How would you improve upon what you did in the future?

The optimal method for preparing stories is to write down your past experiences in a grid and identify the STAR elements in each of them. You don't need to be able to recite the story in STAR format by heart, but having them written down means you can quickly revise them before an interview, and raise any aspects of the stories you found particularly insightful.

### Company Values

Many companies have a page dedicated to their company values; it is a good idea to learn these values and bring them up in the interview. In the case of Atlassian, you may be asked what your favourite Atlassian value is, and being prepared will help mitigate any awkwardness while also demonstrating that you did your research going into the interview. If you so desire, you can try intertwining aspects of company values into your responses to questions, and then bring it up afterwards, to demonstrate that you're aligned with the company values.


### Vibes

As mentioned before, behavioural interviews attempt to determine whether you're a cultural fit for the company. Some interviews may grill your responses more, intending to see how you perform under pressure, and if you respond with honesty. Being able to navigate all sorts of challenges during an interview, and being able to adapt to the vibes of a company is a skill that comes with experience in interviews. Be mentally prepared to think on the fly, since you may be given a question you've never prepared for or have to justify your reasoning for an answer. If you're particularly interested in a company, ensure you research what the company does so you can appear informed and knowledgeable in the interview. 

### Resources

A list of questions from various resources includes:

- the [Tech Interview Handbook on rubrics](https://www.techinterviewhandbook.org/behavioral-interview-rubrics/)
- the [Tech Interview Handbook - Behavioural Interview Questions](https://www.techinterviewhandbook.org/behavioral-interview-questions/)
- [41 Behavioural Interview Questions You Must Know](https://www.themartec.com/insidelook/behavioral-interview-questions)
- [How to Answer the 64 Toughest Interview Questions](https://soulsearch.files.wordpress.com/2007/05/64interviewquestions1.pdf)


### Group Activities/Assessment Centre

Consulting firms and banks are known to utilise assessment centres to assess candidates and how they work with others in group activities. The group activities could include a case study, working in a team to pitch a product, or theoretical scenario exercises to test your ability to cooperate with each other. Resist the urge to shout over each other and try to dominate the conversation; instead, try to work together and set clear expectations about who works on what early on. [Prosple has a page](https://au.prosple.com/applying/assessment-centres) dedicated towards potential assessment items in the assessment centre.

### Companies with this round

Nearly all companies have a behavioural round somewhere down the line. If there's no behavioural round, there's typically an assessment centre, which is a group behavioural round. 

## Examples of Interview Formats

I've listed some companies and their interview rounds below for reference. Take these examples as a baseline; the interview format is subject to change.

### Example 1 - Atlassian (2023)

As an example, Atlassian has four rounds in total. Their internships open in early February and is typically the first big tech company to open their applications. They are open only to penultimate students, and have a range of intern roles including software engineering (front-end and back-end), site reliability, data science, machine learning, product management, and so on. Students must be in their penultimate year to apply for the internship program.

The software engineer intern process goes as follows:

1. HackerRank OA consisting of three to five problems (pass X test cases to progress)
2. Recruiter Screen (confirming general details, some trivia, questions about the company)
3. Technical Interview (A round where your live coding and communication skills are put to the test)
4. Values Interview (A behavioural interview to understand how you align with Atlassian's values)

Atlassian used to have a System Design interview, however it was scrapped as many undergraduate students were unfamiliar with the concepts. The graduate version of the interview process has an extra management interview.

### Example 2 - Optiver (2023)

Optiver's software development internship is one of the few internships available to non-penultimate students, with first-year students being eligible to apply for the program. Intern applications opened at the start of March 2023. Quantitative trading firms are also known for their Superday gauntlets, where you do a set of interviews in a day.

- An online assessment consisting of [Overcooked and other various Flash games](https://www.tradinginterview.com/courses/company-preparations-course/lessons/optiver/topic/first-round-zap-n-test/)
- HackerRank OA consists of several problems
- Behavioural Interview 1
- Technical Interview (Involves CodePair)
- **A super day consisting of (in no particular order):**
    - Behavioural Interview 2 (described as an interrogation)
    - Object Oriented Design Interview (No code, involves diagramming)
    - Algorithm Design (pseudocode)

The process has changed for 2024, which incorporates system design.

### Example 3 - CBA (2022)

Commonwealth Bank (CBA) has technology streams for engineers and data scientists. The internship tends to open around the middle of the year. 

- A 75-minute long psychometric test that consists of basic maths, pattern matching, and personality questions
- A HireVue consisting of several behavioural questions (One-way video interview)
- A virtual assessment centre consisting of:
    - Four 15-minute interviews with CBA employees (Consisting of behavioural questions and general opportunities to ask about the company)
    - A group activity with two other applicants (Given an idea or product, work in a team to pitch it)

The graduate process is identical to the intern process, to my knowledge.

### Example 4 - Canva (2023)

Canva hires engineers in frontend, backend, infrastructure, security, and machine learning. Each of the processes has a similar structure but has specialisation-specific questions. Students must be in their penultimate year of study to apply.

- HackerRank that can only be done in Java/Javascript, depending on your specialisation
- Recruiter interview that consists of behavioural questions and specialisation-specific technical trivia
- Technical Interview with specialisation-specific tasks (e.g building an application using JS/HTML/CSS or a Leetcode problem in Java)

### Example 5 - IMC (2024)

IMC (International Market Makers Combination) is another Dutch quantitative trading firm that hires software engineer interns in their penultimate year. They open around February.

- A HackerRank that can be done in Java/C/C++
- A Vieple (one-way interview) consisting of technical questions
- A behavioural phone interview 
- A super day consisting of:
    - A technical round
    - A behavioural round

IMC is also known for flying candidates to the office in Sydney for a visit if they reach the final super day round, however, I cannot confirm if this is still the case.


## Where to from here?

So you're done with your interviews; now what? Resist the urge to let the potential outcome swarm your mind. If you have more interviews, focus on preparing for them, while keeping up with any coursework, and your daily life. Depending on the company, you may know within the next week, all the way up to a month later. I recommend reflecting on how you went in each interview; that way you can quickly identify areas to improve upon when given feedback.


### Failure

Failure is very common at an intern/graduate level; this is unfortunately because there are too many applicants to interview and too few roles for everyone. You shouldn't take it personally if you're rejected from a place, or many places, it's just a natural aspect of interviewing. Rejections build resilience, and you'll get a better idea of how to interview effectively each time till you finally get where you want. In my case, I got rejected from a place after a month of doing a final interview with no feedback, and later found an even better opportunity. There's always another place, and another year if you don't get in this time.


### Tackling Applications

When it comes to applying to companies, apply early on, and keep track of your applications so that you don't forget when you have an interview. Planning ahead and having dates down will counteract your surprise when you have five interviews in a week, along with regular coursework. When it comes to scheduling interviews, don't feel urged to book your interviews ASAP, take your time and space them apart so you're not bombarded with the same song and dance. And finally, ensure you get some mock interview practice before you start interviewing, so you're not out of practice and caught off guard when it counts.

### Places to Practice

Practice, practice, practice! I cannot stress how important it is to do mock interviews with your friends or people in the industry. The best practice is the real thing, which is why I usually advise applying everywhere and using places that you're not as invested in as practice runs for the roles you're gunning for. Below are some places (in no particular order) you can look to find people to prepare with.

- [Pramp](https://www.pramp.com/#/) (Worth noting that sometimes your interviewer may not show up)
- [interviewing.io](https://interviewing.io)
- Ravi's Study Program - As a whole, this is a **free** boot camp that gets your technical and behavioural skills up to scratch. The program is a good way of keeping yourself accountable, and the people involved are passionate about it.
- Your local university society
- Your friends
- Random people on the right Discord servers such as [AusDevs 2.0.0](https://discord.gg/mmrQxzDSC8)

### Assorted Interview Resources

There are countless really amazing interview guides on the internet, the guide I have written is not particularly special compared to some of the sites listed below which go into more detail on the whole process.

- [The Tech Interview Handbook](https://www.techinterviewhandbook.org/software-engineering-interview-guide/)
- [interviewing.io](https://interviewing.io), has a range of videos and guides if you scroll to the bottom of the page
- Cracking the Coding Interview - while it may be on the older end, it has a lot of advice for the entire process, and I absolutely recommend reading it.

## Conclusion

This concludes the numbered entries of my series, which are aimed at providing you with all the resources you need to prepare for internships. It's a joy to finally be able to finish this series. To put it into perspective, this series is longer than my honours thesis (roughly 12,000 words), and contains my countless observations about the whole process, along with wisdom I've gathered from many, many people.

### Acknowledgements

This was a MASSIVE undertaking, and I've basically poured away many hours of my life ~~which could have been spent on Persona 3 Reload~~ on this project. However, I want to acknowledge the many people who've helped with the creation of these articles, both indirectly and directly.

- The Monash Association of Coding, committees past, present and future. Most of my knowledge, and drive to record all this information and make it accessible came from MAC.
- My friends in the HFT and Big Tech space, who've told me about their journey and what worked for them.
    - In particular, Josh, Lauren, William, Jim, Madison, Eric J, Sung Ho, Alex M, and Nick L, all of you have helped shape part of this series in one way or another.
- The AusDevs server, for being a massive hub of information that has helped shape this article in particular.



Thank you so much for reading till the end! My final words to anyone who doesn't feel they're ready for an internship would be the line from Spider-Man: Into the Spider-Verse. ["When will I know I'm ready? You won't, it's a leap of faith."](https://youtu.be/BmFbczWrVUw?t=184) Good luck with your journey.

![](/assets/guide-to-tech/spiderman-when.gif)


