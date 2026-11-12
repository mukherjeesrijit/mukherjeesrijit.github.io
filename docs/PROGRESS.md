# srijitmukherjee.com: progress and plan

Last updated: 2026-11-11

The public website is the front door. Later, a private personal operating system (journal, tasks, calendar view,
research second brain, blog drafts) will sit next to it. Data stays private; code can live on GitHub.

This file is not part of the built website (`docs/` is excluded in `_config.yml`), but the repo is public on GitHub,
so nothing private goes in here.

---

## 1. How I work (the tools stay)

| Need | Tool | Stays? |
|---|---|---|
| Brain: thinking, planning, building | Claude | Yes, the centre |
| Journal, ideation, calendar view | srijitmukherjee.com (private part, to build) | New |
| Calendar | Google Calendar | Yes, the source of truth |
| Quick ideas, collaboration | Google Docs | Yes |
| Ideating research visually | Google Slides | Yes |
| Spreadsheets | Google Sheets | Yes |
| Final papers, collaboration | Overleaf | Yes |
| Code | GitHub | Yes |
| Databases, servers | Cloudflare (Workers, D1, R2) | Yes |

**The problem to solve:** research ideas are spread across many Google Docs and Slides. They are hard to find
later and nothing connects them, so there is no second brain.

**The principle:** the OS does not replace Google, Overleaf or GitHub. It is the one place that knows where
everything is, holds what is purely mine (journal, tasks), and lets Claude read and act on it.

---

## 2. Done

### 2026-11-11: site redesign (live on srijitmukherjee.com since 2026-11-11)

Look: same brand as srijitmath.com. Inter, white / black, one accent `#e8590c`, pill buttons, the orange scribble.

- **Theme:** removed the Bay theme (`_sass/`, `assets/css/main.scss`, `assets/js/site.js`, cash.js, WeChat widget,
  icon PNGs, `title.png`, `menu.png`, the gem-release workflow `build.yml`, `bay_jekyll_theme.gemspec`).
  One stylesheet now: `assets/css/site.css`.
- **Layouts rewritten:** `default`, `home`, `work` (list pages), `blog`, `post`; includes `head`, `header`, `footer`,
  `draft-banner`.
- **Home (`index.md`):** name with scribble, tagline from my research sentence, Email / CV / Google Scholar;
  blackboard photo; the 2026 Bose Dissertation Award as a news line; research text split into 3 paragraphs
  (same words); interests as chips; Program / Group / Advisors; two cards (Publications, Teaching).
- **Publications / Teaching:** image, a short meta line (venue, place), title, description, link.
  Publications ends with "All publications on Google Scholar". Teaching kicker: "Courses & cohorts".
- **Menu:** Publications · Teaching · CV (☰ on phones). **Blog appears by itself once a listed post exists**
  (same rule as srijitmath.com).
- **Blog:** the srijitmath.com/blog reading column (720px). Posts: KaTeX maths, my citation engine
  (`{% include cite.html id="…" %}` + `_data/citation.yml`) and `<details>` pop-ups kept, now in `assets/js/post.js`.
  Tested on a throwaway post.
- **EE 350 page:** back link goes to Teaching (`back`, `back_link` front matter).
- **Fixes:** canonical / share URLs now `https://srijitmukherjee.com` (were `mukherjeesrijit.github.io`);
  share image pointed to a missing `.jpg`, now the `.png`; Google Analytics moved from the dead `analytics.js`
  to GA4 `gtag.js` (same ID, production builds only); every CV link → `Curriculum Vitae Srijit Mukherjee.pdf`
  (old PDF kept so old links work).
- **Settings:** `post_dates: false` in `_config.yml` (dates were hidden before; set `true` to show them).
- **Kept working:** GitHub Actions deploy on push to `main`; `scripts/publish_notebook.py`; all old URLs.
- **README:** how to write posts and run locally.

Pushed to `main` on 2026-11-11; the deploy succeeded and every page checked (home, publications, teaching, blog, EE 350, CV).

---

## 3. Architecture (planned)

| Part | Where | Who sees it |
|---|---|---|
| `srijitmukherjee.com`: home, publications, teaching, blog | GitHub Pages (this repo) | Everyone |
| `os.srijitmukherjee.com`: the app | Cloudflare | Only me, behind sign-in |
| My data: journal, tasks, notes, project index, drafts | Cloudflare D1 (database) + R2 (files) via a Worker | Only me |
| Claude's access to the OS | An MCP server on the same Worker | Me, through Claude |

Most of this already exists on srijitmath.com (Worker + D1 + Google sign-in + Milkdown editor + publish workflow);
reuse it, don't rebuild.

Domain DNS today: both srijitmukherjee.com and srijitmath.com use Google Domains / Squarespace DNS.

---

## 4. Plan, in order

0. **Redesign:** done and live.
1. **Base:** `os.srijitmukherjee.com`, sign-in lock, Worker + D1 + R2, nightly encrypted backup.
2. **Blog:** write privately in the OS (srijitmath's editor); **Publish** sends the post to this repo's `_posts/`
   and the public site shows it.
3. **Today page:** daily tasks + journal entry on one screen, with today's Google Calendar events beside them
   (read from Google Calendar; Google stays the source of truth for alerts and invites).
4. **Research second brain:**
   - **Projects:** one page per research project linking its Google Docs, Slides, Sheets, Overleaf project,
     GitHub repo, papers and notes.
   - **Drive index:** the OS reads my Google Drive's file list (names, dates, links, not contents unless asked)
     so every Doc and Slide is searchable and can be filed under a project.
   - **Quick capture:** one box for an idea → inbox → filed into a project.
   - **Overleaf:** linked per project; Overleaf's GitHub sync (a paid Overleaf feature) could also bring the
     `.tex` into view.
   - Papers and slides are still written in Overleaf and Google Slides. **No in-house editor** for them.
5. **Claude as the brain:** an MCP server so Claude can read and write tasks, journal, projects and the inbox; a
   nightly routine (like srijitmath's) that sums up the day, files new Drive docs into projects, and drafts
   tomorrow's plan.

---

## 5. Decisions still open

- **Move srijitmukherjee.com DNS to Cloudflare?** Recommended: free, ~10 min, GitHub Pages keeps working, and
  Cloudflare Access can lock the whole `os.` subdomain before any page loads, on top of the Worker's own email
  check. Without it, the Worker's check alone protects the data.
- **Journal encryption vs Claude reading it.** End-to-end encryption (browser encrypts with my passphrase) means
  nobody, Cloudflare included, can read the journal, **but neither can Claude**. Since Claude is the brain, choose:
  (a) not end-to-end, Claude can read it; (b) end-to-end, Claude never sees it; (c) per entry: private entries
  locked, others readable.
- **Where the OS code lives:** a new private repo (e.g. `mukherjeesrijit/os`) is suggested; the public site
  stays here.
- **Where this file lives:** here in the public repo for now; move it to the OS's private repo once that exists.
- **Google Calendar for Claude:** the Google Calendar connector needs authorizing in claude.ai connector settings.
