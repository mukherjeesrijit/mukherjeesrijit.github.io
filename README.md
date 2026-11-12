# srijitmukherjee.com

Jekyll site, deployed by GitHub Actions (`.github/workflows/deploy.yml`) on every push to `main`.
Same look as srijitmath.com: Inter, white / black, one accent (`#e8590c`), all in `assets/css/site.css`.

## Where things are
- `index.md`: home page. Kicker, tagline, news, interests, Penn State facts and the two Work cards are in the front matter; the research text is the body.
- `pages/publications.md`, `pages/teaching.md`: list pages (`items:` in the front matter).
- `pages/blog.md`: the blog index intro.
- `_config.yml`: menu (`nav`), footer links (`links`), email, CV path, `post_dates` (show dates on posts).

## Writing a blog post
Add `_posts/YYYY-MM-DD-slug.md`; it is served at `/slug/`.

```yaml
---
layout: post
title: "Title"
blurb: "One line under the title and in the blog list."
---
```

- Maths: `$…$` inline, `$$…$$` display (KaTeX).
- Citations: `{% include cite.html id="key" %}` with the BibTeX in `_data/citation.yml`.
- `<details><summary>…</summary>…</details>` notes open as a pop-up.
- `list: false` keeps a post out of the blog list (e.g. the EE 350 page); `draft: true` adds a draft banner.
- The **Blog** menu item appears by itself once at least one listed post is published.
- From a Jupyter notebook: `python scripts/publish_notebook.py notebook.ipynb --title "Title"`.

## Run locally
```
BUNDLE_PATH=vendor/bundle bundle install
BUNDLE_PATH=vendor/bundle bundle exec jekyll serve
```

Progress, change log and the plan for the private OS: [docs/PROGRESS.md](docs/PROGRESS.md).
