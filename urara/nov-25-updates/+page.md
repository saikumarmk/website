---
title: Some software I've been working on and other updates
author: Sai Kumar Murali Krishnan
created: 2025-11-04 
categories: [software]
tags: [software]
summary: "A summary of some software I've been working on, and other updates."
---


## Astrophysics Libraries

I've been looking at some astrophysics libraries. For instance, I notice that radiative transfer line simulation grids are stored as uncompressed files, which means they take up a significant amount of space, rather than being compressed and being loadable from one file. This is true of [saikumarmk/blueshifts](https://github.com/saikumarmk/blueshifts), a thesis repository for a paper that explores the changing spectral properties for a disc wind model. Additionally, SKIRTOR, a large collection of emission models of the dusty torus of an AGN has a large uncompressed collection, which I compressed at [saikumarmk/skirtor](https://github.com/saikumarmk/skirtor), along with a recreation of the Streamlit application that lets you explore what different AGN look like under different parameters. In particular, the focus is on modelling the behaviour of the dusty torus in obscuring other spectral features.

Kapteyn, a line fitting library for astronomy still uses an older version of `numpy<2`, which makes it quite inconvenient for virtual environments. A quick glance reveals that the primary issues are due to changes in the `numpy` C API, and can simply be renamed, which my fork does - [saikumarmk/kapteyn_fork](https://github.com/saikumarmk/kapteyn_fork).

## Pokemon Red Elo

Mostly refactors with code here. Though I would like to eventually try doing the same for Pokemon Crystal, which has a layered trainer AI system and it would make sense for parity.

# The Handbook Scraper

The scraper is still in an interesting state where the data is now there, but because the handbook formatting for some courses is strange, you can't really use it for something such as course planning. Nonetheless, I suspect for courses, a pass with a model like Gemini will get you proper data.

## A Transit Map of Melbourne

My old project, `MiniMelbourne` finally got a face lift and a deploy to [transit.saikumarmk.com](https://transit.saikumarmk.com). Check it! The PTV GTFS-R API also has bus, tram, and VLine API in addition to train data, so the map looks a fair bit more complete. It's heavily inspired by [minitokyo3d](https://minitokyo3d.com), which is a 3D map of Tokyo. You can find the source code here [saikumarmk/mini-melbourne-3d](https://github.com/saikumarmk/mini-melbourne-3d).

## This Site

In case you haven't noticed, a complete touch up has been done on the landing page for the site, along with a new portfolio view. It should also be a little less glitchy, and look cooler overall.

## Team changes at Canva

I've gone from Photo to Video, and our goal is to build a kick-ass video editor. The general theme we're going for is using AI to assist with the creation of videos, but ultimately the user still controls what they want to put into a video.


