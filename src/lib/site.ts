export const SITE = {
  name: "Enshrouded Builder",
  domain: "enshroudedbuilder.com",
  url: "https://enshroudedbuilder.com",
  lastVerified: "2026-10-17",
  gameVersion: "1.0 (hotfix 1.0.0.2)",
  repo: "https://github.com/18815292408/enshroudedbuilder.com",
  ga4Id: "G-CE08NNE2Y6",
  clarityId: "yzf3hs2qms",
};

export const DISCLAIMER =
  "EnshroudedBuilder.com is an unofficial fan site and build guide. Enshrouded and all related assets are trademarks of Keen Games. Not affiliated with Keen Games.";

export const NAV = [
  { href: "/builds/", label: "Builds" },
  { href: "/builder/", label: "Skill Planner" },
  { href: "/skills/", label: "All Skills" },
  { href: "/enshrouded-1-0-changes/", label: "1.0 Changes" },
];

/**
 * French navigation. These are separate pages written for French search intent, not
 * translations of the English ones: the queries, the examples and the FAQ follow what
 * French players actually type ("arbre de compétences", "build archer", "respec").
 */
export const NAV_FR = [
  { href: "/fr/builds/", label: "Builds" },
  { href: "/fr/arbre-de-competences/", label: "Arbre de compétences" },
  { href: "/builder/", label: "Planificateur" },
];

/** Official and community sources cited across the site. */
export const SOURCES = {
  changelog: { label: "Keen Games – 1.0 release changelog (Steam, Oct 14 2026)", url: "https://store.steampowered.com/news/app/1203620" },
  combat: { label: "Keen Games – “1.0 Combat: changes and additions” (Steam, Sep 23 2026)", url: "https://store.steampowered.com/news/app/1203620" },
  hotfix: { label: "Keen Games – Hotfix 1.0.0.1 & 1.0.0.2 changelogs (Steam, Oct 15–16 2026)", url: "https://store.steampowered.com/news/app/1203620" },
  gameData: { label: "Enshrouded 1.0 skill tree export, game build 1267041 (rossicler/enshrouded-skill-tree, GPL-3.0)", url: "https://github.com/rossicler/enshrouded-skill-tree" },
  wiki: { label: "Enshrouded Wiki (wiki.gg, CC BY-SA 4.0) – item, spell and food pages", url: "https://enshrouded.wiki.gg/" },
};
