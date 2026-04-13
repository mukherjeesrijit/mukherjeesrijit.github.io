---
layout: post
title: "MICCAI 2025 - Selected Papers"
date: 2026-04-12 11:00:00
tags: [research]
blurb: "This is my personal notes of selected papers of MICCAI 2025, that aligns with my research taste."
og_image: 
---
git add . 
git commit -m "research update"
git push -u origin main -f 
$x^2$
\(x^2\)
$$x^2$$
\[x^2\]

<details>
<summary><strong>Wang, Jinfeng, et al. "A novel Fourier Adjacency Transformer for advanced EEG emotion recognition." MICCAI, 2025.</strong></summary>

<br>
EEG emotion recognition faces significant hurdles due to noise interference, signal nonstationarity, and the inherent complexity of brain activity which make accurately emotion classification. In this study, we present the Fourier Adjacency Transformer, a novel framework that seamlessly integrates Fourier-based periodic analysis with graph-driven structural modeling. Our method first leverages novel Fourier-inspired modules to extract periodic features from embedded EEG signals, effectively decoupling them from aperiodic components. Subsequently, we employ an adjacency attention scheme to reinforce universal inter-channel correlation patterns, coupling these patterns with their sample-based counterparts. Empirical evaluations on SEED and DEAP datasets demonstrate that our method surpasses existing state-of-the-art techniques, achieving an improvement of approximately 6.5% in recognition accuracy. By unifying periodicity and structural insights, this framework offers a promising direction for future research in EEG emotion analysis. The code can be found at: https://github.com/YanhaoHuang23/FAT
</details>


<details>
<summary><strong>Teng, Lin, et al. "A Curvature-Guided Diffeomorphic Mesh Deformation Framework for Lifespan Brain Cortical Surface Reconstruction." MICCAI, 2025.</strong></summary>

<br>
$x^2$
Accurate and automatic lifespan brain cortical surface reconstruction (CSR) is crucial for analyzing brain development and aging. Traditional pipelines involve multiple processing steps, which are time-intensive and inefficient for handling larger datasets. While deep learning-based methods can accelerate reconstruction speed and produce high-quality meshes compared to traditional approaches, they are often constrained to a single time point. The limitation arises from the significant variations in cortical surfaces across age groups, particularly in folding patterns. In this paper, we propose a novel curvature-guided diffeomorphic mesh deformation framework for lifespan brain CSR. Specifically, to preserve correct topology structure and uniformity, the framework employs multiple deformation blocks to gradually warp a simple smooth template mesh to a complex target surface with high folding. Considering that curvature is closely associated with folding patterns, we introduce curvature map prediction as an auxiliary task to guide the deformation process, enhancing the anatomical accuracy to facilitate subsequent cortical morphometry. Notably, incorporating curvature can also expedite model convergence. Our method is evaluated on a largescale brain dataset with 2,132 subjects spanning ages 0 to 100 years. Experimental results show that our reconstructed surfaces have fewer geometric errors and optimal mesh regularity while being several orders of magnitude faster than traditional pipelines. Our code is available at https://github.com/TL9792/CCF.
</details>
