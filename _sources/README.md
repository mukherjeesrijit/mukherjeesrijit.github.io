# Course Site

## Setup

```bash
pip install -r requirements.txt
```

## Local preview

```bash
jupyter-book build .
open _build/html/index.html
```

## Deploy

Push to `main` → GitHub Actions builds + deploys to GitHub Pages automatically.

## Add Giscus comments

1. Go to https://giscus.app
2. Enter your repo name
3. Copy the `repo_id` and `category_id`
4. Paste into `_config.yml` under `html.comments.giscus`

## Add a chapter

1. Create `notebooks/chapterN.ipynb`
2. Add to `_toc.yml`

## Multi-framework tabs syntax

````markdown
```{tab-set}
  ```{tab-item} PyTorch
  import torch
  ```
  ```{tab-item} JAX
  import jax
  ```
```
````

## Math

Inline: `$x^2$`  
Block: `$$\nabla \mathcal{L}$$`
