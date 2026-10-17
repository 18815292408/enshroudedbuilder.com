import type { Build } from "../data/builds";
import { applySteps, pointsUsed, pointsAtLevel, encodeSelection, skill, TREE, type Selection, type Step } from "./tree";

export type PlannedStage = {
  label: string; level: number; summary: string;
  added: { type: string; name: string; from: number; to: number; cost: number }[];
  pointsUsed: number; pointsAvailable: number; code: string;
};

const stepType = (s: Step) => (typeof s === "string" ? s : Array.isArray(s) ? s[0] : "attr" in s ? s.attr : "");

/** Resolves a build's stages into concrete, connected skill selections with exact point totals. */
export function planBuild(build: Build): PlannedStage[] {
  let sel: Selection = {};
  return build.stages.map((stage) => {
    const before = { ...sel };
    sel = applySteps(sel, stage.steps, pointsAtLevel(stage.level));
    const used = pointsUsed(sel);
    const available = pointsAtLevel(stage.level);
    if (used > available) throw new Error(`${build.slug} "${stage.label}" needs ${used} points but only ${available} are available at level ${stage.level}`);
    // Summarise per skill type: named steps plus path nodes picked up on the way.
    const byType = new Map<string, { from: number; to: number }>();
    for (const [id, lvl] of Object.entries(sel)) {
      const prev = before[id] ?? 0;
      if (lvl === prev) continue;
      const t = TREE.nodes[id].t;
      const e = byType.get(t) ?? { from: 0, to: 0 };
      e.from += prev; e.to += lvl; byType.set(t, e);
    }
    const order = stage.steps.map(stepType);
    const added = [...byType.entries()]
      .sort((a, b) => (order.indexOf(a[0]) + 1 || 99) - (order.indexOf(b[0]) + 1 || 99))
      .map(([type, e]) => ({ type, name: skill(type).name, from: e.from, to: e.to, cost: skill(type).cost * (e.to - e.from) }));
    return { label: stage.label, level: stage.level, summary: stage.summary, added, pointsUsed: used, pointsAvailable: available, code: encodeSelection(sel) };
  });
}
