# srijitmukherjee.com: progress and plan

Last updated: 2026-11-12

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

### 2026-11-13: the Schedule (live)

- **srijitmukherjee.com/os/schedule/**: the paper weekly schedule (Mon–Sun, 6 AM – midnight), online.
- **Tasks:** name, project, how long, how often (once, daily, weekly, every 2 weeks, monthly, yearly), **must do**
  (can't be skipped), and **fixed** (own day and time, appears on the board by itself) or flexible.
- **To place:** under the board, every flexible task still needing a day in the shown period (must-dos first, "×7"
  for a daily task this week). Drag onto a day and time (15-minute steps, or "Any time"); drag across to move; drag
  back to take off. Click a task: done, exact time, take off, edit.
- **Views:** Week (hour grid), 2 weeks and Month (a cell a day).
- **Light:** one request per view, one small request per change, the page updates from the answer; the schedule's
  code loads only on its page. Data only in D1 (`os_tasks`, `os_plan`).
- Also: the journal's writing box only grows while typing (no page jump while editing an entry), and the phone header
  shows just "os" and the links.
- **Next:** the strategy — Claude reads the tasks and proposes the week (what goes where, what doesn't fit).

### 2026-11-13: sign in with Google (support@srijitmukherjee.com only) and a lighter OS

- **Continue with Google** on /os/ and /blog/write/. The Worker accepts only support@srijitmukherjee.com (Google
  Workspace) and refuses every other account; the browser then keeps a 90-day session (renewed as it is used).
  **Sign out** and **Sign out on all devices** on the OS home and the editor's list. The write key still works as a
  spare ("Use the key instead"). Google Cloud Console must list https://srijitmukherjee.com as an Authorized
  JavaScript origin of the OAuth client (srijitmath.com's).
- **Lighter, by the PERFORMANCE.md rules:** each OS page makes one request (projects come with the entries); entry
  counts live on the project row (never counted on read); writes and counters go in one batch; saving an entry adds it
  on the page without asking again; a session costs one small read per request and at most one write a day.

### 2026-11-13: the private OS begins: Journal and Projects (live)

- **srijitmukherjee.com/os/** (today: entries today, projects, recent entries), **/os/journal/**, **/os/projects/**.
  Only a device holding the write key (the blog's key) sees anything; to everyone else the pages are an empty lock
  screen ("Only Srijit can open this"), not indexed by search engines, no analytics.
- **The data is only in Cloudflare** (D1 `srijitmukherjee-site`: `os_journal`, `os_projects`), reached through the
  Worker. These pages in GitHub hold code only, never an entry.
- **Journal:** type a thought, pick a project (or none), Save (⌘/Ctrl + Enter). Each entry keeps its **time** (set by
  the server), the time zone it was written in, and how long it took to type. **Typed only:** pasting and dropping
  text are blocked. Entries grouped by day, filter by project (a project includes its sub-projects), search, edit
  (marked "edited"), delete. An unsaved draft stays on the device.
- **Projects:** projects inside projects (PhD Thesis → Third contribution → …), each with a name and description you
  can change at any time, move under another project, archive; only an empty project can be deleted. A project's
  page shows its sub-projects and every entry under it, with "Write about it".
- Code: pages `_layouts/os.html`, `os/`, `assets/js/os.js`, `assets/css/os.css` here; the Worker routes `/os/*` in
  `srijitmath-work/site-blog/worker/` (README there).
- **Decision taken for now** (section 5, journal encryption): option (a), not end-to-end encrypted, so Claude can read
  it later (Cloudflare encrypts D1 at rest). Can change.

### 2026-11-13: home page from the CV

Read the CV (`assets/Curriculum Vitae Srijit Mukherjee.pdf`) and rebuilt the home page from it, all in `index.md`'s
front matter (`_layouts/home.html` draws it):

- **Kicker** now "PhD Candidate · Electrical Engineering, Penn State" (the degree's name on the CV).
- **News:** five dated items (Bose award; EnSegNet-Cross preprint, under review at J Neural Eng; EE 350 TA with
  Prof. Jeffrey Schiano; Hemibrain growth, joint first author; GLAPAL-H in IEEE TBME).
- **Education** (replaces the "Penn State" facts): Ph.D. EE, Penn State 2022 – 2027, with advisors, dissertation and
  lab; Master's and Bachelor's in Statistics, ISI Kolkata, with specialization only (no projects or grades, by choice).
- **Awards:** dissertation award, three fellowships, four mathematics competitions.
- **Mentoring & service:** students mentored and NIH/NSF proposals (moved out of the Research text), reviewing (IEEE
  SPL, Sensors, CAMSAP, ICASSP), PJAS judge, Quant Finance Club instructor.
- **Publications** brought in line with the CV: GLAPAL-H dated 2026 (vol. 73 no. 1), Hemibrain marked joint first
  author, EnSegNet-Cross "under review at the Journal of Neural Engineering", and a new "In preparation" list
  (HydroGeom; DBIBD-Net).

### 2026-11-12: the blog system (live)

The same system as srijitmath.com/blog, for this site. Code: `site-blog/` in the private repo
`mukherjeesrijit/srijitmath-work` (its README has every detail).

- **Write at srijitmukherjee.com/blog/write/**: the Milkdown block editor, Markdown with `$…$` / `$$…$$` maths,
  Write / Preview / Markdown views, autosave, pictures pasted or dropped in (shrunk to WebP in the browser).
- **Only Srijit can write, with no sign-in:** a long secret **write key** held in the browser. The Worker keeps only
  its SHA-256 and refuses every request without it. The key is in the macOS Keychain ("srijitmukherjee.com blog write
  key") and the database's `vault`. Another device: "Copy a link that opens this on another device" on the editor's
  list page (a link ending in `#key=…`), or type the key on the editor's page. Visitors see "Only Srijit writes here".
- **Backend:** Cloudflare Worker `srijitmukherjee-site` (srijitmukherjee-site.srijitmath.workers.dev) and D1
  database `srijitmukherjee-site` (`blog_posts`, `blog_images`, `vault`). This is also the start of the private OS's
  backend (section 3).
- **Publish / Update / Unpublish:** the Worker starts **Publish site blog** in srijitmath-work, which builds the post
  (maths rendered in advance) into this repo: `_posts/<date>-<slug>.html` (served at `/blog/<slug>/`), the Markdown
  source in `_blog/<slug>.md`, pictures in `assets/blog/<slug>/`, and the editor in `blog/write/`. It pushes with a
  deploy key, and the site's Build and Deploy publishes it: about 2–3 minutes; the editor says when it is live.
- **On this site:** posts get the byline "date · N min read"; the Blog menu item appears once a post is published;
  on a device holding the key, Blog (to the editor), "Edit this post" and "Write" always show.
- **Not carried over:** the ❤️ (srijitmath's is for signed-in learners; this site has no reader sign-in).
- **Tested end to end** on 2026-11-12 (draft, picture, maths, build, the Worker starting the workflow, the push,
  the deploy); the test draft was deleted. No post is published yet.

### 2026-11-12: Publications rewritten

All four papers on Google Scholar, newest first, each with authors (mine in bold), venue, a short plain description
taken from its abstract, and links (paper, open access, preprint, code, arXiv): the low-field MRI volume preprint
(EnSegNet-Cross, medRxiv 2026), Hemibrain growth (J Neurosurg Pediatr 2026), GLAPAL-H (IEEE TBME 2025), and
Triangle-free projective-planar graphs (Discrete Applied Mathematics 2023). New layout `_layouts/publications.html`;
the papers live in `pages/publications.md` (front matter `papers:`). Abstracts and links checked against PubMed,
Crossref, OpenAlex and arXiv (Scholar blocks automated reading).

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
| `os.srijitmukherjee.com`: the app | Cloudflare | Only me, behind sign-in (or the write key, as the blog) |
| My data: journal, tasks, notes, project index, drafts | Cloudflare D1 (database) + R2 (files) via a Worker | Only me |
| Claude's access to the OS | An MCP server on the same Worker | Me, through Claude |

Most of this already exists on srijitmath.com (Worker + D1 + Google sign-in + Milkdown editor + publish workflow);
reuse it, don't rebuild.

Domain DNS today: both srijitmukherjee.com and srijitmath.com use Google Domains / Squarespace DNS.

---

## 4. Plan, in order

0. **Redesign:** done and live.
   **Journal + Projects:** done 2026-11-13 at /os/ (section 2), on the blog's Worker and key; the base below can grow from it.
1. **Base:** `os.srijitmukherjee.com`, sign-in lock, Worker + D1 + R2, nightly encrypted backup.
2. **Blog:** done 2026-11-12 (section 2). When the OS exists, the editor moves inside it.
   **Schedule:** done 2026-11-13 (tasks with projects, fixed and flexible, week / 2 weeks / month board).
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

---

## 6. Ideas for the site (from the CV review, 2026-11-13)

Compared with strong researcher sites (Jon Barron's widely copied page is the usual model): photo + one-line
pitch, news, research summary, education, publications with links and code, awards, service, teaching and a blog
are all here now. Still to do, most important first. **Needs from me** = what Claude needs before it can do it.

### Fix first (the CV)

- [ ] **Take the home address and phone off the public CV.** Anyone can download it from the site; most researchers
  give only email and city. *Needs from me:* a new CV PDF.
- [ ] **A permanent contact email.** szm6596@psu.edu (site + CV) stops working after graduation; use one at
  srijitmukherjee.com instead. *Needs from me:* which address.
- [ ] **Delete the old CV** `assets/MyCV_MukherjeeSrijit.pdf` (April 2026, still public) unless it should stay.
  *Needs from me:* OK to delete.
- [ ] **Small CV fixes:** "IEEE Transactions **of** Biomedical Engineering" → "**on**"; Hemibrain growth is
  published, not "(preprint)"; the site says signals "ICP, ECG", the CV says only ICP.

### Add to the site

1. [ ] **Job-market line** under the name, e.g. "On the job market for 2027: postdoc / research scientist roles"
   (Ph.D. ends Spring 2027). The most useful line a final-year Ph.D.'s site can carry. *Needs from me:* the wording
   and which roles.
2. [ ] **A teaser figure for every paper** on Publications (the GLAPAL-H figure exists:
   `assets/img/publications/glapalh.png`). *Needs from me:* one figure each for EnSegNet-Cross, Hemibrain growth,
   Triangle-free graphs.
3. [ ] **A Research page** with the two directions from the CV, each with a figure and its headline numbers:
   - Disease-informed diagnosis: GLAPAL-H (73 infants, AUC 0.92), HydroGeom (87.3% accuracy, AUC 0.88).
   - Cross-modal segmentation and brain-volume biomarkers: EnSegNet-Cross (Dice 0.85, volume score 0.93),
     Hemibrain growth (75 ESTHI-trial infants, 0.94 Dice).
   - Where it is going: histopathology grading (DBIBD-Net), ICP signal analysis.
4. [ ] **Software & demos:** Segment-Anything Live App, Annotated PDF Summary, Adaptive Learner App (on the CV).
   *Needs from me:* links (and a screenshot each).
5. [ ] **Teaching reach** on the Teaching page: the 55k+ community and 2.4k+ learners at srijitmath.com (on the
   CV). Can be done straight away.
6. [ ] **BibTeX button** on each paper (copies the citation). Can be done straight away.
7. [ ] **A short third-person bio** people can copy to introduce a talk.
8. [ ] **More profile links:** ORCID, Semantic Scholar. *Needs from me:* the profile URLs.
9. [ ] **Talks** section, once there are talks to list.
