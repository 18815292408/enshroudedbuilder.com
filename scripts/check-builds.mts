// Prints each build's stage budgets and which tree its selected nodes fall in.
import { BUILDS } from "../src/data/builds.ts";
import { planBuild } from "../src/lib/plan.ts";
import { TREE } from "../src/lib/tree.ts";
for (const b of BUILDS) {
  const st = planBuild(b);
  const code = st.at(-1)!.code; const trees: Record<string, number> = {};
  for (let i = 0; i < code.length; i += 3) { const n = TREE.nodes[String(parseInt(code.slice(i, i + 2), 36))]; const t = n.r === "core" ? "core" : TREE.regions[n.r]; trees[t] = (trees[t] ?? 0) + 1; }
  console.log(b.slug.padEnd(11), st.map((s) => `${s.level}:${s.pointsUsed}/${s.pointsAvailable}`).join("  "), JSON.stringify(trees));
}
