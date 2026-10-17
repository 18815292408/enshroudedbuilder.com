// Builds src/data/skilltree.json from the Enshrouded 1.0 game export vendored in
// vendor/enshrouded-skill-tree (GPL-3.0, github.com/rossicler/enshrouded-skill-tree).
// Costs, max levels, values, positions and links come from the game export;
// archetype regions are assigned by the angle of each node around the tree center.
import fs from "node:fs";

const V = new URL("../vendor/enshrouded-skill-tree/", import.meta.url);
const read = (f) => JSON.parse(fs.readFileSync(new URL(f, V), "utf8"));
const game = read("gameSkillData.json");
const progression = read("gameProgression.json");
const authored = read("authored.json");
const text = read("nodes.en.json");

const REGIONS = [
  ["trickster", 257], ["wizard", 286], ["healer", 316], ["battlemage", 347],
  ["tank", 16], ["warrior", 50], ["barbarian", 78], ["athlete", 108],
  ["survivor", 136], ["beastmaster", 170], ["ranger", 196], ["assassin", 227],
];
const TREE_OF = {
  trickster: "mage", wizard: "mage", healer: "mage", battlemage: "mage",
  tank: "warrior", warrior: "warrior", barbarian: "warrior", athlete: "warrior",
  survivor: "ranger", beastmaster: "ranger", ranger: "ranger", assassin: "ranger",
};
const angDiff = (a, b) => Math.abs(((a - b + 540) % 360) - 180);

const stripTags = (s) => s.replace(/<br\s*\/?>/gi, " ").replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();

function fill(template, t, level) {
  return template.replace(/\{\{(\w+)\}\}/g, (_, k) => {
    if (t.gameLevelValues?.[k]) return String(t.gameLevelValues[k][Math.max(0, level - 1)]);
    if (t.gameValues?.[k] !== undefined) return String(t.gameValues[k]);
    if (t.gamePerLevelValues?.[k] !== undefined) return String(t.gamePerLevelValues[k]);
    if (t.levelValues?.[k]) return String(t.levelValues[k][Math.max(0, level - 1)]);
    return "?";
  });
}

const types = {};
for (const node of Object.values(game.nodes)) {
  const key = node.type;
  if (types[key]) continue;
  const t = { ...authored.types[key], ...game.types[key] };
  const loc = text[key]?.game ?? text[key] ?? {};
  const name = loc.name ?? t.name ?? key;
  const desc = loc.description ?? t.description ?? [];
  const maxLevel = t.maxLevel ?? 1;
  const levels = [];
  for (let l = 1; l <= maxLevel; l++) levels.push(desc.map((d) => stripTags(fill(d, t, l))).filter(Boolean).join(" "));
  types[key] = {
    name: name.split(" ").map((w) => w.charAt(0) + w.slice(1).toLowerCase()).join(" ").replace(/\b(Of|The|And|To)\b/g, (m) => m.toLowerCase()),
    cost: t.cost ?? 0,
    maxLevel,
    color: t.color,
    stats: t.stats ?? null,
    levels,
  };
}
// Keep the game's own capitalisation where the export provides it.
for (const [key, t] of Object.entries(types)) {
  const gameName = text[key]?.game?.name ?? game.types[key]?.name;
  if (gameName && gameName !== gameName.toUpperCase()) t.name = gameName;
}

const nodes = {};
for (const [id, n] of Object.entries(game.nodes)) {
  const { x, y } = n.position;
  const angle = (Math.atan2(-x, y) * 180 / Math.PI + 360) % 360;
  const color = types[n.type].color;
  let region = "core";
  if (color !== "gold") region = REGIONS.reduce((best, r) => (angDiff(angle, r[1]) < angDiff(angle, best[1]) ? r : best))[0];
  nodes[id] = {
    t: n.type, x: +x.toFixed(1), y: +y.toFixed(1), r: region,
    ...(n.base ? { base: 1 } : {}),
    ...(n.baseAnchor ? { ba: [+n.baseAnchor.x.toFixed(1), +n.baseAnchor.y.toFixed(1)] } : {}),
  };
}
const edges = game.edges.map(([a, b]) => [a, b]);

const biomePoints = Object.fromEntries(Object.entries(progression.biomes).map(([k, v]) => [k, v.points]));
const out = {
  source: {
    gameBuild: game.provenance.gameBuild.split("|")[0],
    branch: game.provenance.gameBuild.split("|")[1],
    exportedAtUtc: game.provenance.exportedAtUtc,
    contentHash: game.treeVersion.contentHash,
  },
  leveling: progression.leveling,
  biomePoints,
  regions: Object.fromEntries(REGIONS.map(([r]) => [r, TREE_OF[r]])),
  types,
  nodes,
  edges,
};
fs.mkdirSync(new URL("../src/data/", import.meta.url), { recursive: true });
fs.writeFileSync(new URL("../src/data/skilltree.json", import.meta.url), JSON.stringify(out));
const maxPoints = (progression.leveling.playerLevelCap - 1) * progression.leveling.skillPointsPerLevel + Object.values(biomePoints).reduce((a, b) => a + b, 0);
console.log(`skilltree.json: ${Object.keys(nodes).length} nodes, ${Object.keys(types).length} skills, ${edges.length} links, max points ${maxPoints}`);
