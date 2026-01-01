---
title: "Elements of this Website"
author: Sai Kumar Murali Krishnan
created: 2025-07-14 
categories: [random, web-dev]
tags: [random, web-dev]
summary: "Elements of this Website"
---

<script>
import Mermaid from '$lib/components/prose/mermaid.svelte'
import PythonCode from '$lib/components/prose/code.svelte'
</script>


I've been adding some stuff to my website.

<Mermaid graph="  graph LR
      A --- B
      B-->C[fa:fa-ban forbidden]
      B-->D(fa:fa-spinner)"/>



<Mermaid graph='sequenceDiagram
    Alice ->> Bob: Hello Bob, how are you?
    Bob-->>John: How about you John?
    Bob--x Alice: I am good thanks!
    Bob-x John: I am good thanks!
    Note right of John: Bob thinks a long<br/>long time, so long<br/>that the text does<br/>not fit on a row.
    Bob-->Alice: Checking with John...
    Alice->John: Yes... John, how are you?'/>


<PythonCode sourceUrl="/annotations/ponder.py" title="PonderNet Implementation from Annotated Papers"/>


