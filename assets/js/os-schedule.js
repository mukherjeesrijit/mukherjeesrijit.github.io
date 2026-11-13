// The schedule (/os/schedule/, 2026-11-13): tasks, each in a project, placed on the week like the paper weekly
// schedule (6 AM – midnight). Fixed tasks sit on their own day and time; flexible ones wait under the board ("to place")
// until dragged onto a day (and a time, in the week view). One request per view; every change updates the page from
// the Worker's answer, with nothing fetched again.
// Loaded by os.js only on this page; `os` is os.js's toolkit (call, esc, projects, …).

const H = 44, FIRST = 6 * 60, LAST = 24 * 60; // pixels per hour; the grid's first and last minute
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const LONG_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const REPEATS = [["once", "Once"], ["daily", "Daily"], ["weekly", "Weekly"], ["biweekly", "Every 2 weeks"], ["monthly", "Monthly"], ["yearly", "Yearly"]];
const LENGTHS = [15, 30, 45, 60, 90, 120, 180, 240, 300, 360, 480];

// -- dates as YYYY-MM-DD, in this device's time zone ----------------------------------------------------------------
const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const parse = (s) => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };
const add = (s, n) => { const d = parse(s); d.setDate(d.getDate() + n); return iso(d); };
const dow = (s) => (parse(s).getDay() + 6) % 7; // 0 = Monday
const monday = (s) => add(s, -dow(s));
const weeksApart = (a, b) => Math.round((parse(b) - parse(a)) / (7 * 864e5));
const today = () => iso(new Date());
const hm = (min) => new Date(2000, 0, 1, 0, min).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
const hourLabel = (h) => `${h % 12 || 12} ${h < 12 || h === 24 ? "AM" : "PM"}`; // as on the paper: 6 AM … 11 PM
const len = (m) => m < 60 ? `${m}m` : m % 60 ? `${Math.floor(m / 60)}h ${m % 60}m` : `${m / 60}h`;
const repeatName = (r) => (REPEATS.find((x) => x[0] === r) || [, r])[1];

export async function schedulePage(os) {
  const { call, esc, $, app, local } = os;
  let view = ["week", "2weeks", "month"].includes(local.get("os_view")) ? local.get("os_view") : "week";
  let at = monday(today()); // the shown week's Monday, or the shown month's first day
  let data = { tasks: [], plan: [], placed: {} };
  let editing = null; // the task in the form, or "new"

  const range = () => view === "month"
    ? [at.slice(0, 8) + "01", iso(new Date(+at.slice(0, 4), +at.slice(5, 7), 0))]
    : [at, add(at, view === "week" ? 6 : 13)];
  const daysIn = ([a, b]) => { const out = []; for (let d = a; d <= b; d = add(d, 1)) out.push(d); return out; };
  const task = (id) => data.tasks.find((t) => t.id === id);
  const counted = (t) => t && !t.fixed && ["once", "monthly", "yearly"].includes(t.repeat); // placed-per-period kept in data.placed
  async function unplace(pid) { // take a placement off its day: it goes back to "to place"
    await call("DELETE", `/os/plan/${pid}`);
    const p = data.plan.find((x) => x.id === pid);
    data.plan = data.plan.filter((x) => x.id !== pid);
    if (p && counted(task(p.task_id))) data.placed[p.task_id] = Math.max(0, (data.placed[p.task_id] || 1) - 1);
  }

  async function load(first) {
    const [from, to] = range();
    const d = await call("GET", `/os/schedule?from=${from}&to=${to}${first ? "&projects=1" : ""}`);
    if (first) os.setProjects(d);
    data = d; draw();
  }

  // -- what happens on a day ----------------------------------------------------------------------------------------
  function fixedOn(t, d) { // does a fixed task fall on day d?
    if (!t.fixed || d < t.anchor && t.repeat !== "once" && t.repeat !== "yearly" && t.repeat !== "monthly") return false;
    switch (t.repeat) {
      case "once": return t.at_day === d;
      case "daily": return true;
      case "weekly": return String(dow(d)) === t.at_day;
      case "biweekly": return String(dow(d)) === t.at_day && weeksApart(t.anchor, monday(d)) % 2 === 0;
      case "monthly": return String(+d.slice(8)) === t.at_day;
      case "yearly": return d.slice(5) === t.at_day;
    }
    return false;
  }
  function cardsOn(d) { // fixed occurrences (with their done tick) and placed flexible ones
    const out = [];
    for (const t of data.tasks) if (fixedOn(t, d)) {
      const p = data.plan.find((x) => x.task_id === t.id && x.date === d);
      out.push({ t, date: d, start: t.at_time, done: p ? p.done : 0, plan: p || null, fixed: true });
    }
    for (const p of data.plan) {
      const t = task(p.task_id);
      if (p.date === d && t && !t.fixed) out.push({ t, date: d, start: p.start, done: p.done, plan: p, fixed: false });
    }
    return out.sort((a, b) => (a.start ?? -1) - (b.start ?? -1));
  }
  function toPlace() { // flexible tasks still needing a day in this view, and how many times
    const [from, to] = range(), days = daysIn([from, to]);
    const weeks = [...new Set(days.map(monday))];
    return data.tasks.filter((t) => !t.fixed).map((t) => {
      const here = data.plan.filter((p) => p.task_id === t.id).length;
      const need = {
        once: data.placed[t.id] ? 0 : 1,
        daily: days.filter((d) => d >= t.anchor).length - here,
        weekly: weeks.filter((w) => add(w, 6) >= t.anchor).length - here,
        biweekly: weeks.filter((w) => add(w, 6) >= t.anchor && weeksApart(t.anchor, w) % 2 === 0).length - here,
        monthly: data.placed[t.id] ? 0 : 1,
        yearly: data.placed[t.id] ? 0 : 1,
      }[t.repeat];
      return { t, n: Math.max(0, need || 0) };
    }).filter((x) => x.n > 0);
  }

  // -- drawing ------------------------------------------------------------------------------------------------------
  const projectName = (t) => t.project_id ? os.pathText(t.project_id) : "";
  function cardHTML(c, compact) {
    const t = c.t, time = c.start == null ? "Any time" : hm(c.start);
    return `<div class="card-task${t.must ? " must" : ""}${c.fixed ? " fixed" : " flex"}${c.done ? " done" : ""}"
        data-task="${t.id}" data-date="${c.date}" ${c.plan ? `data-plan="${c.plan.id}"` : ""} title="${esc(t.name)} · ${esc(projectName(t))}">
      <b>${esc(t.name)}</b><span>${compact ? `${esc(time)} · ` : ""}${len(t.minutes)}${c.fixed ? " · fixed" : ""}</span></div>`;
  }
  function weekGrid(days) {
    const now = new Date(), nowMin = now.getHours() * 60 + now.getMinutes(), t0 = today();
    const hours = []; for (let h = FIRST / 60; h < LAST / 60; h++) hours.push(h);
    const cols = days.map((d) => {
      const cards = cardsOn(d), timed = cards.filter((c) => c.start != null), any = cards.filter((c) => c.start == null);
      // side by side when they overlap
      const lanes = [];
      for (const c of timed) {
        const s = Math.max(c.start, FIRST), e = s + c.t.minutes;
        let i = lanes.findIndex((end) => end <= s); if (i < 0) { i = lanes.length; lanes.push(e); } else lanes[i] = e;
        c.lane = i; c.top = (s - FIRST) / 60 * H; c.h = Math.max(22, c.t.minutes / 60 * H - 2);
      }
      for (const c of timed) c.lanes = Math.max(1, ...timed.filter((o) => o.top < c.top + c.h && c.top < o.top + o.h).map((o) => o.lane + 1));
      return { d, any, timed };
    });
    return `<div class="week" style="--h:${H}px">
      <div class="wk-head"><span></span>${cols.map(({ d }) => `<span class="${d === t0 ? "today" : ""}">${DAYS[dow(d)]} <b>${+d.slice(8)}</b></span>`).join("")}</div>
      <div class="wk-any"><span class="wk-label">Any time</span>${cols.map(({ d, any }) =>
        `<div class="drop" data-drop="any" data-date="${d}">${any.map((c) => cardHTML(c, false)).join("")}</div>`).join("")}</div>
      <div class="wk-body"><div class="wk-hours">${hours.map((h) => `<span>${hourLabel(h)}</span>`).join("")}</div>
      ${cols.map(({ d, timed }) => `<div class="wk-col drop${d === t0 ? " today" : ""}" data-drop="time" data-date="${d}">
        ${d === t0 && nowMin >= FIRST ? `<i class="now" style="top:${(nowMin - FIRST) / 60 * H}px"></i>` : ""}
        ${timed.map((c) => cardHTML(c, false).replace('class="card-task', `style="top:${c.top}px;height:${c.h}px;left:${c.lane / c.lanes * 100}%;width:calc(${100 / c.lanes}% - 3px)" class="card-task timed`)).join("")}
      </div>`).join("")}</div></div>`;
  }
  function dayGrid(days) {
    const t0 = today(), lead = dow(days[0]);
    return `<div class="month">${DAYS.map((d) => `<span class="mo-head">${d}</span>`).join("")}
      ${"<span></span>".repeat(view === "month" ? lead : 0)}
      ${days.map((d) => `<div class="mo-day drop${d === t0 ? " today" : ""}" data-drop="day" data-date="${d}">
        <span class="mo-date">${+d.slice(8)}${+d.slice(8) === 1 || d === days[0] ? ` ${parse(d).toLocaleDateString([], { month: "short" })}` : ""}</span>
        ${cardsOn(d).map((c) => cardHTML(c, true)).join("")}</div>`).join("")}</div>`;
  }
  function title() {
    const [a, b] = range();
    if (view === "month") return parse(a).toLocaleDateString([], { month: "long", year: "numeric" });
    const f = (s, y) => parse(s).toLocaleDateString([], { day: "numeric", month: "short", ...(y ? { year: "numeric" } : {}) });
    return `${f(a)} – ${f(b, true)}`;
  }
  function trayHTML() {
    const list = toPlace(), must = list.filter((x) => x.t.must), rest = list.filter((x) => !x.t.must);
    const chip = ({ t, n }) => `<div class="chip-task${t.must ? " must" : ""}" data-task="${t.id}">
      <b>${esc(t.name)}</b><span>${len(t.minutes)} · ${esc(repeatName(t.repeat).toLowerCase())}${n > 1 ? ` · ×${n}` : ""}${t.project_id ? ` · ${esc(projectName(t))}` : ""}</span></div>`;
    return `<div class="tray drop" data-drop="tray">
      <div class="row"><h2 class="label">To place</h2><span class="grow"></span><button class="btn accent small" id="newtask">+ Task</button></div>
      ${!data.tasks.length ? `<p class="empty">Start with what can't be skipped: add each must-do task, with its project, how long it takes, and when it repeats. Fixed ones (a class, a meeting) get their own day and time.</p>` : ""}
      ${must.length ? `<p class="tray-k">Must do</p><div class="chips-task">${must.map(chip).join("")}</div>` : ""}
      ${rest.length ? `<p class="tray-k">The rest</p><div class="chips-task">${rest.map(chip).join("")}</div>` : ""}
      ${data.tasks.length && !list.length ? `<p class="empty">Everything for this ${view === "month" ? "month" : view === "week" ? "week" : "fortnight"} has a day.</p>` : ""}
      <p class="hint muted small">Drag a task onto a day${view === "week" ? " and time" : ""}; drag it back here to take it off. Click a task to tick it done or change it.</p>
    </div>`;
  }
  function allTasksHTML() {
    if (!data.tasks.length) return "";
    const byProj = new Map();
    for (const t of data.tasks) { const k = t.project_id || 0; byProj.set(k, [...(byProj.get(k) || []), t]); }
    return `<details class="all-tasks"><summary>All tasks (${data.tasks.length})</summary>
      ${[...byProj].map(([pid, ts]) => `<p class="tray-k">${esc(pid ? os.pathText(pid) : "No project")}</p><ul>${ts.map((t) =>
        `<li><button class="link" data-edit="${t.id}">${esc(t.name)}</button> <span class="muted small">${len(t.minutes)} · ${esc(repeatName(t.repeat).toLowerCase())}${t.fixed ? ` · fixed, ${esc(when(t))}` : ""}${t.must ? " · must" : ""}</span></li>`).join("")}</ul>`).join("")}</details>`;
  }
  const when = (t) => ({
    once: () => `${parse(t.at_day).toLocaleDateString([], { day: "numeric", month: "short" })} ${hm(t.at_time)}`,
    daily: () => hm(t.at_time),
    weekly: () => `${LONG_DAYS[+t.at_day]} ${hm(t.at_time)}`,
    biweekly: () => `${LONG_DAYS[+t.at_day]} ${hm(t.at_time)}`,
    monthly: () => `day ${t.at_day}, ${hm(t.at_time)}`,
    yearly: () => `${new Date(2000, +t.at_day.slice(0, 2) - 1, +t.at_day.slice(3)).toLocaleDateString([], { day: "numeric", month: "short" })} ${hm(t.at_time)}`,
  }[t.repeat] || (() => ""))();

  function draw() {
    const days = daysIn(range());
    app.innerHTML = `<header class="os-head sched-head"><div><p class="kicker">Schedule</p><h1>${esc(title())}</h1></div>
        <div class="row sched-nav">
          <div class="seg">${[["week", "Week"], ["2weeks", "2 weeks"], ["month", "Month"]].map(([v, l]) => `<button data-view="${v}"${v === view ? ' aria-pressed="true"' : ""}>${l}</button>`).join("")}</div>
          <button class="btn ghost small" data-go="-1" aria-label="Earlier">‹</button><button class="btn ghost small" data-go="0">Today</button><button class="btn ghost small" data-go="1" aria-label="Later">›</button>
        </div></header>
      <div class="board">${view === "week" ? weekGrid(days) : dayGrid(days)}</div>
      ${editing ? formHTML() : ""}
      ${trayHTML()}
      ${allTasksHTML()}`;
    if (editing) wireForm();
    if (view === "week") { const b = $(".wk-body"); if (b && !b.dataset.scrolled) { b.dataset.scrolled = 1; } }
  }

  // -- the task form ------------------------------------------------------------------------------------------------
  function formHTML() {
    const t = editing === "new" ? { name: "", project_id: Number(local.get("os_task_project")) || null, minutes: 60, repeat: "weekly", must: 0, fixed: 0, at_day: "", at_time: null } : editing;
    const time = t.at_time == null ? "" : `${String(Math.floor(t.at_time / 60)).padStart(2, "0")}:${String(t.at_time % 60).padStart(2, "0")}`;
    return `<form class="card-form task-form" id="taskform">
      <div class="row"><b>${editing === "new" ? "New task" : "Edit task"}</b><span class="grow"></span><button type="button" class="link" id="closeform">Close</button></div>
      <label>Task<input name="tname" required maxlength="200" placeholder="e.g. Write the results section"></label>
      <div class="form-grid">
        <label>Project<select name="project">${os.options(t.project_id, { none: "— choose a project —" })}</select></label>
        <label>Takes<select name="minutes">${[...new Set([...LENGTHS, t.minutes])].sort((a, b) => a - b).map((m) => `<option value="${m}"${m === t.minutes ? " selected" : ""}>${len(m)}</option>`).join("")}</select></label>
        <label>Repeats<select name="repeat">${REPEATS.map(([v, l]) => `<option value="${v}"${v === t.repeat ? " selected" : ""}>${l}</option>`).join("")}</select></label>
      </div>
      <label class="check"><input type="checkbox" name="must"${t.must ? " checked" : ""}> Must do: it can't be skipped</label>
      <label class="check"><input type="checkbox" name="fixed"${t.fixed ? " checked" : ""}> Fixed day and time (a class, a meeting); otherwise you place it each time</label>
      <div class="form-grid" id="slot"${t.fixed ? "" : " hidden"}>
        <label data-for="once yearly">Date<input type="date" name="date" value="${t.repeat === "once" ? esc(t.at_day || "") : t.repeat === "yearly" && t.at_day ? `2026-${esc(t.at_day)}` : ""}"></label>
        <label data-for="weekly biweekly">Day<select name="dow">${LONG_DAYS.map((d, i) => `<option value="${i}"${String(i) === t.at_day ? " selected" : ""}>${d}</option>`).join("")}</select></label>
        <label data-for="monthly">Day of the month<input type="number" name="dom" min="1" max="31" value="${t.repeat === "monthly" ? esc(t.at_day || "") : ""}"></label>
        <label>Time<input type="time" name="time" value="${time}" step="900"></label>
      </div>
      <div class="row"><span class="grow"></span>${editing !== "new" ? `<button type="button" class="link danger" id="deltask">Delete task</button>` : ""}
        <button class="btn accent" type="submit">${editing === "new" ? "Add task" : "Save"}</button></div>
    </form>`;
  }
  function wireForm() {
    const f = $("#taskform");
    os.typedOnly(f.tname).value = editing === "new" ? "" : editing.name;
    const slot = () => {
      $("#slot").hidden = !f.fixed.checked;
      for (const l of $("#slot").querySelectorAll("[data-for]")) l.hidden = !l.dataset.for.split(" ").includes(f.repeat.value);
    };
    f.fixed.onchange = f.repeat.onchange = slot; slot();
    f.tname.focus();
    $("#closeform").onclick = () => { editing = null; draw(); };
    if ($("#deltask")) $("#deltask").onclick = async () => {
      if (!confirm(`Delete "${editing.name}" and every time it was placed?`)) return;
      try { await call("DELETE", `/os/tasks/${editing.id}`);
        data.plan = data.plan.filter((p) => p.task_id !== editing.id); data.tasks = data.tasks.filter((t) => t.id !== editing.id);
        editing = null; draw(); } catch (x) { alert(os.say(x)); }
    };
    f.onsubmit = async (e) => {
      e.preventDefault();
      const r = f.repeat.value, fixed = f.fixed.checked;
      const [hh, mm] = (f.time.value || "").split(":").map(Number);
      const at_day = !fixed ? null : { once: f.date.value, daily: "", weekly: f.dow.value, biweekly: f.dow.value, monthly: f.dom.value, yearly: f.date.value.slice(5) }[r];
      if (!Number(f.project.value)) return alert("Choose the project this task belongs to.");
      if (fixed && (f.time.value === "" || (r !== "daily" && !at_day))) return alert("A fixed task needs its day and time.");
      const body = { name: f.tname.value, project_id: Number(f.project.value), minutes: Number(f.minutes.value), repeat: r,
        must: f.must.checked, fixed, at_day, at_time: fixed ? hh * 60 + mm : null, anchor: editing === "new" ? monday(today()) : editing.anchor };
      try {
        const d = editing === "new" ? await call("POST", "/os/tasks", body) : await call("PATCH", `/os/tasks/${editing.id}`, body);
        local.set("os_task_project", String(body.project_id));
        data.tasks = [...data.tasks.filter((t) => t.id !== d.task.id), d.task].sort((a, b) => b.must - a.must || a.name.localeCompare(b.name));
        editing = null; draw();
      } catch (x) { alert(os.say(x)); }
    };
  }

  // -- the little menu on a task ------------------------------------------------------------------------------------
  function menu(el) {
    document.querySelector(".pop")?.remove();
    const t = task(Number(el.dataset.task)), date = el.dataset.date, pid = Number(el.dataset.plan) || null;
    const p = pid ? data.plan.find((x) => x.id === pid) : null;
    const done = p ? p.done : 0, start = t.fixed ? t.at_time : p?.start;
    const pop = document.createElement("div");
    pop.className = "pop";
    pop.innerHTML = `<b>${esc(t.name)}</b><span class="muted small">${esc(projectName(t) || "No project")} · ${len(t.minutes)} · ${esc(repeatName(t.repeat).toLowerCase())}${t.must ? " · must" : ""}</span>
      <span class="small">${parse(date).toLocaleDateString([], { weekday: "long", day: "numeric", month: "short" })} · ${start == null ? "any time" : hm(start)}</span>
      <div class="pop-acts"><button class="btn small ${done ? "ghost" : "accent"}" data-a="done">${done ? "Not done" : "Done"}</button>
      ${t.fixed ? "" : `<label class="small">Time <input type="time" step="900" data-a="time" value="${start == null ? "" : `${String(Math.floor(start / 60)).padStart(2, "0")}:${String(start % 60).padStart(2, "0")}`}"></label>
        <button class="link" data-a="any">Any time</button><button class="link" data-a="off">Take off the day</button>`}
      <button class="link" data-a="edit">Edit task</button></div>`;
    document.body.append(pop);
    const r = el.getBoundingClientRect(), w = pop.offsetWidth, h = pop.offsetHeight;
    pop.style.left = Math.max(8, Math.min(innerWidth - w - 8, r.left)) + "px";
    pop.style.top = (r.bottom + h + 8 > innerHeight ? Math.max(8, r.top - h - 6) : r.bottom + 6) + "px";
    const close = () => { pop.remove(); document.removeEventListener("pointerdown", outside, true); };
    const outside = (e) => { if (!pop.contains(e.target)) close(); };
    setTimeout(() => document.addEventListener("pointerdown", outside, true));
    const save = async (patch) => {
      try {
        if (p) { const d = await call("PATCH", `/os/plan/${p.id}`, patch); Object.assign(p, d.plan); }
        else { const d = await call("POST", "/os/plan", { task_id: t.id, date, start: t.at_time, done: 1 }); data.plan.push(d.plan); }
        close(); draw();
      } catch (x) { alert(os.say(x)); }
    };
    pop.onclick = async (e) => {
      const a = e.target.dataset.a;
      if (a === "done") save({ done: !done });
      if (a === "any") save({ start: null });
      if (a === "off") { try { await unplace(p.id); close(); draw(); } catch (x) { alert(os.say(x)); } }
      if (a === "edit") { close(); editing = t; draw(); $("#taskform").scrollIntoView({ behavior: "smooth", block: "center" }); }
    };
    const ti = pop.querySelector('[data-a="time"]');
    if (ti) ti.onchange = () => { if (ti.value) { const [hh, mm] = ti.value.split(":").map(Number); save({ start: hh * 60 + mm }); } };
  }

  // -- dragging (mouse, pen and touch alike) ------------------------------------------------------------------------
  let drag = null;
  app.addEventListener("pointerdown", (e) => {
    const el = e.target.closest(".chip-task, .card-task.flex");
    if (!el || e.button > 0) return;
    drag = { el, x: e.clientX, y: e.clientY, on: false, id: e.pointerId };
  });
  addEventListener("pointermove", (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    if (!drag.on) {
      if (Math.hypot(e.clientX - drag.x, e.clientY - drag.y) < 6) return;
      drag.on = true;
      const r = drag.el.getBoundingClientRect();
      drag.ghost = Object.assign(drag.el.cloneNode(true), { className: drag.el.className + " drag-ghost" });
      drag.ghost.style.cssText = `width:${Math.min(220, r.width)}px;height:auto`;
      drag.dx = Math.min(e.clientX - r.left, 200); drag.dy = e.clientY - r.top > 40 ? 12 : e.clientY - r.top;
      document.body.append(drag.ghost); document.body.classList.add("dragging"); drag.el.classList.add("lifted");
    }
    e.preventDefault();
    drag.ghost.style.transform = `translate(${e.clientX - drag.dx}px, ${e.clientY - drag.dy}px)`;
    const target = document.elementFromPoint(e.clientX, e.clientY)?.closest("[data-drop]");
    document.querySelectorAll(".drop.over").forEach((x) => x !== target && x.classList.remove("over"));
    target?.classList.add("over");
    drag.target = target; drag.start = null;
    if (target?.dataset.drop === "time") {
      const t = task(Number(drag.el.dataset.task));
      drag.start = Math.min(LAST - 15, Math.max(FIRST, FIRST + Math.round(((e.clientY - drag.dy + 2 - target.getBoundingClientRect().top) / H * 60) / 15) * 15));
      drag.ghost.querySelector("span").textContent = `${hm(drag.start)} · ${len(t.minutes)}`;
    }
  }, { passive: false });
  addEventListener("pointerup", async (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    const d = drag; drag = null;
    if (!d.on) { if (d.el.matches(".card-task")) menu(d.el); else { editing = task(Number(d.el.dataset.task)); draw(); $("#taskform")?.scrollIntoView({ behavior: "smooth", block: "center" }); } return; }
    d.ghost.remove(); document.body.classList.remove("dragging"); d.el.classList.remove("lifted");
    document.querySelectorAll(".drop.over").forEach((x) => x.classList.remove("over"));
    const tg = d.target; if (!tg) return;
    const tid = Number(d.el.dataset.task), pid = Number(d.el.dataset.plan) || null;
    const start = tg.dataset.drop === "time" ? d.start : tg.dataset.drop === "any" ? null : undefined;
    try {
      if (tg.dataset.drop === "tray") {
        if (!pid) return;
        await unplace(pid);
      } else if (pid) {
        const r = await call("PATCH", `/os/plan/${pid}`, { date: tg.dataset.date, ...(start === undefined ? {} : { start }) });
        Object.assign(data.plan.find((x) => x.id === pid), r.plan);
      } else {
        const r = await call("POST", "/os/plan", { task_id: tid, date: tg.dataset.date, start: start === undefined ? null : start });
        data.plan.push(r.plan);
        if (counted(task(tid))) data.placed[tid] = (data.placed[tid] || 0) + 1;
      }
      draw();
    } catch (x) { alert(os.say(x)); }
  });
  addEventListener("pointercancel", () => { if (drag?.ghost) drag.ghost.remove(); document.body.classList.remove("dragging"); drag?.el.classList.remove("lifted"); drag = null; });

  // -- the controls -------------------------------------------------------------------------------------------------
  app.addEventListener("click", (e) => {
    const b = e.target.closest("button"); if (!b) return;
    if (b.dataset.view) { view = b.dataset.view; local.set("os_view", view); at = view === "month" ? at.slice(0, 8) + "01" : monday(at); load().catch((x) => alert(os.say(x))); }
    if (b.dataset.go) {
      const g = Number(b.dataset.go);
      if (!g) at = view === "month" ? today().slice(0, 8) + "01" : monday(today());
      else if (view === "month") { const d = parse(at); d.setMonth(d.getMonth() + g); at = iso(d); }
      else at = add(at, g * (view === "week" ? 7 : 14));
      load().catch((x) => alert(os.say(x)));
    }
    if (b.id === "newtask") { editing = "new"; draw(); $("#taskform").scrollIntoView({ behavior: "smooth", block: "center" }); }
    if (b.dataset.edit) { editing = task(Number(b.dataset.edit)); draw(); $("#taskform").scrollIntoView({ behavior: "smooth", block: "center" }); }
  });

  if (view === "month") at = today().slice(0, 8) + "01";
  await load(true);
}
