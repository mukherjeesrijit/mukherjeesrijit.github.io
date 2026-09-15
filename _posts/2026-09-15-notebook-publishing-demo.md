---
layout: post
title: "Notebook Publishing Demo"
date: 2026-09-15 12:00:00
tags: [notebooks]
blurb: "A demo post showing what code + output looks like when published from a Jupyter notebook."
og_image: 
published: false
---

This is a small demo of the notebook-to-post pipeline: I write and run this in Jupyter, then publish the code and its saved output as a static post.


```python
import numpy as np
import matplotlib.pyplot as plt

x = np.linspace(0, 2 * np.pi, 200)
y = np.sin(x) * np.exp(-x / 4)

plt.figure(figsize=(5, 3))
plt.plot(x, y)
plt.title("Damped sine wave")
plt.xlabel("x")
plt.ylabel("sin(x) * exp(-x/4)")
plt.show()
```


    
![png](/assets/img/notebooks/notebook-publishing-demo/notebook-publishing-demo_1_0.png)
    



```python
peak_x = x[np.argmax(y)]
print(f"Peak occurs at x = {peak_x:.3f}")
print(f"Peak value = {y.max():.3f}")
```

    Peak occurs at x = 1.326
    Peak value = 0.696
    
