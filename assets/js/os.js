// Srijit's private OS (2026-11-13): /os/, /os/strategy/ (was /os/journal/, which now forwards), /os/projects/, /os/schedule/.
// These pages are empty shells: every entry and project lives only in Cloudflare D1, behind the Worker
// (srijitmath-work/site-blog/worker, routes /os/*), and comes here only for Srijit: "Continue with Google" with his
// own account (the Worker refuses every other), which leaves a session token in localStorage "sm_write_key" (shared
// with the blog editor). The older write key still works there too ("Use the key instead", or a #key=<key> link).
// Writing is typed only: pasting and dropping text are blocked in every box.
// Light (srijitmath-work/docs/PERFORMANCE.md): one request per page (?projects=1 brings the projects with the entries),
// nothing asked again after a save (the Worker returns the new entry), no Google script unless signing in.

const API = (() => { // on this Mac only (localhost), ?api=http://localhost:8799 points the pages at a test Worker
  if (location.hostname !== "localhost") return "https://srijitmukherjee-site.srijitmath.workers.dev";
  const q = new URLSearchParams(location.search).get("api");
  try { if (q) localStorage.setItem("os_api", q); return localStorage.getItem("os_api") || "https://srijitmukherjee-site.srijitmath.workers.dev"; }
  catch (e) { return q || "https://srijitmukherjee-site.srijitmath.workers.dev"; }
})();
const KEY = "sm_write_key";
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const local = {
  get: (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } },
  set: (k, v) => { try { v == null || v === "" ? localStorage.removeItem(k) : localStorage.setItem(k, v); } catch (e) { /* private window */ } },
};
{ // a device link (#key=…): keep the key on this device and take it out of the address bar at once
  const m = location.hash.match(/^#key=([0-9a-f]{64})$/);
  if (m) { local.set(KEY, m[1]); history.replaceState(null, "", location.pathname + location.search); }
}
let token = local.get(KEY);
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const page = document.body.dataset.page;
const app = $("#app"), gateEl = $("#gate");
const GOOGLE_CLIENT = "32456809169-eaoh4vgfo8usr74l1qk1it6lutacavp7.apps.googleusercontent.com";
const ERR = { key: "That key didn't work.", empty: "Nothing written yet.", name: "A project needs a name.",
  "not empty": "Only an empty project can be deleted: move or delete its entries and sub-projects first.",
  "inside itself": "A project can't go inside itself or one of its own sub-projects.", server: "The server had a problem." };
const say = (e) => ERR[e.message] || e.message || "Something went wrong.";

async function call(method, path, body) {
  let r;
  try {
    r = await fetch(API + path, { method, body: body == null ? undefined : JSON.stringify(body),
      headers: { authorization: "Bearer " + token, "content-type": "application/json" } });
  } catch (e) { throw new Error("Can't reach the server. Check the connection and try again."); }
  const d = await r.json().catch(() => ({ ok: false, error: "server" }));
  if (r.status === 401) { local.set(KEY, null); token = null; keyGate(); throw new Error("key"); }
  if (!d.ok) throw new Error(d.error || "server");
  return d;
}

// -- only Srijit: Continue with Google (his account only), or the write key ----------------------------------------
let googleReady = null;
const loadGoogle = () => googleReady ||= new Promise((ok, no) => {
  const s = Object.assign(document.createElement("script"), { src: "https://accounts.google.com/gsi/client", async: true });
  s.onload = () => ok(window.google); s.onerror = () => { googleReady = null; no(new Error("google")); };
  document.head.append(s);
});
function keyGate(err, keyOpen) {
  app.hidden = true; gateEl.hidden = false;
  gateEl.innerHTML = `<div class="gate"><p class="kicker">Private</p><h1>Only Srijit can open this</h1>
    <p class="muted">Nothing here is public. <a href="/">Go to srijitmukherjee.com →</a></p>
    <div id="gbtn" class="gbtn"></div>${err ? `<p class="err">${esc(err)}</p>` : ""}
    <details class="keyway"${keyOpen ? " open" : ""}><summary>Use the key instead</summary>
    <form id="keyform"><input id="key" type="password" autocomplete="current-password" placeholder="Write key" aria-label="Write key">
    <button class="btn" type="submit">Open</button></form></details></div>`;
  $("#keyform").onsubmit = (e) => {
    e.preventDefault();
    const v = $("#key").value.trim().toLowerCase();
    if (!/^[0-9a-f]{64}$/.test(v)) return keyGate("That isn't a write key.", true);
    local.set(KEY, v); token = v; start();
  };
  loadGoogle().then((g) => {
    if (!g.__osReady) { g.accounts.id.initialize({ client_id: GOOGLE_CLIENT, callback: onGoogle, ux_mode: "popup", auto_select: true }); g.__osReady = true; }
    g.accounts.id.renderButton($("#gbtn"), { theme: "outline", size: "large", shape: "pill", text: "continue_with", width: 280 });
  }).catch(() => { $("#gbtn").innerHTML = `<p class="err">Couldn't load Google sign-in. Reload, or use the key.</p>`; });
}
async function onGoogle(res) {
  let d = {};
  try {
    const r = await fetch(API + "/auth/google", { method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ credential: res.credential }) });
    d = await r.json().catch(() => ({}));
  } catch (e) { return keyGate("Can't reach the server. Check the connection and try again."); }
  if (!d.ok) {
    try { window.google?.accounts.id.disableAutoSelect(); } catch (e) { /* nothing to undo */ }
    return keyGate(d.error === "not owner" ? "That Google account can't open this. Only Srijit's account can." : "Google sign-in didn't work. Try again.");
  }
  local.set(KEY, d.token); token = d.token; start();
}
if (location.hostname === "localhost") window.__osGoogle = onGoogle; // testing on this Mac
async function signOut(all) {
  if (all && !confirm("Sign out on every device? Each one will need to sign in again.")) return;
  try { await call("POST", all ? "/auth/signout-all" : "/auth/signout"); } catch (e) { /* signed out here anyway */ }
  try { window.google?.accounts.id.disableAutoSelect(); } catch (e) { /* not loaded */ }
  local.set(KEY, null); token = null; keyGate();
}

// -- typed only ----------------------------------------------------------------------------------------------------
function typedOnly(el) {
  const no = (e) => {
    e.preventDefault();
    const n = el.parentElement.querySelector(".nudge") || Object.assign(document.createElement("p"), { className: "nudge" });
    n.textContent = "Type it: only your own words go here.";
    if (!n.isConnected) el.after(n);
    clearTimeout(n._t); n._t = setTimeout(() => n.remove(), 2600);
  };
  el.addEventListener("paste", no);
  el.addEventListener("drop", no);
  el.addEventListener("beforeinput", (e) => { if (/^insertFrom(Paste|Drop|Yank)/.test(e.inputType)) no(e); });
  el.setAttribute("autocomplete", "off");
  if (el.tagName === "TEXTAREA") { // grows with the writing; empty or short, the stylesheet decides its size (by screen)
    let last = 0;
    const grow = () => { // while writing it only grows (nothing moves); after deleting it is measured again, the page
      const n = el.value.length; //  held where it is (some browsers scroll to the cursor while the box is measured)
      if (n < last) {
        const y = scrollY; el.style.height = "";
        if (el.scrollHeight > el.clientHeight + 1) el.style.height = el.scrollHeight + 2 + "px";
        if (scrollY !== y) scrollTo(0, y);
      } else if (el.scrollHeight > el.clientHeight + 1) el.style.height = el.scrollHeight + 2 + "px";
      last = n;
    };
    el.addEventListener("input", grow); requestAnimationFrame(grow);
  }
  return el;
}

// -- projects: a tree ----------------------------------------------------------------------------------------------
let projects = [], byId = new Map(), me = null;
function setProjects(d) { // from any answer that carries them (one request per page)
  projects = d.projects; byId = new Map(projects.map((p) => [p.id, p])); me = d.me;
  return d;
}
const kids = (pid) => projects.filter((p) => (p.parent_id || null) === (pid || null));
function tree(pid = null, depth = 0, out = [], skip = null, archivedToo = false) { // depth-first, names in order
  for (const p of kids(pid)) {
    if (p.id === skip || (p.archived && !archivedToo)) continue;
    out.push({ p, depth });
    tree(p.id, depth + 1, out, skip, archivedToo);
  }
  return out;
}
const path = (id) => { const out = []; for (let p = byId.get(id), n = 0; p && n < 50; p = byId.get(p.parent_id), n++) out.unshift(p); return out; };
const pathText = (id) => path(id).map((p) => p.name).join(" › ");
const subtreeCount = (id) => (byId.get(id)?.entries || 0) + kids(id).reduce((s, k) => s + subtreeCount(k.id), 0);
function options(selected, { none = "No project", skip = null, archivedToo = false } = {}) {
  return `<option value="">${esc(none)}</option>` + tree(null, 0, [], skip, archivedToo).map(({ p, depth }) =>
    `<option value="${p.id}"${p.id === Number(selected) ? " selected" : ""}>${" ".repeat(depth)}${esc(p.name)}</option>`).join("");
}

// -- time ----------------------------------------------------------------------------------------------------------
const here = Intl.DateTimeFormat().resolvedOptions().timeZone;
const dayKey = (ms) => new Date(ms).toLocaleDateString("en-CA");
const dayTitle = (ms) => {
  const k = dayKey(ms), today = dayKey(Date.now()), yest = dayKey(Date.now() - 864e5);
  const d = new Date(ms).toLocaleDateString([], { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  return k === today ? `Today · ${d}` : k === yest ? `Yesterday · ${d}` : d;
};
const clock = (ms) => new Date(ms).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
const ago = (ms) => {
  const s = (Date.now() - ms) / 1000;
  if (s < 90) return "just now";
  if (s < 3600) return `${Math.round(s / 60)} min ago`;
  if (s < 86400) return `${Math.round(s / 3600)} h ago`;
  if (s < 86400 * 30) return `${Math.round(s / 86400)} d ago`;
  return new Date(ms).toLocaleDateString([], { day: "numeric", month: "short", year: "numeric" });
};
const minutes = (ms) => ms >= 60000 ? `${Math.round(ms / 60000)} min` : `${Math.max(1, Math.round(ms / 1000))} s`;

// -- Strategy: what is on his mind, by project ------------------------------------------------------------------
function entryHTML(e) {
  const tz = e.tz && e.tz !== here ? ` <span class="muted">(${esc(e.tz.split("/").pop().replace(/_/g, " "))} ${esc(new Date(e.created).toLocaleTimeString([], { hour: "numeric", minute: "2-digit", timeZone: e.tz }))})</span>` : "";
  const proj = e.project_id && byId.get(e.project_id)
    ? `<a class="chip" href="/os/projects/?id=${e.project_id}">${esc(pathText(e.project_id))}</a>` : "";
  const edited = e.updated - e.created > 60000 ? ` · <span title="${esc(new Date(e.updated).toLocaleString())}">edited</span>` : "";
  const typed = e.typed_ms ? ` · typed in ${minutes(e.typed_ms)}` : "";
  return `<article class="entry" data-id="${e.id}">
    <div class="entry-meta"><time>${clock(e.created)}</time>${tz}${typed}${edited}${proj}
      <span class="entry-actions"><button class="link" data-act="edit">Edit</button><button class="link" data-act="delete">Delete</button></span></div>
    <div class="entry-body">${esc(e.body)}</div>
  </article>`;
}
function listEntries(box, entries, append) {
  let last = append ? box.dataset.lastDay : "";
  let html = "";
  for (const e of entries) {
    const k = dayKey(e.created);
    if (k !== last) { html += `<h2 class="day">${esc(dayTitle(e.created))}</h2>`; last = k; }
    html += entryHTML(e);
  }
  box.dataset.lastDay = last;
  if (append) box.insertAdjacentHTML("beforeend", html); else box.innerHTML = html;
}
// An entry list with editing. `first` is the page's own answer (no second request); `query()` gives the filter
// (project, q, none) when it changes.
function entriesPane(box, query, empty, first) {
  let oldest = 0, shown = [];
  const cache = new Map();
  function show(d, more) {
    d.entries.forEach((e) => cache.set(e.id, e));
    shown = more ? shown.concat(d.entries) : d.entries.slice();
    if (d.entries.length) oldest = d.entries[d.entries.length - 1].created;
    const list = $(".entries", box);
    if (!shown.length) { list.innerHTML = `<p class="empty">${empty()}</p>`; list.dataset.lastDay = ""; }
    else listEntries(list, d.entries, more);
    $(".more", box).hidden = !d.more;
  }
  async function load(more) {
    const q = new URLSearchParams(query());
    if (more) q.set("before", oldest);
    show(await call("GET", "/os/strategy?" + q), more);
  }
  box.innerHTML = `<div class="entries"></div><p class="center"><button class="btn ghost more" hidden>Older entries</button></p>`;
  $(".more", box).onclick = () => load(true).catch((e) => alert(say(e)));
  box.addEventListener("click", async (ev) => {
    const b = ev.target.closest("button[data-act]");
    if (!b) return;
    const art = b.closest(".entry"), e = cache.get(Number(art.dataset.id));
    if (b.dataset.act === "delete") {
      if (!confirm("Delete this entry for good?")) return;
      try { await call("DELETE", `/os/strategy/${e.id}`); cache.delete(e.id); art.remove(); } catch (x) { alert(say(x)); }
    }
    if (b.dataset.act === "edit") {
      art.classList.add("editing");
      $(".entry-body", art).innerHTML = `<textarea class="write" rows="4"></textarea>
        <div class="row"><select class="proj" aria-label="Project">${options(e.project_id, { archivedToo: true })}</select>
        <span class="grow"></span><button class="link" data-act="cancel">Cancel</button><button class="btn small" data-act="save">Save</button></div>`;
      const t = typedOnly($("textarea", art)); t.value = e.body; t.dispatchEvent(new Event("input")); t.focus();
      $(".entry-actions", art).hidden = true;
    }
    if (b.dataset.act === "cancel") art.outerHTML = entryHTML(e);
    if (b.dataset.act === "save") {
      const body = $("textarea", art).value.trim(), project_id = Number($(".proj", art).value) || null;
      if (!body) return alert(ERR.empty);
      b.disabled = true;
      try {
        const r = await call("PATCH", `/os/strategy/${e.id}`, { body, project_id });
        Object.assign(e, { body, project_id, updated: r.updated });
        art.outerHTML = entryHTML(e);
      } catch (x) { b.disabled = false; alert(say(x)); }
    }
  });
  show(first, false);
  return {
    load: () => load(false),
    add(e) { cache.set(e.id, e); shown.unshift(e); listEntries($(".entries", box), shown, false); },
  };
}

// The writing box. Draft kept on this device until saved, so a reload loses nothing.
function composer(box, { project, onSaved }) {
  const DRAFT = "os_draft", LAST = "os_last_project";
  box.innerHTML = `<form class="compose">
    <textarea class="write" rows="5" placeholder="What are you thinking?" aria-label="Strategy entry" spellcheck="true"></textarea>
    <div class="row"><select class="proj" aria-label="Project">${options(project ?? local.get(LAST))}</select>
      <span class="grow muted small hint">${navigator.platform.includes("Mac") ? "⌘" : "Ctrl"} + Enter to save</span>
      <button class="btn accent" type="submit">Save</button></div></form>`;
  const t = typedOnly($("textarea", box)), form = $("form", box);
  let started = 0;
  t.value = local.get(DRAFT) || "";
  t.addEventListener("input", () => { if (!started && t.value) started = Date.now(); local.set(DRAFT, t.value); });
  t.addEventListener("keydown", (e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); form.requestSubmit(); } });
  form.onsubmit = async (e) => {
    e.preventDefault();
    const body = t.value.trim();
    if (!body) return t.focus();
    const project_id = Number($(".proj", box).value) || null, btn = $("button[type=submit]", box);
    btn.disabled = true; btn.textContent = "Saving…";
    try {
      const r = await call("POST", "/os/strategy", { body, project_id, tz: here, typed_ms: started ? Date.now() - started : null });
      t.value = ""; started = 0; local.set(DRAFT, null); local.set(LAST, project_id ? String(project_id) : null);
      t.dispatchEvent(new Event("input"));
      onSaved(r.entry);
    } catch (x) { alert(say(x)); }
    btn.disabled = false; btn.textContent = "Save";
  };
  return t;
}

async function strategyPage() {
  const q = new URLSearchParams(location.search), pre = Number(q.get("project")) || null;
  const first = setProjects(await call("GET", `/os/strategy?projects=1${pre ? `&project=${pre}` : ""}`));
  app.innerHTML = `<header class="os-head"><p class="kicker">Strategy</p><h1>What's on your mind</h1></header>
    <div id="compose"></div>
    <div class="filters row"><select id="filter" aria-label="Show entries from">
      <option value="">All entries</option><option value="none">No project</option>
      ${tree(null, 0, [], null, true).map(({ p, depth }) => `<option value="${p.id}">${" ".repeat(depth)}${esc(p.name)}</option>`).join("")}
    </select><input id="search" type="search" placeholder="Search your entries" aria-label="Search"></div>
    <div id="list"></div>`;
  const filter = $("#filter"), search = $("#search");
  if (pre && byId.has(pre)) filter.value = String(pre);
  const pane = entriesPane($("#list"), () => {
    const o = {};
    if (filter.value === "none") o.none = 1; else if (filter.value) o.project = filter.value;
    if (search.value.trim()) o.q = search.value.trim();
    return o;
  }, () => search.value.trim() || filter.value ? "No entries match." : "Nothing yet. Your first entry will appear here, with its time.", first);
  const t = composer($("#compose"), { project: pre, onSaved: (e) => { // show it at once if the list would include it
    const f = filter.value;
    if (!search.value.trim() && (!f || (f === "none" ? !e.project_id : path(e.project_id).some((p) => p.id === Number(f))))) pane.add(e);
  } });
  filter.onchange = () => {
    const u = new URL(location.href);
    filter.value && filter.value !== "none" ? u.searchParams.set("project", filter.value) : u.searchParams.delete("project");
    history.replaceState(null, "", u);
    pane.load().catch((e) => alert(say(e)));
  };
  let timer; search.oninput = () => { clearTimeout(timer); timer = setTimeout(() => pane.load().catch((e) => alert(say(e))), 400); };
  t.focus();
}

// -- projects ------------------------------------------------------------------------------------------------------
function projectRow({ p, depth }) {
  const n = subtreeCount(p.id);
  return `<li class="proj-row${p.archived ? " archived" : ""}" style="--d:${depth}">
    <a href="/os/projects/?id=${p.id}"><b>${esc(p.name)}</b>
    ${p.description ? `<span class="desc">${esc(p.description.split("\n")[0].slice(0, 160))}</span>` : ""}</a>
    <span class="count">${n ? `${n} ${n === 1 ? "entry" : "entries"}` : ""}${p.last_entry ? ` · ${ago(p.last_entry)}` : ""}</span></li>`;
}
function newProjectForm(parent) {
  return `<details class="new-proj"${parent ? "" : " open"}><summary class="btn ghost small">+ New ${parent ? "sub-project" : "project"}</summary>
    <form class="card-form" id="newproj">
      <label>Name<input name="pname" required maxlength="200" placeholder="e.g. PhD Thesis"></label>
      <label>Inside<select name="parent">${options(parent, { none: "— top level —" })}</select></label>
      <label>Description<textarea name="description" rows="3" placeholder="What is this project about?"></textarea></label>
      <div class="row"><span class="grow"></span><button class="btn accent" type="submit">Create</button></div>
    </form></details>`;
}
function wireNewProject(after) {
  const f = $("#newproj");
  if (!f) return;
  typedOnly(f.pname); typedOnly(f.description);
  f.onsubmit = async (e) => {
    e.preventDefault();
    try {
      const r = await call("POST", "/os/projects", { name: f.pname.value, description: f.description.value, parent_id: Number(f.parent.value) || null });
      after(r.id);
    } catch (x) { alert(say(x)); }
  };
}

async function projectsPage() {
  const id = Number(new URLSearchParams(location.search).get("id"));
  if (id) return projectPage(id);
  setProjects(await call("GET", "/os/projects"));
  const live = tree(), archived = tree(null, 0, [], null, true).filter(({ p }) => p.archived && !byId.get(p.parent_id)?.archived);
  app.innerHTML = `<header class="os-head"><p class="kicker">Projects</p><h1>Projects</h1>
    <p class="muted">Projects inside projects: a thesis, its contributions, their pieces. Each has a description and its own Strategy entries.</p></header>
    ${newProjectForm(null)}
    ${live.length ? `<ul class="proj-tree">${live.map(projectRow).join("")}</ul>` : `<p class="empty">No projects yet. Create the first one above.</p>`}
    ${archived.length ? `<details class="archived-list"><summary>Archived (${archived.length})</summary><ul class="proj-tree">${archived.map(({ p }) => projectRow({ p, depth: 0 })).join("")}</ul></details>` : ""}`;
  if (live.length) $(".new-proj").open = false;
  wireNewProject((nid) => go(`/os/projects/?id=${nid}`));
}

async function projectPage(id) {
  const first = setProjects(await call("GET", `/os/strategy?projects=1&project=${id}`));
  const p = byId.get(id), crumbs = path(id);
  if (!p) { history.replaceState(null, "", "/os/projects/"); return projectsPage(); }
  app.innerHTML = `<nav class="crumbs"><a href="/os/projects/">Projects</a>${crumbs.slice(0, -1).map((c) => ` › <a href="/os/projects/?id=${c.id}">${esc(c.name)}</a>`).join("")}</nav>
    <header class="os-head">
      <p class="kicker">Project${p.archived ? " · archived" : ""}</p>
      <h1 id="pname">${esc(p.name)}</h1>
      <div id="pdesc" class="pdesc">${p.description ? esc(p.description) : `<span class="muted">No description yet.</span>`}</div>
      <div class="row tools"><button class="link" id="editp">Rename / describe / move</button>
        <button class="link" id="archp">${p.archived ? "Unarchive" : "Archive"}</button>
        <button class="link danger" id="delp">Delete</button>
        <span class="grow"></span><a class="btn accent small" href="/os/strategy/?project=${id}">Write about it</a></div>
    </header>
    ${kids(id).length ? `<section><h2 class="label">Inside</h2><ul class="proj-tree">${tree(id, 0, [], null, true).map(projectRow).join("")}</ul></section>` : ""}
    ${newProjectForm(id)}
    <section><h2 class="label">Strategy</h2><div id="list"></div></section>`;
  wireNewProject((nid) => go(`/os/projects/?id=${nid}`));
  $("#editp").onclick = () => {
    $("#editp").closest(".os-head").innerHTML = `<p class="kicker">Edit project</p><form class="card-form" id="pform">
      <label>Name<input name="pname" required maxlength="200"></label>
      <label>Inside<select name="parent">${options(p.parent_id, { none: "— top level —", skip: id, archivedToo: true })}</select></label>
      <label>Description<textarea name="description" rows="5"></textarea></label>
      <div class="row"><span class="grow"></span><a class="link" href="/os/projects/?id=${id}">Cancel</a><button class="btn accent" type="submit">Save</button></div></form>`;
    const f = $("#pform");
    typedOnly(f.pname).value = p.name; typedOnly(f.description).value = p.description; f.description.dispatchEvent(new Event("input"));
    f.pname.focus();
    f.onsubmit = async (e) => {
      e.preventDefault();
      try {
        await call("PATCH", `/os/projects/${id}`, { name: f.pname.value, description: f.description.value, parent_id: Number(f.parent.value) || null });
        projectPage(id);
      } catch (x) { alert(say(x)); }
    };
  };
  $("#archp").onclick = async () => {
    try { await call("PATCH", `/os/projects/${id}`, { archived: !p.archived }); projectPage(id); } catch (x) { alert(say(x)); }
  };
  $("#delp").onclick = async () => {
    if (!confirm(`Delete the project "${p.name}"? Only an empty project can be deleted.`)) return;
    try { await call("DELETE", `/os/projects/${id}`); go("/os/projects/"); } catch (x) { alert(say(x)); }
  };
  entriesPane($("#list"), () => ({ project: id }), () => "No entries yet. Press “Write about it”.", first);
}

// -- home ----------------------------------------------------------------------------------------------------------
async function homePage() {
  const d = setProjects(await call("GET", "/os/strategy?projects=1&limit=10"));
  const today = d.entries.filter((e) => dayKey(e.created) === dayKey(Date.now())).length;
  const hour = new Date().getHours();
  app.innerHTML = `<header class="os-head"><p class="kicker">${esc(new Date().toLocaleDateString([], { weekday: "long", day: "numeric", month: "long", year: "numeric" }))}</p>
      <h1>Good ${hour < 12 ? "morning" : hour < 17 ? "afternoon" : "evening"}, Srijit</h1></header>
    <div class="os-cards">
      <a class="os-card" href="/os/strategy/"><span class="kicker">Strategy</span><b>${today ? `${today}${today === d.entries.length && d.more ? "+" : ""} ${today === 1 ? "entry" : "entries"} today` : "Write today's first entry"}</b>
        <span class="muted">${d.entries.length ? `Last written ${ago(d.entries[0].created)}` : "Nothing written yet"}</span></a>
      <a class="os-card" href="/os/projects/"><span class="kicker">Projects</span><b>${projects.filter((p) => !p.archived).length} projects</b>
        <span class="muted">${esc(tree().filter(({ depth }) => depth === 0).slice(0, 4).map(({ p }) => p.name).join(" · ")) || "Create your first project"}</span></a>
    </div>
    ${d.entries.length ? `<section><h2 class="label">Recent</h2><div class="entries"></div></section>` : ""}
    <p class="who">${me.via === "google" ? `Signed in as ${esc(me.email)}` : "Opened with the write key"} ·
      <button class="link" id="signout">Sign out</button> · <button class="link" id="signoutall">Sign out on all devices</button></p>`;
  $("#signout").onclick = () => signOut(false);
  $("#signoutall").onclick = () => signOut(true);
  if (d.entries.length) {
    const box = $(".entries");
    listEntries(box, d.entries.slice(0, 5), false);
    $$(".entry-actions", box).forEach((a) => a.remove());
  }
}

// -- what the schedule page (os-schedule.js, loaded only there) uses from here --------------------------------------
const toolkit = { call, esc, $, app, local, typedOnly, options, say, pathText: (id) => pathText(id), setProjects: (d) => setProjects(d) };

// -- start ---------------------------------------------------------------------------------------------------------
function go(href) { history.pushState(null, "", href); render(); }
async function render() {
  window.scrollTo(0, 0);
  try {
    if (page === "strategy") await strategyPage();
    else if (page === "schedule") await (await import(`./os-schedule.js?v=${document.body.dataset.v}`)).schedulePage(toolkit);
    else if (page === "projects") await projectsPage();
    else await homePage();
  } catch (e) { if (e.message !== "key") app.innerHTML = `<p class="err">${esc(say(e))}</p>`; }
}
async function start() { // no separate check: the page's one request says whether this browser may see it
  if (!token) return keyGate();
  gateEl.hidden = true; app.hidden = false;
  await render();
}
window.addEventListener("popstate", () => token && render());
document.addEventListener("click", (e) => { // move between projects without reloading
  const a = e.target.closest("a[href^='/os/projects/']");
  if (!a || page !== "projects" || e.metaKey || e.ctrlKey || e.shiftKey) return;
  e.preventDefault(); go(a.getAttribute("href"));
});
start();
