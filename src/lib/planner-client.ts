// Browser side of the skill planner. Reads the tree from #planner-data and renders it as SVG.
type SkillType = { name: string; cost: number; maxLevel: number; color: string; stats: Record<string, number> | null; levels: string[] };
type Node = { t: string; x: number; y: number; base?: number; ba?: [number, number]; r: string };
type Data = {
  tree: { leveling: { playerLevelCap: number; skillPointsPerLevel: number }; regions: Record<string, string>; types: Record<string, SkillType>; nodes: Record<string, Node>; edges: [string, string][] };
  biomes: { id: string; name: string; points: number }[];
  regionLabel: Record<string, string>;
  presets: { slug: string; name: string; code: string }[];
};

const NS = "http://www.w3.org/2000/svg";
const TREE_COLOR: Record<string, string> = { mage: "#6f9bff", warrior: "#e45a4f", ranger: "#5fbf6a", core: "#e3b55a" };
const STAT_NAME: Record<string, string> = { CONS: "Constitution", STR: "Strength", DEX: "Dexterity", ENDURANCE: "Endurance", INT: "Intelligence", SPIRIT: "Spirit" };
const STORAGE_KEY = "eb-planner-build";

const svgEl = <K extends keyof SVGElementTagNameMap>(tag: K, attrs: Record<string, string | number> = {}) => {
  const el = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, String(v));
  return el;
};
const escapeHtml = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

export function initPlanner() {
  const data: Data = JSON.parse(document.getElementById("planner-data")!.textContent!);
  const { tree } = data;
  const ids = Object.keys(tree.nodes);
  const adj: Record<string, string[]> = Object.fromEntries(ids.map((id) => [id, []]));
  for (const [a, b] of tree.edges) { adj[a].push(b); adj[b].push(a); }
  const typeOf = (id: string) => tree.types[tree.nodes[id].t];
  const treeOf = (id: string) => (tree.nodes[id].r === "core" ? "core" : tree.regions[tree.nodes[id].r]);

  let sel: Record<string, number> = {};
  let level = tree.leveling.playerLevelCap;
  const biomeChecks = [...document.querySelectorAll<HTMLInputElement>("input.biome")];

  const available = () =>
    Math.max(0, level - 1) * tree.leveling.skillPointsPerLevel +
    biomeChecks.filter((c) => c.checked).reduce((a, c) => a + (data.biomes.find((b) => b.id === c.value)?.points ?? 0), 0);
  const used = () => Object.entries(sel).reduce((a, [id, l]) => a + typeOf(id).cost * l, 0);
  const canTake = (id: string) => !sel[id] && (tree.nodes[id].base || adj[id].some((n) => sel[n]));

  /** True if every selected node is still connected to the base ring without `without`. */
  const connected = (s: Record<string, number>) => {
    const seen = new Set<string>();
    const stack = Object.keys(s).filter((id) => tree.nodes[id].base);
    stack.forEach((id) => seen.add(id));
    while (stack.length) { const cur = stack.pop()!; for (const n of adj[cur]) if (s[n] && !seen.has(n)) { seen.add(n); stack.push(n); } }
    return Object.keys(s).every((id) => seen.has(id));
  };

  const encode = () => Object.entries(sel).filter(([, l]) => l > 0).sort((a, b) => +a[0] - +b[0]).map(([id, l]) => (+id).toString(36).padStart(2, "0") + l).join("");
  const decode = (code: string) => {
    const out: Record<string, number> = {};
    for (let i = 0; i + 3 <= code.length; i += 3) {
      const id = String(parseInt(code.slice(i, i + 2), 36));
      const lvl = Number(code[i + 2]);
      if (tree.nodes[id] && lvl >= 1) out[id] = Math.min(lvl, typeOf(id).maxLevel);
    }
    // Drop anything not connected to the base ring (old or hand-edited links).
    const seen = new Set<string>(); const stack = Object.keys(out).filter((id) => tree.nodes[id].base);
    stack.forEach((id) => seen.add(id));
    while (stack.length) { const cur = stack.pop()!; for (const n of adj[cur]) if (out[n] && !seen.has(n)) { seen.add(n); stack.push(n); } }
    return Object.fromEntries(Object.entries(out).filter(([id]) => seen.has(id)));
  };

  // ---------- SVG scene ----------
  const svg = document.getElementById("tree") as unknown as SVGSVGElement;
  const defs = svgEl("defs");
  defs.innerHTML = `<radialGradient id="pl-center"><stop offset="0" stop-color="#ffcf7a" stop-opacity=".55"/><stop offset=".6" stop-color="#b2457f" stop-opacity=".18"/><stop offset="1" stop-color="#0c0a10" stop-opacity="0"/></radialGradient>
    <filter id="pl-glow" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>`;
  svg.appendChild(defs);
  const vp = svgEl("g");
  svg.appendChild(vp);
  vp.appendChild(svgEl("circle", { cx: 0, cy: 0, r: 260, fill: "url(#pl-center)" }));
  vp.appendChild(svgEl("circle", { cx: 0, cy: 0, r: 198, fill: "none", stroke: "#f3a73b", "stroke-opacity": 0.35, "stroke-width": 2, "stroke-dasharray": "4 7" }));
  const flame = svgEl("path", { d: "M0-70c12 36 48 48 48 96a48 48 0 0 1-96 0c0-24 12-36 24-48 0 18 6 30 18 30C-12 48 0 24 0-70z", fill: "#f3a73b", opacity: 0.22 });
  vp.appendChild(flame);

  // Region labels at the outer edge of each region.
  const regionPts: Record<string, { x: number; y: number; n: number; max: number }> = {};
  for (const id of ids) {
    const n = tree.nodes[id]; if (n.r === "core") continue;
    const p = (regionPts[n.r] ??= { x: 0, y: 0, n: 0, max: 0 });
    p.x += n.x; p.y += n.y; p.n++; p.max = Math.max(p.max, Math.hypot(n.x, n.y));
  }
  for (const [r, p] of Object.entries(regionPts)) {
    const a = Math.atan2(p.y / p.n, p.x / p.n); const d = p.max + 70;
    const t = svgEl("text", { x: Math.cos(a) * d, y: Math.sin(a) * d, "text-anchor": "middle", "dominant-baseline": "middle", fill: TREE_COLOR[tree.regions[r]], opacity: 0.75, "font-family": "Cinzel, serif", "font-size": 30, "font-weight": 700, "letter-spacing": 3 });
    t.textContent = data.regionLabel[r].toUpperCase();
    vp.appendChild(t);
  }

  const edgeEls: { a: string; b: string; el: SVGLineElement }[] = [];
  const edgeLayer = svgEl("g"); vp.appendChild(edgeLayer);
  for (const id of ids) {
    const n = tree.nodes[id]; if (!n.base) continue;
    const len = Math.hypot(n.x, n.y) || 1;
    const [ax, ay] = n.ba ?? [n.x / len * 198, n.y / len * 198];
    const el = svgEl("line", { x1: ax, y1: ay, x2: n.x, y2: n.y, "stroke-width": 4, "stroke-linecap": "round" });
    edgeLayer.appendChild(el); edgeEls.push({ a: id, b: "", el });
  }
  for (const [a, b] of tree.edges) {
    const el = svgEl("line", { x1: tree.nodes[a].x, y1: tree.nodes[a].y, x2: tree.nodes[b].x, y2: tree.nodes[b].y, "stroke-width": 4, "stroke-linecap": "round" });
    edgeLayer.appendChild(el); edgeEls.push({ a, b, el });
  }

  const nodeEls: Record<string, { g: SVGGElement; ring: SVGCircleElement; core: SVGCircleElement; label: SVGTextElement }> = {};
  const nodeLayer = svgEl("g"); vp.appendChild(nodeLayer);
  for (const id of ids) {
    const n = tree.nodes[id]; const t = typeOf(id);
    const r = t.stats ? 10 : t.cost >= 4 ? 19 : 15;
    const g = svgEl("g", { transform: `translate(${n.x} ${n.y})`, "data-id": id, class: "pl-node", tabindex: 0, role: "button", "aria-label": t.name, style: "cursor:pointer;outline:none" });
    const ring = svgEl("circle", { r: r + 4, fill: "none", "stroke-width": 3 });
    const core = svgEl("circle", { r, "stroke-width": 2 });
    const label = svgEl("text", { y: r + 17, "text-anchor": "middle", "font-size": 13, "font-family": "Alegreya Sans, sans-serif", fill: "#ece3cf" });
    if (t.stats || t.cost >= 4) {
      // keystones and attributes get a diamond marker so they read differently from regular skills
      const m = svgEl("rect", { x: -4, y: -4, width: 8, height: 8, transform: "rotate(45)", fill: "#0c0a10", opacity: 0.7, "pointer-events": "none" });
      g.append(ring, core, m, label);
    } else g.append(ring, core, label);
    nodeLayer.appendChild(g);
    nodeEls[id] = { g, ring, core, label };
  }

  // ---------- view (pan / zoom) ----------
  const view = { x: -900, y: -900, w: 1800, h: 1800 };
  const applyView = () => svg.setAttribute("viewBox", `${view.x} ${view.y} ${view.w} ${view.h}`);
  const fit = () => {
    const rect = svg.getBoundingClientRect(); const aspect = rect.width / Math.max(1, rect.height);
    const size = 1900; if (aspect >= 1) { view.h = size; view.w = size * aspect; } else { view.w = size; view.h = size / aspect; }
    view.x = -view.w / 2; view.y = -view.h / 2; applyView();
  };
  const zoomAt = (factor: number, cx: number, cy: number) => {
    const nw = Math.min(4000, Math.max(300, view.w / factor)); const k = nw / view.w;
    view.x = cx - (cx - view.x) * k; view.y = cy - (cy - view.y) * k; view.w = nw; view.h *= k; applyView();
  };
  const toWorld = (clientX: number, clientY: number) => {
    const rect = svg.getBoundingClientRect();
    return { x: view.x + (clientX - rect.left) / rect.width * view.w, y: view.y + (clientY - rect.top) / rect.height * view.h };
  };
  svg.addEventListener("wheel", (e) => { e.preventDefault(); const p = toWorld(e.clientX, e.clientY); zoomAt(e.deltaY < 0 ? 1.15 : 1 / 1.15, p.x, p.y); }, { passive: false });
  document.querySelectorAll<HTMLButtonElement>("[data-zoom]").forEach((b) => b.addEventListener("click", () => {
    const f = Number(b.dataset.zoom); if (!f) fit(); else zoomAt(f, view.x + view.w / 2, view.y + view.h / 2);
  }));

  const pointers = new Map<number, { x: number; y: number }>();
  let drag: { x: number; y: number; vx: number; vy: number; moved: boolean } | null = null;
  let pinch: { d: number } | null = null;
  let pressTimer = 0; let longPressed = false; let pressNode: string | null = null;
  svg.addEventListener("pointerdown", (e) => {
    svg.setPointerCapture(e.pointerId);
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.size === 2) { const [p1, p2] = [...pointers.values()]; pinch = { d: Math.hypot(p1.x - p2.x, p1.y - p2.y) }; drag = null; clearTimeout(pressTimer); return; }
    drag = { x: e.clientX, y: e.clientY, vx: view.x, vy: view.y, moved: false };
    pressNode = (e.target as Element).closest(".pl-node")?.getAttribute("data-id") ?? null;
    longPressed = false;
    if (pressNode && e.pointerType !== "mouse") pressTimer = window.setTimeout(() => { longPressed = true; if (pressNode) removeLevel(pressNode); }, 500);
  });
  svg.addEventListener("pointermove", (e) => {
    if (!pointers.has(e.pointerId)) return;
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pinch && pointers.size === 2) {
      const [p1, p2] = [...pointers.values()]; const d = Math.hypot(p1.x - p2.x, p1.y - p2.y);
      const mid = toWorld((p1.x + p2.x) / 2, (p1.y + p2.y) / 2); zoomAt(d / pinch.d, mid.x, mid.y); pinch.d = d; return;
    }
    if (!drag) return;
    const rect = svg.getBoundingClientRect();
    const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    if (Math.hypot(dx, dy) > 6) { drag.moved = true; clearTimeout(pressTimer); svg.classList.add("cursor-grabbing"); }
    if (drag.moved) { view.x = drag.vx - dx / rect.width * view.w; view.y = drag.vy - dy / rect.height * view.h; applyView(); }
  });
  const endPointer = (e: PointerEvent) => {
    pointers.delete(e.pointerId); clearTimeout(pressTimer); svg.classList.remove("cursor-grabbing");
    if (pointers.size < 2) pinch = null;
    if (drag && !drag.moved && pressNode && !longPressed && e.type === "pointerup") {
      if (e.button === 2 || e.shiftKey) removeLevel(pressNode); else addLevel(pressNode);
      showTip(pressNode, e.clientX, e.clientY);
    }
    drag = null; pressNode = null;
  };
  svg.addEventListener("pointerup", endPointer);
  svg.addEventListener("pointercancel", endPointer);
  svg.addEventListener("contextmenu", (e) => e.preventDefault());
  svg.addEventListener("keydown", (e) => {
    const id = (e.target as Element).closest(".pl-node")?.getAttribute("data-id"); if (!id) return;
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); addLevel(id); }
    if (e.key === "Backspace" || e.key === "Delete") { e.preventDefault(); removeLevel(id); }
  });

  // ---------- tooltip ----------
  const tip = document.getElementById("tip")!;
  const stage = document.getElementById("stage")!;
  const showTip = (id: string, clientX: number, clientY: number) => {
    const t = typeOf(id); const lvl = sel[id] ?? 0;
    const lines = t.levels.map((txt, i) => `<p class="${i + 1 === lvl ? "text-parchment" : "text-mist"} mt-1">${t.maxLevel > 1 ? `<span class="text-flame">Lv ${i + 1}:</span> ` : ""}${escapeHtml(txt)}</p>`).join("");
    tip.innerHTML = `<p class="font-display text-parchment">${escapeHtml(t.name)}</p><p class="text-xs text-flame uppercase tracking-wider">${escapeHtml(data.regionLabel[tree.nodes[id].r])} · ${t.cost} pt${t.cost > 1 ? "s" : ""}${t.maxLevel > 1 ? ` per level · ${lvl}/${t.maxLevel}` : lvl ? " · taken" : ""}</p>${lines}`;
    tip.classList.remove("hidden");
    const rect = stage.getBoundingClientRect();
    const x = Math.min(clientX - rect.left + 16, rect.width - tip.offsetWidth - 8);
    const y = Math.min(clientY - rect.top + 16, rect.height - tip.offsetHeight - 8);
    tip.style.left = `${Math.max(8, x)}px`; tip.style.top = `${Math.max(8, y)}px`;
  };
  nodeLayer.addEventListener("pointerover", (e) => {
    if ((e as PointerEvent).pointerType !== "mouse") return;
    const id = (e.target as Element).closest(".pl-node")?.getAttribute("data-id"); if (id) showTip(id, (e as PointerEvent).clientX, (e as PointerEvent).clientY);
  });
  nodeLayer.addEventListener("pointerout", (e) => { if ((e as PointerEvent).pointerType === "mouse") tip.classList.add("hidden"); });
  stage.addEventListener("pointerdown", (e) => {
    const el = e.target as Element;
    if (!el.closest(".pl-node")) tip.classList.add("hidden");
    if (!el.closest("#searchResults") && el.id !== "search") searchResults.classList.add("hidden");
  });

  // ---------- actions ----------
  let flashTimer = 0;
  const pointNodes = (name: string) => [...document.querySelectorAll<HTMLElement>(`[data-points=${name}]`)];
  const flash = (msg: string) => {
    for (const el of pointNodes("msg")) { el.textContent = msg; el.classList.remove("hidden"); }
    clearTimeout(flashTimer); flashTimer = window.setTimeout(render, 1800);
  };
  function addLevel(id: string) {
    const t = typeOf(id); const lvl = sel[id] ?? 0;
    if (lvl >= t.maxLevel) return;
    if (!lvl && !canTake(id)) return flash("Connect this skill to one you already have first.");
    if (used() + t.cost > available()) return flash("Not enough skill points for this level.");
    sel = { ...sel, [id]: lvl + 1 }; render();
  }
  function removeLevel(id: string) {
    const lvl = sel[id] ?? 0; if (!lvl) return;
    const next = { ...sel };
    if (lvl > 1) next[id] = lvl - 1; else delete next[id];
    if (!connected(next)) return flash("Other selected skills depend on this one.");
    sel = next; render();
  }

  // ---------- render ----------
  const search = document.getElementById("search") as HTMLInputElement;
  const persist = () => {
    const code = encode();
    const url = new URL(location.href);
    if (code) url.searchParams.set("b", code); else url.searchParams.delete("b");
    if (guide) url.searchParams.set("g", guide); else url.searchParams.delete("g");
    history.replaceState(null, "", url);
    try { localStorage.setItem(STORAGE_KEY, code); } catch { /* storage may be unavailable */ }
  };
  function render() {
    const q = search.value.trim().toLowerCase();
    for (const id of ids) {
      const { g, ring, core, label } = nodeEls[id]; const t = typeOf(id); const color = TREE_COLOR[treeOf(id)];
      const lvl = sel[id] ?? 0; const open = canTake(id);
      const match = q && (t.name.toLowerCase().includes(q) || t.levels.some((l) => l.toLowerCase().includes(q)));
      core.setAttribute("fill", lvl ? color : open ? "#2c2433" : "#17121d");
      core.setAttribute("stroke", lvl ? "#fff3d6" : open ? color : "#3a3042");
      ring.setAttribute("stroke", match ? "#ffffff" : lvl ? color : "transparent");
      ring.setAttribute("stroke-dasharray", match && !lvl ? "4 4" : "");
      g.setAttribute("filter", lvl ? "url(#pl-glow)" : "");
      g.style.opacity = q && !match ? "0.25" : lvl || open ? "1" : "0.55";
      label.textContent = t.maxLevel > 1 && lvl ? `${lvl}/${t.maxLevel}` : "";
    }
    for (const { a, b, el } of edgeEls) {
      const on = b ? sel[a] && sel[b] : sel[a];
      const color = TREE_COLOR[treeOf(a)];
      el.setAttribute("stroke", on ? color : "#3a3042"); el.setAttribute("stroke-opacity", on ? "0.95" : "0.6");
    }
    const u = used(); const av = available();
    for (const el of pointNodes("used")) el.textContent = String(u);
    for (const el of pointNodes("avail")) el.textContent = String(av);
    const pct = `${Math.min(100, av ? (u / av) * 100 : 0)}%`;
    for (const el of pointNodes("bar")) el.style.width = pct;
    const overText = u > av ? `Over budget by ${u - av} points for this level.` : "";
    for (const el of pointNodes("msg")) { el.textContent = overText; el.classList.toggle("hidden", !overText); }
    document.getElementById("levelOut")!.textContent = String(level);

    const stats: Record<string, number> = {};
    for (const [id, l] of Object.entries(sel)) { const s = typeOf(id).stats; if (s) for (const [k, v] of Object.entries(s)) stats[k] = (stats[k] ?? 0) + v * l; }
    document.getElementById("attrs")!.innerHTML = Object.keys(STAT_NAME).map((k) => `<div class="flex justify-between gap-2"><dt class="text-ash">${STAT_NAME[k]}</dt><dd class="text-parchment font-display">+${stats[k] ?? 0}</dd></div>`).join("");

    const byType = new Map<string, { lvl: number; cost: number; id: string }>();
    for (const [id, l] of Object.entries(sel)) { const k = tree.nodes[id].t; const e = byType.get(k) ?? { lvl: 0, cost: 0, id }; e.lvl += l; e.cost += typeOf(id).cost * l; byType.set(k, e); }
    const rows = [...byType.entries()].sort((a, b) => tree.nodes[a[1].id].r.localeCompare(tree.nodes[b[1].id].r) || tree.types[a[0]].name.localeCompare(tree.types[b[0]].name));
    document.getElementById("count")!.textContent = rows.length ? `(${rows.length})` : "";
    document.getElementById("list")!.innerHTML = rows.length
      ? rows.map(([k, e]) => `<li class="flex justify-between gap-2"><span><span style="color:${TREE_COLOR[treeOf(e.id)]}">◆</span> ${escapeHtml(tree.types[k].name)}${tree.types[k].stats ? ` ×${e.lvl}` : tree.types[k].maxLevel > 1 ? ` <span class="text-mist">${e.lvl}/${tree.types[k].maxLevel}</span>` : ""}</span><span class="text-mist">${e.cost} pt</span></li>`).join("")
      : `<li class="text-mist">Nothing yet. Click a node on the inner ring to start.</li>`;
    persist();
    renderSearchResults();
  }

  // ---------- search that adds ----------
  const searchResults = document.getElementById("searchResults") as HTMLUListElement;
  const matchIds = (q: string) => {
    if (!q) return [];
    const hits = ids.filter((id) => {
      const t = typeOf(id);
      return t.name.toLowerCase().includes(q) || t.levels.some((l) => l.toLowerCase().includes(q));
    });
    return hits.sort((a, b) => {
      const an = typeOf(a).name.toLowerCase(); const bn = typeOf(b).name.toLowerCase();
      const ai = an.includes(q) ? an.indexOf(q) : 99; const bi = bn.includes(q) ? bn.indexOf(q) : 99;
      return ai - bi || an.localeCompare(bn);
    }).slice(0, 8);
  };
  const renderSearchResults = () => {
    const q = search.value.trim().toLowerCase();
    if (!q) { searchResults.classList.add("hidden"); searchResults.innerHTML = ""; return; }
    const hits = matchIds(q);
    searchResults.innerHTML = hits.length
      ? hits.map((id) => {
        const t = typeOf(id); const lvl = sel[id] ?? 0;
        const state = lvl >= t.maxLevel ? "max" : lvl ? `${lvl}/${t.maxLevel}` : canTake(id) ? "add" : "locked";
        const tone = state === "locked" ? "text-mist" : state === "add" ? "text-spirit" : "text-flame";
        return `<li data-add="${id}" class="flex cursor-pointer items-center justify-between gap-3 border-b border-parchment/5 px-3 py-2 last:border-0 hover:bg-night-3"><span class="min-w-0 text-parchment">${escapeHtml(t.name)} <span class="text-mist text-xs">${t.cost} pt${t.maxLevel > 1 ? ` ×${t.maxLevel}` : ""}</span></span><span class="${tone} text-xs whitespace-nowrap">${state}</span></li>`;
      }).join("")
      : `<li class="px-3 py-2 text-mist">No skill matches “${escapeHtml(q)}”.</li>`;
    searchResults.classList.remove("hidden");
  };
  const focusNode = (id: string) => {
    const n = tree.nodes[id]; const rect = svg.getBoundingClientRect();
    const aspect = rect.width / Math.max(1, rect.height);
    view.w = rect.width < 640 ? 420 : 760; view.h = view.w / aspect;
    view.x = n.x - view.w / 2; view.y = n.y - view.h / 2; applyView();
  };
  searchResults.addEventListener("click", (e) => {
    const li = (e.target as Element).closest("[data-add]"); if (!li) return;
    const id = li.getAttribute("data-add")!;
    addLevel(id); focusNode(id);
  });
  search.addEventListener("keydown", (e) => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    const first = matchIds(search.value.trim().toLowerCase())[0];
    if (first) { addLevel(first); focusNode(first); }
  });

  // ---------- controls ----------
  const levelInput = document.getElementById("level") as HTMLInputElement;
  levelInput.addEventListener("input", () => { level = Number(levelInput.value); render(); });
  biomeChecks.forEach((c) => c.addEventListener("change", render));
  search.addEventListener("input", render);
  document.getElementById("reset")!.addEventListener("click", () => { sel = {}; guide = ""; showGuide(); render(); });
  const preset = document.getElementById("preset") as HTMLSelectElement;
  preset.addEventListener("change", () => { if (preset.value) { guide = data.presets.find((p) => p.code === preset.value)?.slug ?? ""; showGuide(); sel = decode(preset.value); level = tree.leveling.playerLevelCap; levelInput.value = String(level); biomeChecks.forEach((c) => (c.checked = true)); render(); } preset.value = ""; });
  const shareBtn = document.getElementById("share") as HTMLButtonElement;
  shareBtn.addEventListener("click", async () => {
    persist();
    try { await navigator.clipboard.writeText(location.href); shareBtn.textContent = "Link copied!"; }
    catch { window.prompt("Copy this link:", location.href); }
    setTimeout(() => (shareBtn.textContent = "Copy share link"), 1800);
  });

  // ---------- link back to the guide a build came from ----------
  let guide = new URL(location.href).searchParams.get("g") ?? "";
  const backlink = document.getElementById("backlink") as HTMLAnchorElement;
  const showGuide = () => {
    const p = data.presets.find((x) => x.slug === guide);
    backlink.classList.toggle("hidden", !p);
    if (p) { backlink.href = `/builds/${p.slug}/`; backlink.textContent = `← Back to the ${p.name} build guide`; }
  };

  // ---------- boot ----------
  const fromUrl = new URL(location.href).searchParams.get("b");
  let saved = "";
  try { saved = localStorage.getItem(STORAGE_KEY) ?? ""; } catch { /* ignore */ }
  sel = decode(fromUrl ?? saved);
  showGuide();
  fit();
  // Phones: open zoomed in far enough that a single skill is a realistic tap target; "Fit" still shows the whole tree.
  if (window.innerWidth <= 640) zoomAt(1900 / 720, 0, 0);
  window.addEventListener("resize", fit);
  render();
}
