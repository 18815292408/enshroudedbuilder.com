/**
 * Guards the parts of the tree that the JSON export cannot express:
 * every build starts on a free ✦ Spark, all nodes are reachable, and the
 * preset share codes decode back to the same connected, affordable selection.
 */
import { TREE, SKILL_TYPES, SPARK_COUNT, ROOT_NODES, pointsUsed, type Selection } from "../src/lib/tree";
import { BUILDS } from "../src/data/builds";
import { planBuild } from "../src/lib/plan";

const ids = Object.keys(TREE.nodes);
const adj: Record<string, string[]> = Object.fromEntries(ids.map((id) => [id, []]));
for (const [a, b] of TREE.edges) { adj[a].push(b); adj[b].push(a); }
const roots = new Set(ROOT_NODES);
const problems: string[] = [];

if (ROOT_NODES.length !== 12 || SPARK_COUNT !== 12) problems.push(`expected 12 Sparks, found ${SPARK_COUNT} types / ${ROOT_NODES.length} nodes`);
for (const id of ROOT_NODES) {
  if (!TREE.nodes[id].root || TREE.types[TREE.nodes[id].t].cost !== 0) problems.push(`bad Spark root ${id}`);
}

// Every node must be reachable from a Spark.
const seen = new Set(ROOT_NODES);
const stack = [...ROOT_NODES];
while (stack.length) { const cur = stack.pop()!; for (const n of adj[cur]) if (!seen.has(n)) { seen.add(n); stack.push(n); } }
for (const id of ids) if (!seen.has(id)) problems.push(`unreachable node ${id}`);

// Every old base-ring node must still be one link away from a Spark.
for (const id of ids.filter((n) => TREE.nodes[n].base)) {
  if (!adj[id].some((n) => TREE.nodes[n].root)) problems.push(`old base node ${id} is not next to a Spark`);
}

function decode(code: string): Selection {
  const out: Selection = {};
  for (let i = 0; i < code.length; i += 3) {
    const id = String(parseInt(code.slice(i, i + 2), 36));
    const lvl = Number(code[i + 2]);
    if (TREE.nodes[id] && lvl >= 1) out[id] = lvl;
  }
  if (!Object.keys(out).some((id) => roots.has(id))) {
    const attach = Object.keys(out).flatMap((id) => adj[id]).find((id) => roots.has(id));
    if (attach) out[attach] = 1;
  }
  const reachable = new Set(Object.keys(out).filter((id) => roots.has(id)));
  const queue = [...reachable];
  while (queue.length) { const cur = queue.pop()!; for (const n of adj[cur]) if (out[n] && !reachable.has(n)) { reachable.add(n); queue.push(n); } }
  return Object.fromEntries(Object.entries(out).filter(([id]) => reachable.has(id)));
}

for (const build of BUILDS) {
  for (const stage of planBuild(build)) {
    const sel = decode(stage.code);
    if (!Object.keys(sel).some((id) => roots.has(id))) problems.push(`${build.slug} "${stage.label}" has no Spark`);
    if (pointsUsed(sel) !== stage.pointsUsed) problems.push(`${build.slug} "${stage.label}" decodes to ${pointsUsed(sel)} points, planned ${stage.pointsUsed}`);
    const connected = new Set(Object.keys(sel).filter((id) => roots.has(id)));
    const q = [...connected];
    while (q.length) { const cur = q.pop()!; for (const n of adj[cur]) if (sel[n] && !connected.has(n)) { connected.add(n); q.push(n); } }
    for (const id of Object.keys(sel)) if (!connected.has(id)) problems.push(`${build.slug} "${stage.label}" has disconnected node ${id}`);
  }
}

if (problems.length) { console.error(problems.join("\n")); process.exit(1); }
console.log(`OK: ${ids.length} nodes (${SKILL_TYPES.length} skills + ${SPARK_COUNT} Sparks), ${ROOT_NODES.length} roots, ${BUILDS.length} builds`);
