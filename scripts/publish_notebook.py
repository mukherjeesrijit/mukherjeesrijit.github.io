#!/usr/bin/env python3
"""Convert a Jupyter notebook (with saved outputs) into a Jekyll post.

Usage:
    python scripts/publish_notebook.py notebook.ipynb --title "My Post Title"

Runs `jupyter nbconvert --to markdown` (no execution — it uses whatever
outputs are already saved in the .ipynb), then drops the result into
_posts/ with the right date-prefixed filename and moves any output
images into assets/img/notebooks/<slug>/.

Rerunning against the same --title updates that post in place (keeping
its original publish date) instead of creating a duplicate — so editing
a notebook and rerunning this script is how you "update" a post.
"""
import argparse
import re
import shutil
import subprocess
import sys
import tempfile
from datetime import date
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
POST_FILENAME_RE = re.compile(r"^(\d{4}-\d{2}-\d{2})-(.+)\.(md|markdown)$")

# python scripts/publish_notebook.py notebooks/notebook-publishing-demo.ipynb --title "Notebook Publishing Demo"

def slugify(text):
    text = re.sub(r"[^a-zA-Z0-9]+", "-", text.strip().lower())
    return text.strip("-")


def find_existing_post(slug):
    """Return (path, date) of the existing post for this slug, if any."""
    for f in (REPO_ROOT / "_posts").glob("*.md"):
        m = POST_FILENAME_RE.match(f.name)
        if m and m.group(2) == slug:
            return f, m.group(1)
    return None, None


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("notebook", type=Path, help="Path to the .ipynb file")
    parser.add_argument("--title", help="Post title (default: derived from filename)")
    parser.add_argument("--date", help="YYYY-MM-DD (default: today for a new post, unchanged for an update)")
    parser.add_argument("--tags", default="notebooks", help="Comma-separated tags (default: notebooks)")
    parser.add_argument("--blurb", default="", help="One-line summary for the post front matter")
    args = parser.parse_args()

    if not args.notebook.exists():
        sys.exit(f"Notebook not found: {args.notebook}")

    title = args.title or args.notebook.stem.replace("_", " ").replace("-", " ").title()
    slug = slugify(title)
    tags = "[" + ", ".join(t.strip() for t in args.tags.split(",") if t.strip()) + "]"

    existing_post, existing_date = find_existing_post(slug)
    publish_date = args.date or existing_date or date.today().isoformat()

    with tempfile.TemporaryDirectory() as tmp:
        tmp_dir = Path(tmp)
        subprocess.run(
            [
                "jupyter", "nbconvert", "--to", "markdown",
                "--output", slug, "--output-dir", str(tmp_dir),
                str(args.notebook),
            ],
            check=True,
        )

        md_path = tmp_dir / f"{slug}.md"
        body = md_path.read_text(encoding="utf-8")

        dest_img_dir = REPO_ROOT / "assets" / "img" / "notebooks" / slug
        if dest_img_dir.exists():
            shutil.rmtree(dest_img_dir)

        files_dir = tmp_dir / f"{slug}_files"
        if files_dir.exists():
            dest_img_dir.mkdir(parents=True, exist_ok=True)
            for f in files_dir.iterdir():
                shutil.copy2(f, dest_img_dir / f.name)
            body = body.replace(f"{slug}_files/", f"/assets/img/notebooks/{slug}/")

    front_matter = (
        "---\n"
        "layout: post\n"
        f'title: "{title}"\n'
        f"date: {publish_date} 12:00:00\n"
        f"tags: {tags}\n"
        f'blurb: "{args.blurb}"\n'
        "og_image: \n"
        "---\n\n"
    )

    dest_post = REPO_ROOT / "_posts" / f"{publish_date}-{slug}.md"
    if existing_post and existing_post != dest_post:
        existing_post.unlink()
    dest_post.write_text(front_matter + body, encoding="utf-8")

    verb = "Updated" if existing_post else "Created"
    print(f"{verb} post at {dest_post.relative_to(REPO_ROOT)}")
    if dest_img_dir.exists():
        print(f"Images copied to assets/img/notebooks/{slug}/")


if __name__ == "__main__":
    main()
