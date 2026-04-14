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
We have traditionally focused on the *multi-layer perceptron* (MLP) and its structural extensions, such as convolutional networks and transformers. However, recent developments—particularly the introduction of *Kolmogorov–Arnold Networks* (KANs) in 2024—have challenged this foundational paradigm. KANs are motivated by the *Kolmogorov–Arnold Representation Theorem*, which provides a functional decomposition of multivariate functions, analogous in spirit to how the *Universal Approximation Theorem* explains the expressive power of MLPs. This shift has inspired a broader line of work aimed at replacing or augmenting MLPs with domain-enriched functional structures. For instance, in real-world signals where periodicity is prevalent, *Fourier analysis* provides a natural and highly interpretable basis. The *Fourier Representation Theorem* guarantees that any reasonably well-behaved periodic function (e.g., piecewise smooth and continuous) can be uniquely expressed as a sum of sinusoidal components. Building on this idea, *Fourier Analysis Networks* (FANs) explicitly incorporate the full Fourier decomposition of a function, replacing the Fourier coefficients with learnable parameters. This enables the network to directly model periodic structures in the data. Similar to how KAN-based transformers and convolutional architectures have been developed, FAN-based transformer and convolutional layers have also been proposed. Interestingly, FANs achieve comparable or improved performance with approximately $25\%$ fewer parameters, particularly in tasks involving periodic structure learning, such as modular arithmetic and compositions of trigonometric functions with smoother functions. Overall, FANs demonstrate how domain-informed inductive biases—drawn here from signal processing and harmonic analysis—can be effectively integrated into deep learning architectures, leading to more efficient and interpretable models. In particular, periodic functions are more naturally captured using such prior-informed network designs.
<img src="{{ "assets/img/blog/fan.png" | absolute_url }}" alt="fan" class="post-pic" style="width: 100%; max-width: 480px; height: auto; display: block; margin: 0.5rem auto;" />
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
