---
layout: publications
title: Publications
kicker: Research
permalink: /publications/
blurb: "Domain-enriched, ante-hoc interpretable machine learning for biomedical image analysis."
more:
  text: All publications on Google Scholar
  link: https://scholar.google.com/citations?user=bmQgd0MAAAAJ&hl=en

# Newest first. The first link is where the title goes. "S Mukherjee" is shown in bold.
# Sources (checked 2026-11-12): Google Scholar, PubMed, Crossref, OpenAlex, arXiv.
papers:
  - title: "Hydrocephalic Brain Volume Estimation from Low-Field MRI: Topologically-Enriched Cross-Modal Enhancement and Segmentation"
    year: 2026
    kind: Preprint
    authors: S Mukherjee, K Templeton, SJ Schiff, V Monga
    venue: medRxiv · August 2026
    about: >-
      EnSegNet-Cross measures brain and CSF volume in infants with hydrocephalus from low-field MRI alone. It learns from
      paired CT scans during training, with a 3D topological loss based on persistent homology that makes the CSF
      structures it finds on low-field MRI agree with CT, and needs only low-field MRI at inference. On hydrocephalic
      infants with paired low-field MRI and CT it outperformed state-of-the-art alternatives (Dice 0.85, volume score
      0.93), so volume can be monitored often and without radiation.
    links:
      - name: Preprint
        url: https://doi.org/10.64898/2026.08.17.26360618

  - title: "Hemibrain growth as a biomarker for whole-brain growth"
    year: 2026
    kind: Journal article
    authors: US Bajaj, M Yu, K Templeton, S Mukherjee, H Zhang, N Nunn, AV Kulkarni, JRW Kestle, V Monga, SJ Schiff
    venue: "Journal of Neurosurgery: Pediatrics 38(5), 700–710 · 2026"
    about: >-
      Implanted shunts leave metal artifacts on MRI that make whole-brain volume hard to measure in children with
      hydrocephalus. Using pre- and postoperative MRI of 75 infants from the Endoscopic versus Shunt Treatment of
      Hydrocephalus in Infants trial, the study shows that the hemisphere without the artifact is a reliable proxy for
      whole-brain growth, and gives an automated AI pipeline (brain/CSF segmentation and a hemibrain mask generator) that
      measures it.
    links:
      - name: Paper
        url: https://doi.org/10.3171/2026.4.PEDS25541
      - name: Preprint
        url: https://doi.org/10.1101/2025.09.28.25336850

  - title: "GLAPAL-H: Global, Local, And Parts Aware Learner for Hydrocephalus Infection Diagnosis in Low-Field MRI"
    year: 2025
    kind: Journal article
    authors: S Mukherjee, K Templeton, S Tindimwebwa, PY Lin, J Sutin, M Yu, M Peterson, C Truwit, SJ Schiff, V Monga
    venue: IEEE Transactions on Biomedical Engineering 73(1), 139–152 · 2025
    about: >-
      The study aims to develop a method for differentiating between healthy, post-infectious hydrocephalus (PIH), and
      non-post-infectious hydrocephalus (NPIH) in infants using low-field MRI, which is a safer, low-cost alternative to
      CT scans. The study develops a custom approach that captures hydrocephalus etiology while simultaneously
      addressing quality issues encountered in low-field MRI. Its global, local and parts branches outperform
      state-of-the-art alternatives, including CT-based approaches, in accuracy, interpretability and generalizability.
    links:
      - name: Paper
        url: https://ieeexplore.ieee.org/document/11029195/
      - name: Open access
        url: https://pmc.ncbi.nlm.nih.gov/articles/PMC12338915/
      - name: Code
        url: https://github.com/mukherjeesrijit/glapalh

  - title: "Triangle-free projective-planar graphs with diameter two: domination and characterization"
    year: 2023
    kind: Journal article
    authors: D Chakraborty, S Das, S Mukherjee, UK Sahoo, S Sen
    venue: Discrete Applied Mathematics 331, 11–24 · 2023
    about: >-
      In 1975 Plesník characterized the triangle-free planar graphs with diameter two. This paper characterizes all
      triangle-free projective-planar graphs with diameter two, and applies the result to compute the analogue of the
      clique number for colored mixed graphs, graphs with different types of arcs and edges.
    links:
      - name: Paper
        url: https://doi.org/10.1016/j.dam.2023.01.001
      - name: arXiv
        url: https://arxiv.org/abs/2212.04253
---

My research focuses on building domain-enriched, ante-hoc interpretable ML algorithms for biomedical image analysis. I embed disease etiology and modality priors directly into model architecture - yielding interpretable, robust, state-of-the-art performance, especially in scarce, noisy, and imperfect clinical conditions.
