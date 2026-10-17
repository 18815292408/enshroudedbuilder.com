import data from "../data/skilltree.json";

export type SkillType = { name: string; cost: number; maxLevel: number; color: string; stats: Record<string, number> | null; levels: string[] };
export type TreeNode = { t: string; x: number; y: number; base?: number; ba?: [number, number]; r: string };
export type Selection = Record<string, number>;

export const TREE = data as unknown as {
  source: { gameBuild: string; branch: string; exportedAtUtc: string; contentHash: string };
  leveling: { playerLevelCap: number; skillPointsPerLevel: number };
  biomePoints: Record<string, number>;
  regions: Record<string, string>;
  types: Record<string, SkillType>;
  nodes: Record<string, TreeNode>;
  edges: [string, string][];
};

export const REGION_LABEL: Record<string, string> = {
  core: "Core", trickster: "Trickster", wizard: "Wizard", healer: "Healer", battlemage: "Battlemage",
  tank: "Tank", warrior: "Warrior", barbarian: "Barbarian", athlete: "Athlete",
  survivor: "Survivor", beastmaster: "Beastmaster", ranger: "Ranger", assassin: "Assassin",
};

/** Biome order and the player levels they roughly cover (matches the source planner's progression model). */
export const BIOMES = [
  { id: "springlands", name: "Springlands", minLevel: 2, maxLevel: 10 },
  { id: "revelwood", name: "Revelwood", minLevel: 11, maxLevel: 15 },
  { id: "nomad_highlands", name: "Nomad Highlands", minLevel: 16, maxLevel: 20 },
  { id: "kindlewastes", name: "Kindlewastes", minLevel: 21, maxLevel: 30 },
  { id: "albaneve_summits", name: "Albaneve Summits", minLevel: 31, maxLevel: 40 },
  { id: "veilwater_basin", name: "Veilwater Basin", minLevel: 41, maxLevel: 45 },
  { id: "cinders_cradle", name: "Cinder's Cradle", minLevel: 46, maxLevel: 50 },
].map((b) => ({ ...b, points: TREE.biomePoints[b.id] ?? 0 }));

export const levelPoints = (level: number) =>
  Math.max(0, Math.min(level, TREE.leveling.playerLevelCap) - 1) * TREE.leveling.skillPointsPerLevel;

/** Points available at `level` if every Shroud Root and Elixir Well in fully covered biomes is collected. */
export const pointsAtLevel = (level: number) =>
  levelPoints(level) + BIOMES.filter((b) => b.maxLevel <= level).reduce((a, b) => a + b.points, 0);

export const MAX_POINTS = pointsAtLevel(TREE.leveling.playerLevelCap);

const adjacency: Record<string, string[]> = Object.fromEntries(Object.keys(TREE.nodes).map((id) => [id, []]));
for (const [a, b] of TREE.edges) { adjacency[a].push(b); adjacency[b].push(a); }
export const ADJ = adjacency;

export const skill = (type: string): SkillType => {
  const s = TREE.types[type];
  if (!s) throw new Error(`Unknown skill type ${type}`);
  return s;
};

export const pointsUsed = (sel: Selection) =>
  Object.entries(sel).reduce((acc, [id, lvl]) => acc + skill(TREE.nodes[id].t).cost * lvl, 0);

/**
 * Adds `type` to the selection at `level`, unlocking the cheapest connected path to the
 * nearest node of that type (multi-source BFS from the current selection and the base ring).
 */
export function addSkill(sel: Selection, type: string, level = 1): Selection {
  const next = { ...sel };
  const existing = Object.keys(next).find((id) => TREE.nodes[id].t === type && !isAttribute(type));
  if (existing) { next[existing] = Math.max(next[existing], Math.min(level, skill(type).maxLevel)); return next; }
  const targets = new Set(Object.keys(TREE.nodes).filter((id) => TREE.nodes[id].t === type && !next[id]));
  if (!targets.size) throw new Error(`No free node for ${type}`);
  // Dijkstra on node cost (cost of unlocking a node at level 1).
  const dist: Record<string, number> = {}; const prev: Record<string, string | null> = {};
  const queue: string[] = [];
  for (const id of Object.keys(TREE.nodes)) {
    const reachable = !next[id] && (TREE.nodes[id].base || ADJ[id].some((n) => next[n]));
    if (reachable) { dist[id] = skill(TREE.nodes[id].t).cost; prev[id] = null; queue.push(id); }
  }
  while (queue.length) {
    queue.sort((a, b) => dist[a] - dist[b]);
    const cur = queue.shift()!;
    if (targets.has(cur)) {
      for (let p: string | null = cur; p; p = prev[p]) next[p] = Math.max(next[p] ?? 0, 1);
      next[cur] = Math.min(level, skill(type).maxLevel);
      return next;
    }
    for (const n of ADJ[cur]) {
      if (next[n]) continue;
      const d = dist[cur] + skill(TREE.nodes[n].t).cost;
      if (dist[n] === undefined || d < dist[n]) { if (dist[n] === undefined) queue.push(n); dist[n] = d; prev[n] = cur; }
    }
  }
  throw new Error(`No path to ${type}`);
}

export const isAttribute = (type: string) => type.startsWith("ATTR_");

const hasFreeNode = (sel: Selection, type: string) =>
  Object.keys(TREE.nodes).some((id) => TREE.nodes[id].t === type && !sel[id]);

/** Adds up to `count` attribute nodes of `type` (e.g. ATTR_INT), each via its cheapest path. */
export function addAttributes(sel: Selection, type: string, count: number, budget = Infinity): Selection {
  let next = sel;
  for (let i = 0; i < count && hasFreeNode(next, type); i++) {
    const tryNext = addSkill(next, type, 1);
    if (pointsUsed(tryNext) > budget) break;
    next = tryNext;
  }
  return next;
}

/**
 * A plan step: a skill type (maxed), [type, level], a number of attribute nodes, or a
 * `fill` list that is spent greedily, in order, while it still fits the stage budget.
 */
export type Step = string | [string, number] | { attr: string; count: number } | { fill: string[] };

export function applySteps(sel: Selection, steps: Step[], budget = Infinity): Selection {
  let next = sel;
  for (const s of steps) {
    if (typeof s === "string") next = addSkill(next, s, skill(s).maxLevel);
    else if (Array.isArray(s)) next = addSkill(next, s[0], s[1]);
    else if ("attr" in s) next = addAttributes(next, s.attr, s.count);
    else {
      let progressed = true;
      while (progressed) {
        progressed = false;
        for (const t of s.fill) {
          if (isAttribute(t) ? !hasFreeNode(next, t) : Object.keys(next).some((id) => TREE.nodes[id].t === t && next[id] >= skill(t).maxLevel)) continue;
          const tryNext = isAttribute(t) ? addSkill(next, t, 1) : addSkill(next, t, skill(t).maxLevel);
          if (pointsUsed(tryNext) <= budget) { next = tryNext; progressed = true; if (isAttribute(t)) break; }
        }
      }
    }
  }
  return next;
}

/** Compact share code: 2 base36 chars for node id + 1 digit level per node. */
export const encodeSelection = (sel: Selection) =>
  Object.entries(sel).filter(([, l]) => l > 0).sort((a, b) => +a[0] - +b[0])
    .map(([id, l]) => (+id).toString(36).padStart(2, "0") + l).join("");

export function attributesOf(sel: Selection) {
  const stats: Record<string, number> = {};
  for (const [id, lvl] of Object.entries(sel)) {
    const s = skill(TREE.nodes[id].t).stats;
    if (s) for (const [k, v] of Object.entries(s)) stats[k] = (stats[k] ?? 0) + v * lvl;
  }
  return stats;
}

/** Archetype region of a skill type (first node of that type). */
export const regionOf = (type: string) => Object.values(TREE.nodes).find((n) => n.t === type)?.r ?? "core";
export const treeOf = (region: string) => (region === "core" ? "core" : TREE.regions[region]);
