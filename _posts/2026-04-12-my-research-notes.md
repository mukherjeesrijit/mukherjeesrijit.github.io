---
layout: post
title: "My Research Notes"
date: 2026-04-12 11:00:00
tags: [research]
blurb: "This is my personal notes of selected research papers, that aligns with my research taste."
og_image: 
---

Something interesting happens in my brain (probably in everyone's brain) between 3-4 years of deep study of a set of topics. The neurons start to build genuinely meaningful connections. So, here is me starting to write about them as I transition into 4th year of Ph.D. Let me be clear in what I intend to document. Internally, my brain is curious to understand a set of questions or queries $Q =$  {$Q_1, Q_2, \cdots, Q_n$}, it wants to understand. So, I read a set of read a set of knowledge or keys (research papers) $K =$ {$K_1, K_2, \cdots, K_m$}, and understand them $V =$ {$V_1, V_2, \cdots, V_m$}. The goal is to follow my curiosity, read, document my understanding [essentially performing $(Q^TK)V$] and articulate my questions. I have to use my attention to deliberately focus on a sparse and deep subset of $Q$, which I call **$R$ - My Research Taste**. I intend to document the relevant subset of $K$ and their understanding $V$ in this dynamic article, that help me understand and refine $R$ in a feedback loop. The evolution of $R$ with time is also mildly confounded by socio-economic factors. I believe it only makes me more creative, unique, and think deeply. Feel free to read about **$R$ - My Research Taste**, and also the subsequent exploration of those questions in [my Blog (sort by Notes)](https://srijitmukherjee.com/blog).

<details>
<summary><strong>Dong, Yihong, et al. "Fan: Fourier analysis networks." arXiv preprint arXiv:2410.02675 (2024).
</strong></summary>
<br>
We have all being very focussed on the multi-layer perceptron & its extensions of structure into convolution and transformers. Kolmogorov-Arnold Networks have challenged this fundamental structure in 2024 the functional representation of a function $f$ based on Kolmogor Arnold Representation Theorem just like Universal Approximation Theorem for MLP. This process motivated some works for replacing MLP using the domain-enriched structures. For example in real life signals, where periodicity reigns, Fourier Analysis gives the most insightful answer, and also Fourier representation theorem can uniquely represent a a reasonably behaved periodic function (piecewise smooth and continuous). In Fourier Analysis Networks, the authors first wrote down the entire Fourier Decomposition, and replaced the coefficients by learnable weights as shown in the equation below. Just like KAN based transformers, and convolutions have been built, FAN based transformerer and convolution layers have been built too. Interestingly FAN has 25% less parameters and gives efficient performance for periodic representation learning for examples like modular arithmetic, and composition of trigonometric functions with other smoother functions.

<img src="{{ "assets/img/blog/fan.png" | absolute_url }}" alt="fan" class="post-pic" style="width: 60%; max-width: 480px; height: auto; display: block; margin: 0.5rem auto;" />
<br />
<br />

</details>


<details>
<summary><strong>Wang, Jinfeng, et al. "A novel Fourier Adjacency Transformer for advanced EEG emotion recognition." MICCAI, 2025.
</strong></summary>
<br>
My Notes
</details>

<details>
<summary><strong>Teng, Lin, et al. "A Curvature-Guided Diffeomorphic Mesh Deformation Framework for Lifespan Brain Cortical Surface Reconstruction." MICCAI, 2025.
</strong></summary>
<br>
My Notes
</details>
