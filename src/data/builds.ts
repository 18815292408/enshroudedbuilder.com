import type { Step } from "../lib/tree";
import { GEAR, FOOD, type Gear, type Food } from "./gear";

export type Stage = { label: string; level: number; summary: string; steps: Step[] };
export type Build = {
  slug: string;
  name: string;
  /** Common player term searched instead of the in-game name (used in the H1). */
  alias?: string;
  short: string;
  title: string;
  description: string;
  tier: "S" | "A" | "B";
  difficulty: "Easy" | "Medium" | "Hard";
  modes: string[];
  regions: string[];
  weapons: string;
  stats: string;
  keywords: string[];
  intro: string[];
  playstyle: string[];
  core: string[]; // skill types to spotlight in the "core skills" table
  stages: Stage[];
  gear: { weapons: Gear[]; armor: Gear[]; extras: Gear[]; extrasLabel: string };
  food: Food[];
  foodNote: string;
  pros: string[];
  cons: string[];
  faq: { q: string; a: string }[];
  related: string[];
};

export const BUILDS: Build[] = [
  {
    slug: "battlemage",
    name: "Battlemage",
    short: "Wand-and-ward caster that sustains its own mana and hits from mid range.",
    title: "Enshrouded 1.0 Battlemage Build – Wand & Ward Skill Tree to Level 50",
    description: "Best Enshrouded 1.0 Battlemage build: wand skills, the new Wand Evasion and Aerial Wand attacks, Blast and Cast, a level 1–50 skill order with exact point costs, gear and food.",
    tier: "S",
    difficulty: "Easy",
    modes: ["Solo", "Co-op"],
    regions: ["battlemage", "wizard", "trickster", "healer"],
    weapons: "Wand + Ward or Shield, Staff as a swap",
    stats: "Intelligence, then Spirit",
    keywords: ["enshrouded battlemage build", "enshrouded wand build", "enshrouded 1.0 mage build"],
    intro: [
      "The Battlemage is the most forgiving way to play magic in Enshrouded 1.0. You fight with a Wand in your main hand and a Ward or Shield in the other, so you can block and parry like a melee character while dealing magic damage from range. Wand attacks cost no spell charges, and in 1.0 wands also got a heavy attack. Keen Games says heavy attacks pierce enemies and interrupt weaker foes.",
      "The 1.0 skill tree adds two wand skills built for this setup. Wand Evasion Attack fires a piercing disc when you dodge, and Aerial Wand Attack turns a jump into an area hit. The new Blast and Cast skill also rewards swapping to a staff after a wand critical strike, which gives the build a real burst window.",
    ],
    playstyle: [
      "Open with wand light attacks to build Focus, then use the heavy attack to pierce lines of enemies.",
      "Dodge through attacks instead of rolling away. Wand Evasion Attack turns every evade into damage.",
      "Parry with your Ward. Arcane Deflection gives Mana back on every successful parry.",
      "After a wand critical strike, swap to a staff and cast within 10 seconds to cash in Blast and Cast's +50% base damage.",
    ],
    core: ["WAND_MASTERY", "WAND_SPECIALIZATION", "STING", "UNITY", "ARCANE_PROLIFERATION", "WAND_EVASION_ATTACK", "AERIAL_WAND_ATTACK", "BLAST_AND_CAST", "LIFE_BURST", "EXALTED"],
    stages: [
      { label: "Levels 1–15: wand foundation", level: 15, summary: "Rush wand damage and mana sustain so the wand can carry the early biomes on its own.", steps: ["WAND_MASTERY", ["UNITY", 2], "WAND_SPECIALIZATION", { attr: "ATTR_INT", count: 3 }, "ETERNAL_SPARK", ["ARCANE_DEFLECTION", 2], { fill: ["ATTR_INT", "ATTR_SPIRIT"] }] },
      { label: "Levels 16–35: evasion & sustain", level: 35, summary: "Add the new 1.0 wand moves, double projectiles and a heal that fires on kills.", steps: ["STING", "WAND_EVASION_ATTACK", "ARCANE_PROLIFERATION", "UNITY", "LIFE_BURST", "MAGE_APPRENTICE", { attr: "ATTR_INT", count: 3 }, "BLINK", { fill: ["MANA_CURRENTS", "LIFE_ESSENCES", "WATER_AURA", "HEALER", "SPELLSLINGER", "TERROR", "BLOODLETTING", "CHAIN_HIT", "MASS_DESTRUCTION", "DIVINE_SURGE", "HEALER_REVIVE", "EMERGENCY_BLINK", "BLOOD_MAGIC", "INNER_FIRES", "SHROUD_FILTER", "ARSONIST", "ICEMAN", "THUNDER", "COUNTERSTRIKE", "RADIANT_AURA", "FROST", "DARK_ARTS", "FIRE_RESISTANCE", "ICE_RESISTANCE", "SHOCK_RESISTANCE", "SHROUD_RESISTANCE", "ATTR_INT", "ATTR_SPIRIT"] }] },
      { label: "Levels 36–50: 1.0 endgame", level: 50, summary: "Scale Intelligence with the Flame, add crit chance and finish the staff burst combo.", steps: ["EXALTED", "AERIAL_WAND_ATTACK", "WIZARD", "BLAST_AND_CAST", "QUICK_CHARGE", "MANA_CURRENTS", "ARCANE_CONCENTRATION", "BLINK_ATTACK", { attr: "ATTR_INT", count: 3 }, { attr: "ATTR_SPIRIT", count: 3 }, { fill: ["MANA_CURRENTS", "LIFE_ESSENCES", "WATER_AURA", "HEALER", "SPELLSLINGER", "TERROR", "BLOODLETTING", "CHAIN_HIT", "MASS_DESTRUCTION", "DIVINE_SURGE", "HEALER_REVIVE", "EMERGENCY_BLINK", "BLOOD_MAGIC", "INNER_FIRES", "SHROUD_FILTER", "ARSONIST", "ICEMAN", "THUNDER", "COUNTERSTRIKE", "RADIANT_AURA", "FROST", "DARK_ARTS", "FIRE_RESISTANCE", "ICE_RESISTANCE", "SHOCK_RESISTANCE", "SHROUD_RESISTANCE", "ATTR_INT", "ATTR_SPIRIT"] }] },
    ],
    gear: {
      weapons: [GEAR.twistingWand, GEAR.snakespineWand],
      armor: [GEAR.flameArcanist, GEAR.lifelock, GEAR.vorgothCrown, GEAR.incredibleWard],
      extrasLabel: "Spells for the staff swap",
      extras: [GEAR.eternalFireball, GEAR.iceBolt, GEAR.entangle],
    },
    food: [FOOD.algaeSalad, FOOD.roastedShiitake, FOOD.latte, FOOD.meatWrap],
    foodNote: "Stack one Magic-damage food from each food type, and keep a Mana food for long fights.",
    pros: ["Wand attacks cost no spell charges, so the build is cheap to run", "Ward blocking and parry make it safer than a pure caster", "Unity and Arcane Deflection return Mana while you fight", "Strong in solo play and still useful in groups"],
    cons: ["Wand damage per hit is lower than a charged staff spell", "Needs good dodge timing to get value from Wand Evasion Attack", "Most of the burst depends on landing critical strikes for Blast and Cast"],
    faq: [
      { q: "Is the Battlemage good in Enshrouded 1.0?", a: "Yes. Keen Games' 1.0 update focused on mages: wands got heavy attacks plus two new active skills (Wand Evasion Attack and Aerial Wand Attack), and Blast and Cast links wand crits to staff damage. Early 1.0 guides (for example hacktheminotaur and pindrop.gg) also rank the wand Battlemage at or near the top." },
      { q: "Wand or staff for a Battlemage?", a: "Use the wand as your main weapon and carry a staff for burst. Blast and Cast raises the base damage of your next staff attack by 50% for 10 seconds after a wand critical strike." },
      { q: "How many skill points does this build use?", a: "The full level 50 plan below uses the exact point costs from the 1.0 game data. You can open it in the Skill Planner and change anything." },
    ],
    related: ["wizard", "summoner", "healer"],
  },
  {
    slug: "wizard",
    name: "Wizard",
    alias: "Mage Guide & Skill Tree",
    short: "Staff caster built around elemental damage, crits and area spells.",
    title: "Enshrouded 1.0 Wizard Build – Best Mage Skill Tree, Spells & Gear",
    description: "Enshrouded 1.0 Wizard (mage) build: staff skills, elemental damage nodes, the new Blizzard, Ball Lightning and Pillar of Flames spells, level 1–50 skill order, armor and food.",
    tier: "A",
    difficulty: "Medium",
    modes: ["Solo", "Co-op"],
    regions: ["wizard", "trickster", "battlemage"],
    weapons: "Staff (spells), Wand as backup",
    stats: "Intelligence, Spirit",
    keywords: ["enshrouded wizard build", "enshrouded mage build", "enshrouded staff build"],
    intro: [
      "The Wizard is Enshrouded's pure spellcaster. Staves cast spell charges, or Eternal spells that never run out, and the Wizard region holds the elemental damage nodes: Arsonist for fire, Iceman for ice and Thunder for shock. Each adds up to 30% damage of its element. You pick the element that matches the spells you carry.",
      "1.0 is the biggest mage update so far. Keen Games added nine new spell types, including Blizzard, Ball Lightning, Pillar of Flames, Entangle and Mana Drain, and made every spell available as an upgradeable Eternal version. A level 50 Wizard can now carry a full kit of Eternal spells and stop worrying about charges.",
    ],
    playstyle: [
      "Pick one element and put points into its damage node first: Arsonist with Eternal Fireball and Pillar of Flames, or Iceman with Blizzard and Ice Bolt.",
      "Use area spells (Pillar of Flames, Blizzard, Ball Lightning) on groups and single-target bolts on elites.",
      "Quick Charge cuts spell charge time by up to 30%, which matters more after 1.0 because big spells now take longer to cast.",
      "Keep a wand for mana-free chip damage between casts.",
    ],
    core: ["MAGE_APPRENTICE", "WIZARD", "ARSONIST", "ICEMAN", "SPELLSLINGER", "QUICK_CHARGE", "CHAIN_HIT", "MASS_DESTRUCTION", "TERROR", "EXALTED"],
    stages: [
      { label: "Levels 1–15: first spells", level: 15, summary: "Staff damage, Intelligence and faster casting.", steps: ["MAGE_APPRENTICE", ["SPELLSLINGER", 2], ["QUICK_CHARGE", 2], { attr: "ATTR_INT", count: 3 }, ["ARSONIST", 1], ["MANA_CURRENTS", 2], { fill: ["ATTR_INT", "ATTR_SPIRIT"] }] },
      { label: "Levels 16–35: element & crits", level: 35, summary: "Max your element, add crit chance and crit-triggered shock damage.", steps: ["ARSONIST", "WIZARD", "SPELLSLINGER", "QUICK_CHARGE", "MASS_DESTRUCTION", "CHAIN_HIT", { attr: "ATTR_INT", count: 3 }, { fill: ["THUNDER", "BLINK", "LIFE_ESSENCES", "WATER_AURA", "LIFE_BURST", "DARK_ARTS", "RADIANT_AURA", "BLOOD_MAGIC", "INNER_FIRES", "UNITY", "WAND_MASTERY", "STING", "COUNTERSTRIKE", "SHROUD_FILTER", "MAGE_APPRENTICE", "ICE_RESISTANCE", "FIRE_RESISTANCE", "FROST", "HEALER", "HEALER_REVIVE", "DIVINE_SURGE", "EMERGENCY_BLINK", "BLOODLETTING", "SHOCK_RESISTANCE", "SHROUD_RESISTANCE", "ATTR_INT", "ATTR_SPIRIT"] }] },
      { label: "Levels 36–50: 1.0 endgame", level: 50, summary: "Intelligence from the Flame, a second element and crit utility.", steps: ["EXALTED", "ICEMAN", "TERROR", "BLOODLETTING", "MANA_CURRENTS", "ARCANE_CONCENTRATION", "BLAST_AND_CAST", { attr: "ATTR_INT", count: 3 }, { attr: "ATTR_SPIRIT", count: 3 }, { fill: ["THUNDER", "BLINK", "LIFE_ESSENCES", "WATER_AURA", "LIFE_BURST", "DARK_ARTS", "RADIANT_AURA", "BLOOD_MAGIC", "INNER_FIRES", "UNITY", "WAND_MASTERY", "STING", "COUNTERSTRIKE", "SHROUD_FILTER", "MAGE_APPRENTICE", "ICE_RESISTANCE", "FIRE_RESISTANCE", "FROST", "HEALER", "HEALER_REVIVE", "DIVINE_SURGE", "EMERGENCY_BLINK", "BLOODLETTING", "SHOCK_RESISTANCE", "SHROUD_RESISTANCE", "ATTR_INT", "ATTR_SPIRIT"] }] },
    ],
    gear: {
      weapons: [GEAR.twistingWand, GEAR.snakespineWand],
      armor: [GEAR.flameArcanist, GEAR.vorgothCrown, GEAR.lifelock],
      extrasLabel: "Spells to carry",
      extras: [GEAR.eternalFireball, GEAR.pillarFlames, GEAR.blizzard, GEAR.ballLightning, GEAR.iceBolt, GEAR.shroudMeteor],
    },
    food: [FOOD.algaeSalad, FOOD.yellowGlowSoup, FOOD.latte, FOOD.candiedGinger],
    foodNote: "Mana and Magic damage foods. Candied Ginger is a short boost of mana regeneration for boss fights.",
    pros: ["Highest burst and area damage of the magic builds", "Huge choice of spells after 1.0, all with Eternal versions", "Elemental nodes let you counter enemy weaknesses"],
    cons: ["Big spells take longer to charge in 1.0", "Squishier than the Battlemage, with no ward in hand while casting", "Spell charges for non-Eternal spells cost materials"],
    faq: [
      { q: "What is the best element for a Wizard in 1.0?", a: "There is no single best element. Arsonist, Iceman and Thunder each give up to +30% damage of their element. Fire suits Fireball and Pillar of Flames, ice adds slows (Blizzard, Ice Bolt), and shock fills Stun Bars (Ball Lightning)." },
      { q: "Do I still need spell charges at level 50?", a: "Not if you craft Eternal spells. In 1.0 every spell has an Eternal version that costs mana instead of charges, and Eternal spells can be upgraded like weapons." },
      { q: "Is Mage the same as Wizard in Enshrouded?", a: "The game calls the magic skill tree branches Wizard, Battlemage, Healer and Trickster. Most players searching for a 'mage build' want this staff Wizard or the wand Battlemage." },
    ],
    related: ["battlemage", "summoner", "healer"],
  },
  {
    slug: "summoner",
    name: "Summoner",
    alias: "Necromancer & Minion Guide",
    short: "Necromancer-style caster that fights with Hollow allies and totems.",
    title: "Enshrouded 1.0 Summoner Build – Necromancer & Minion Guide",
    description: "Enshrouded 1.0 Summoner / Necromancer build: Advanced Necromancy, Totem Mastery, Hollow Wretch summons and Fire, Ice and Shock Totems, with a level 1–50 skill order and gear.",
    tier: "S",
    difficulty: "Easy",
    modes: ["Solo", "Co-op"],
    regions: ["wizard", "healer", "trickster"],
    weapons: "Staff (summon spells) + Wand",
    stats: "Intelligence, Spirit",
    keywords: ["enshrouded necromancer build", "enshrouded summoner build", "enshrouded totem build"],
    intro: [
      "Summons are new in Enshrouded 1.0. Keen Games added spells that summon Hollow allies (the Hollow Wretch line) and three elemental totems: Fire, Ice and Shock. By default you can have only one Hollow ally and one totem out, so the build's two key skills are Advanced Necromancy and Totem Mastery, both new in 1.0. Each raises its cap by up to 3.",
      "The older Necromancer skill is still in the Healer area and still gives you a chance to raise a Skull Companion when you kill with a magic weapon. The game now counts the creatures each player has summoned and replaces the oldest one when you go over the cap. The 1.0 changelog also notes that the Gem of Lesser Necromancy now has a limit on resurrected companions.",
    ],
    playstyle: [
      "Before a fight, cast your Hollow Wretch allies and drop totems so they draw attention.",
      "Mix totems: Ice Totem slows, Shock Totem fills Stun Bars, Fire Totem explodes when it expires.",
      "Fight from behind your summons with a wand, or use staff spells on clustered enemies.",
      "Recast summons after big fights. Your oldest summon is replaced when you go over the cap.",
    ],
    core: ["ADVANCED_NECROMANCY", "TOTEM_MASTERY", "NECROMANCER", "MAGE_APPRENTICE", "WIZARD", "QUICK_CHARGE", "LIFE_ESSENCES", "WATER_AURA"],
    stages: [
      { label: "Levels 1–15: caster basics", level: 15, summary: "Summons start to appear as you find spells, so build general staff damage and survivability first.", steps: ["MAGE_APPRENTICE", ["QUICK_CHARGE", 2], { attr: "ATTR_INT", count: 3 }, ["NECROMANCER", 2], ["WATER_AURA", 1], ["LIFE_ESSENCES", 1], { fill: ["ATTR_INT", "ATTR_SPIRIT"] }] },
      { label: "Levels 16–35: the summon caps", level: 35, summary: "Take both new 1.0 cap skills as soon as you can reach them.", steps: ["ADVANCED_NECROMANCY", "TOTEM_MASTERY", "NECROMANCER", "WIZARD", "QUICK_CHARGE", { attr: "ATTR_INT", count: 3 }, { fill: ["HEALER", "WIZARD", "BLINK", "LIFE_BURST", "QUICK_CHARGE", "SPELLSLINGER", "TERROR", "BLOODLETTING", "BLOOD_MAGIC", "ARSONIST", "ICEMAN", "THUNDER", "CHAIN_HIT", "MASS_DESTRUCTION", "HEALER_REVIVE", "DIVINE_SURGE", "EMERGENCY_BLINK", "SHROUD_FILTER", "INNER_FIRES", "RADIANT_AURA", "FROST", "HEALER_REVIVE", "FIRE_RESISTANCE", "ICE_RESISTANCE", "SHOCK_RESISTANCE", "SHROUD_RESISTANCE", "ATTR_INT", "ATTR_SPIRIT"] }] },
      { label: "Levels 36–50: endgame army", level: 50, summary: "Sustain and Intelligence scaling for Eternal summons.", steps: ["LIFE_ESSENCES", "WATER_AURA", "EXALTED", "MANA_CURRENTS", "BONE_TO_ASH", "ARCANE_CONCENTRATION", "DARK_ARTS", { attr: "ATTR_INT", count: 3 }, { attr: "ATTR_SPIRIT", count: 3 }, { fill: ["HEALER", "WIZARD", "BLINK", "LIFE_BURST", "QUICK_CHARGE", "SPELLSLINGER", "TERROR", "BLOODLETTING", "BLOOD_MAGIC", "ARSONIST", "ICEMAN", "THUNDER", "CHAIN_HIT", "MASS_DESTRUCTION", "HEALER_REVIVE", "DIVINE_SURGE", "EMERGENCY_BLINK", "SHROUD_FILTER", "INNER_FIRES", "RADIANT_AURA", "FROST", "HEALER_REVIVE", "FIRE_RESISTANCE", "ICE_RESISTANCE", "SHOCK_RESISTANCE", "SHROUD_RESISTANCE", "ATTR_INT", "ATTR_SPIRIT"] }] },
    ],
    gear: {
      weapons: [GEAR.twistingWand, GEAR.snakespineWand],
      armor: [GEAR.flameArcanist, GEAR.vorgothCrown, GEAR.lifelock],
      extrasLabel: "Summons & support spells",
      extras: [GEAR.hollowWretch, GEAR.hollowWretchCharge, GEAR.fireTotem, GEAR.iceTotem, GEAR.shockTotem, GEAR.bonestorm],
    },
    food: [FOOD.algaeSalad, FOOD.herbalTea, FOOD.meatWrap, FOOD.candiedGinger],
    foodNote: "Mana is the limit on how often you can resummon, so keep Mana foods up.",
    pros: ["New in 1.0 and very safe: summons take the hits", "Eternal summons remove the need for charges", "Totems add crowd control (slow, stun build-up)", "Great for players who prefer positioning over fast reactions"],
    cons: ["Summon caps need several skill points before the build comes online", "Your damage depends on how long summons survive", "Summons are capped per player, so they do not stack endlessly"],
    faq: [
      { q: "Is there a Necromancer class in Enshrouded?", a: "Not as a separate class. Any character can put points into the necromancy skills (Necromancer, and in 1.0 Advanced Necromancy) and use the new summon spells. Builds like this one are what players call a necromancer or summoner." },
      { q: "How many skeletons can I summon in 1.0?", a: "The Hollow Wretch spell description says the default cap is 1 Hollow ally. Advanced Necromancy raises it by 1 per level, up to +3 at level 3. Totems work the same way through Totem Mastery." },
      { q: "Do the Gems of Necromancy still work?", a: "Yes. The 1.0 changelog adds more Gems of Necromancy, but the Gem of Lesser Necromancy now has a limit on resurrected companions, and gem-raised companions slowly lose health when out of combat." },
    ],
    related: ["wizard", "battlemage", "healer"],
  },
  {
    slug: "ranger",
    name: "Ranger",
    short: "Bow build stacking crit, Skillshots and the new Puncture node.",
    title: "Enshrouded 1.0 Ranger Build – Best Bow Skill Tree, Arrows & Armor",
    description: "Enshrouded 1.0 Ranger build: bow damage nodes, the new Puncture, Barrage and Survival Instinct skills, Multi Shot, Eternal arrows, a level 1–50 skill order, armor and food.",
    tier: "A",
    difficulty: "Medium",
    modes: ["Solo", "Co-op"],
    regions: ["ranger", "assassin", "survivor", "beastmaster"],
    weapons: "Bow, Dagger as backup",
    stats: "Dexterity, Endurance",
    keywords: ["enshrouded ranger build", "enshrouded bow build", "enshrouded archer build"],
    intro: [
      "The Ranger fights with a bow and rewards good aim. Skillshots (hits on weak points such as heads) get bonus damage from Skill Shot, and the Ranger region stacks bow damage, crit chance and crit damage. Every point of Dexterity also adds 5% Bow and Dagger damage.",
      "Rangers got three new skills in 1.0. Puncture adds up to 30% ranged Piercing damage. Barrage gives bow hits a chance to repair the bow. Survival Instinct gives back Shroud time when you kill Shroud enemies with a bow or dagger. Keen Games also added upgradeable Eternal Ember, Voltaic and Bone arrows, so a level 50 Ranger no longer runs out of special arrows.",
    ],
    playstyle: [
      "Aim for heads. Skill Shot adds up to +60% Skillshot damage.",
      "Use Eternal elemental arrows on enemies weak to them and regular Celestium arrows to trigger Multi Shot.",
      "Bee Sting lets you hover while aiming in the air, which helps you get good angles on groups.",
      "Keep distance with Runner and Rebound. Most bow skills reward staying out of melee range.",
    ],
    core: ["MARKSMAN", "SKILL_SHOT", "SNIPER", "PUNCTURE", "FATAL_PRECISION", "BOW_SPECIALIZATION", "MULTI_SHOT", "BARRAGE", "RANGER", "GRACEFUL_STRIDE"],
    stages: [
      { label: "Levels 1–15: bow basics", level: 15, summary: "Damage, headshots and Dexterity.", steps: ["MARKSMAN", ["SKILL_SHOT", 2], { attr: "ATTR_DEX", count: 3 }, ["SNIPER", 1], ["BARRAGE", 2], ["BLESSED_ARROWS", 1], { fill: ["ATTR_DEX", "ATTR_ENDURANCE"] }] },
      { label: "Levels 16–35: crits & Puncture", level: 35, summary: "The new Puncture node, crit stacking and the bow Special Ability.", steps: ["PUNCTURE", "SKILL_SHOT", "SNIPER", "FATAL_PRECISION", "BOW_SPECIALIZATION", ["RANGER", 3], "VITALITY_SURGE", { attr: "ATTR_DEX", count: 2 }, { fill: ["MULTI_SHOT_SPREAD", "RUNNER", "REBOUND", "SWIFTSHOT_SUSTENANCE", "CUTTHROAT", "SILENT_STRIDE", "ARACHNOID", "AIRBORNE", "SLICE_AND_DICE", "DAGGER_MASTERY", "ENDURANCE_OF_THE_FLAME", "EAGLE_EYE", "BOUNTY_BONANZA", "GOOD_METABOLISM", "STRATEGIC_MANEUVER", "CHAIN_REACTION", "RICOCHETS", "SHELL_SHOCK", "VEILED_VIGOR", "CULL_THE_HERD", "DESSERT_STOMACH", "SNAKE_EATER", "MITHRIDATIST", "GOOD_METABOLISM", "UPDRAFT", "EXPOSE_WEAKNESS", "THRUST", "ATTR_DEX", "ATTR_ENDURANCE"] }] },
      { label: "Levels 36–50: 1.0 endgame", level: 50, summary: "Multi Shot, Dexterity from the Flame and Shroud sustain.", steps: ["GRACEFUL_STRIDE", "MULTI_SHOT", "MULTI_SHOT_TRIGGER", "COUNTER_BATTERY", "EAGLES_BANE", "SURVIVAL_INSTINCT", "BEE_STING", "BARRAGE", { attr: "ATTR_DEX", count: 3 }, { fill: ["MULTI_SHOT_SPREAD", "RUNNER", "REBOUND", "SWIFTSHOT_SUSTENANCE", "CUTTHROAT", "SILENT_STRIDE", "ARACHNOID", "AIRBORNE", "SLICE_AND_DICE", "DAGGER_MASTERY", "ENDURANCE_OF_THE_FLAME", "EAGLE_EYE", "BOUNTY_BONANZA", "GOOD_METABOLISM", "STRATEGIC_MANEUVER", "CHAIN_REACTION", "RICOCHETS", "SHELL_SHOCK", "VEILED_VIGOR", "CULL_THE_HERD", "DESSERT_STOMACH", "SNAKE_EATER", "MITHRIDATIST", "GOOD_METABOLISM", "UPDRAFT", "EXPOSE_WEAKNESS", "THRUST", "ATTR_DEX", "ATTR_ENDURANCE"] }] },
    ],
    gear: {
      weapons: [GEAR.breachingBow, GEAR.spearfisherBow],
      armor: [GEAR.ashwind, GEAR.vorgothChest, GEAR.skySpecter],
      extrasLabel: "Arrows",
      extras: [GEAR.celestiumArrow, GEAR.eternalEmber, GEAR.eternalVoltaic, GEAR.eternalBone],
    },
    food: [FOOD.taroCurry, FOOD.pumpkinSoup, FOOD.sweetMokka, FOOD.chickenSoup],
    foodNote: "Ranged and Dagger damage foods share the same bonus, so these also work for the Assassin.",
    pros: ["Safe, long-range damage that works anywhere", "Eternal arrows remove ammo worries at endgame", "Very strong headshot multipliers", "Good at taking down flying and ranged enemies (Eagle's Bane, Counter Battery)"],
    cons: ["Rewards precise aim. Damage drops a lot if you miss weak points", "Light armor, so enemies that close in hit hard", "Multi Shot needs three skills before it reaches full value"],
    faq: [
      { q: "What changed for Rangers in Enshrouded 1.0?", a: "Three new skills (Puncture, Barrage, Survival Instinct), rebalanced arrows, new upgradeable Eternal Ember, Voltaic and Bone arrows, and new aim-assist settings for ranged combat." },
      { q: "Should a Ranger use daggers?", a: "As a backup, yes. Dexterity boosts both Bow and Dagger damage, and Slice and Dice (Assassin area) gives your next bow attack +50% base damage after a dagger critical strike." },
      { q: "Is Multi Shot worth it?", a: "Multi Shot gives regular arrows a 20% chance to fire a flurry. Multi Shot Trigger lets special arrows trigger it too. It is a late-game investment of 7–10 points, so take it after your core damage nodes." },
    ],
    related: ["assassin", "battlemage", "warrior"],
  },
  {
    slug: "tank",
    name: "Tank",
    short: "Shield-and-mace protector that boosts armor, resistances and group survival.",
    title: "Enshrouded 1.0 Tank Build – Shield Skill Tree, Armor & Aggro Guide",
    description: "Enshrouded 1.0 Tank build: Heavy Plates, Shiny Plates, Earth Aura, Tower, Warden and Nemesis, parry and Merciless Attack skills, level 1–50 skill order, best shields and armor.",
    tier: "B",
    difficulty: "Easy",
    modes: ["Co-op", "Solo"],
    regions: ["tank", "warrior", "athlete"],
    weapons: "One-handed weapon + Shield",
    stats: "Constitution, Strength",
    keywords: ["enshrouded tank build", "enshrouded shield build", "enshrouded paladin build"],
    intro: [
      "The Tank holds enemies in place so the rest of the group can deal damage. Its skills raise your armor (Heavy Plates and Shiny Plates add up to 12% physical and magical armor from gear), add resistances when you are surrounded (Tower and Warden), and pull enemy attention onto you (Nemesis).",
      "Tanks also have a strong solo loop: parry, overpower the enemy, then finish with a Merciless Attack. Snap restores mana on every Merciless Attack, Bash deals damage on parry, and Breach makes overpowered enemies take double melee physical damage for a few seconds.",
    ],
    playstyle: [
      "Hold block and time your parries. Power Parry and Heavy Handed fill Stun Bars faster.",
      "When an enemy is overpowered, use a Merciless Attack. Opportunity adds up to +120% to its multiplier.",
      "In groups, Earth Aura gives every ally within 12 m up to +10% resistances, and Nemesis keeps enemies on you.",
      "Martyr is a co-op safety net: if you die, nearby allies are healed for half their health.",
    ],
    core: ["HEAVY_PLATES", "SHINY_PLATES", "EARTH_AURA", "TOWER", "WARDEN", "NEMESIS", "BASH", "BREACH", "MERCILESS_ATTACK", "THICK_SKIN"],
    stages: [
      { label: "Levels 1–15: block & punish", level: 15, summary: "Parry, Merciless Attacks and early health.", steps: ["POWER_PARRY", "MERCILESS_ATTACK", ["OPPORTUNITY", 2], { attr: "ATTR_CONS", count: 3 }, ["HEAVY_PLATES", 2], ["BASH", 1], ["WARRIOR_PATH", 1], { fill: ["ATTR_CONS", "ATTR_STR"] }] },
      { label: "Levels 16–35: armor & control", level: 35, summary: "Armor scaling, crowd resistances and the shockwave.", steps: ["HEAVY_PLATES", "SHINY_PLATES", "TOWER", "WARDEN", "HEAVY_HANDED", "BREACH", "SHOCKWAVE", "OPPORTUNITY", { attr: "ATTR_CONS", count: 2 }, { fill: ["WARRIOR_PATH", "SLASHER", "POWER_PARRY", "SWIFT_BLADES", "ABSORB", "PURIFICATION", "BLOOD_RAGE", "BRUTE", "STEADFAST", "FINESSE", "SOUL_LEECH", "VETERAN", "BLOOD_WARRIOR", "KICK", "CRASH_DOWN_ATTACK", "UPWARDS_SLASH_ATTACK", "REBOUND", "RUNNER", "ATTR_CONS", "ATTR_STR"] }] },
      { label: "Levels 36–50: 1.0 endgame", level: 50, summary: "Group aura, aggro and Constitution from the Flame.", steps: ["EARTH_AURA", "THICK_SKIN", "NEMESIS", "BATTLE_HEAL", "SNAP", "VIGOROUS_DEFLECTION", "ATHLETE", "MARTYR", "ONE_HANDED_SPECIALIZATION", { attr: "ATTR_CONS", count: 3 }, { fill: ["WARRIOR_PATH", "SLASHER", "POWER_PARRY", "SWIFT_BLADES", "ABSORB", "PURIFICATION", "BLOOD_RAGE", "BRUTE", "STEADFAST", "FINESSE", "SOUL_LEECH", "VETERAN", "BLOOD_WARRIOR", "KICK", "CRASH_DOWN_ATTACK", "UPWARDS_SLASH_ATTACK", "REBOUND", "RUNNER", "ATTR_CONS", "ATTR_STR"] }] },
    ],
    gear: {
      weapons: [GEAR.sunAxe, GEAR.steelMoonAxe],
      armor: [GEAR.crestflame, GEAR.emberguard, GEAR.crestflameShield, GEAR.emberguardShield, GEAR.astrodomeShield],
      extrasLabel: "Utility spell",
      extras: [GEAR.shockWisp],
    },
    food: [FOOD.beefStew, FOOD.crabCakes, FOOD.plantainCurry, FOOD.friedRice],
    foodNote: "Health and health regeneration first, then one Melee damage food.",
    pros: ["Very hard to kill, even when surrounded", "Makes the whole group tougher with Earth Aura and Martyr", "Parry and Merciless loop still deals solid damage", "Simple to play"],
    cons: ["Lower damage than the other melee builds", "Aggro and group skills are wasted in solo play", "Relies on heavy gear and shield upgrades"],
    faq: [
      { q: "Is there a Paladin in Enshrouded?", a: "No class is called Paladin. Players usually mean a shield tank with some healing, which this build covers, and you can add Healer nodes for Water Aura." },
      { q: "Which armor has the most defense in 1.0?", a: "Among the 1.0 level 45 chest pieces on the wiki, Crestflame Chest has the highest physical armor (+251 physical, +140 magical). Emberguard Chestplate has +223 physical and +112 magical." },
      { q: "Does the Tank work solo?", a: "Yes, but swap Nemesis and Martyr for more damage nodes such as Warrior's Path and Slasher. Those two group skills do nothing when you play alone." },
    ],
    related: ["warrior", "healer", "battlemage"],
  },
  {
    slug: "warrior",
    name: "Two-Handed Warrior",
    short: "Barbarian-style greatsword and hammer build with high melee burst.",
    title: "Enshrouded 1.0 Warrior Build – Two-Handed Barbarian Skill Tree & Gear",
    description: "Enshrouded 1.0 two-handed Warrior / Barbarian build: greatsword and hammer skills, Blood Rage, Relentless, Whirlwind Crescendo, a level 1–50 skill order, weapons and food.",
    tier: "A",
    difficulty: "Medium",
    modes: ["Solo", "Co-op"],
    regions: ["barbarian", "warrior", "athlete", "tank"],
    weapons: "Two-handed Greatsword, Axe, Club or Hammer",
    stats: "Strength, Constitution",
    keywords: ["enshrouded warrior build", "enshrouded barbarian build", "enshrouded two handed build"],
    intro: [
      "The two-handed Warrior lives in the Barbarian region of the Warrior tree. It swings greatswords, two-handed axes, clubs and hammers for huge hits, and its skills add damage (Barbarian's Path, Titan Edge, Brute), attack speed (Heavy Hitter) and crit (Relentless, Veteran).",
      "Blood Rage keeps the damage rolling. Every melee kill within 15 meters gives +15% melee damage for 10 seconds. Steadfast repairs your weapon on kills, and Battle Heal heals you on melee crits. Each point of Strength adds 5% melee damage, and the Barbarian node adds a Strength point for every two Flame levels.",
    ],
    playstyle: [
      "Finish your attack chains. Whirlwind Crescendo adds a whirl attack at the end of a two-handed chain.",
      "Start fights on weak enemies first so Blood Rage is active for the big ones.",
      "Use your two-handed Special Ability once Focus is full (Two-Handed Specialization).",
      "Two-handed weapons can parry. Overpowered enemies take +100% melee physical damage with Breach.",
    ],
    core: ["BARBARIAN_PATH", "TITAN_EDGE", "TWO_HANDED_SPECIALIZATION", "HEAVY_SPECIALIZATION", "RELENTLESS", "WHIRLWIND_CRESCENDO", "BLOOD_RAGE", "BRUTE", "BARBARIAN", "VETERAN"],
    stages: [
      { label: "Levels 1–15: heavy hitter", level: 15, summary: "Two-handed damage and Strength.", steps: ["BARBARIAN_PATH", ["TITAN_EDGE", 2], { attr: "ATTR_STR", count: 3 }, ["BLOOD_RAGE", 2], "TWO_HANDED_SPECIALIZATION", ["STEADFAST", 1], { fill: ["ATTR_STR", "ATTR_CONS"] }] },
      { label: "Levels 16–35: speed & crits", level: 35, summary: "Attack speed, crit chain and the whirl finisher.", steps: ["TITAN_EDGE", "HEAVY_SPECIALIZATION", "RELENTLESS", "WHIRLWIND_CRESCENDO", "BLOOD_RAGE", "BRUTE", { attr: "ATTR_STR", count: 2 }, { fill: ["HEAVY_HANDED", "POWER_PARRY", "VIGOROUS_DEFLECTION", "FINESSE", "PURIFICATION", "SHOCKWAVE", "BASH", "TOWER", "WARDEN", "HEAVY_PLATES", "SHINY_PLATES", "THICK_SKIN", "BLOOD_WARRIOR", "CRASH_DOWN_ATTACK", "UPWARDS_SLASH_ATTACK", "SNAP", "SOUL_LEECH", "REBOUND", "RUNNER", "ATTR_STR", "ATTR_CONS"] }] },
      { label: "Levels 36–50: 1.0 endgame", level: 50, summary: "Strength from the Flame, sustain and the overpower combo.", steps: ["BARBARIAN", "VETERAN", "BATTLE_HEAL", "BREACH", "MERCILESS_ATTACK", "OPPORTUNITY", "SLASHER", "ATHLETE", "STEADFAST", { attr: "ATTR_STR", count: 2 }, { attr: "ATTR_CONS", count: 3 }, { fill: ["HEAVY_HANDED", "POWER_PARRY", "VIGOROUS_DEFLECTION", "FINESSE", "PURIFICATION", "SHOCKWAVE", "BASH", "TOWER", "WARDEN", "HEAVY_PLATES", "SHINY_PLATES", "THICK_SKIN", "BLOOD_WARRIOR", "CRASH_DOWN_ATTACK", "UPWARDS_SLASH_ATTACK", "SNAP", "SOUL_LEECH", "REBOUND", "RUNNER", "ATTR_STR", "ATTR_CONS"] }] },
    ],
    gear: {
      weapons: [GEAR.shroudVessel, GEAR.spineSplinter],
      armor: [GEAR.emberguard, GEAR.crestflame],
      extrasLabel: "Utility spell",
      extras: [GEAR.shockWisp],
    },
    food: [FOOD.friedRice, FOOD.blackCoffee, FOOD.beefStew, FOOD.coconutMilk],
    foodNote: "Melee damage plus Stamina. Whirlwind Crescendo costs 75 Stamina each time it triggers.",
    pros: ["Some of the biggest single hits in the game", "Blood Rage and Steadfast reward chaining kills", "Straightforward to gear", "Strong in solo and co-op"],
    cons: ["Slow swings leave openings against fast enemies", "Stamina-hungry: dodging and the whirl both cost Stamina", "Weak against flying enemies without a ranged backup"],
    faq: [
      { q: "Greatsword or hammer?", a: "Barbarian's Path boosts two-handed axes, clubs and hammers by up to 15%. Titan Edge boosts greatswords by up to 15%. Brute adds Blunt damage and Slasher adds Cutting damage, so match those nodes to your weapon." },
      { q: "What is the best two-handed weapon in 1.0?", a: "Shroud Vessel's Greatsword is a Legendary greatsword crafted with Vorgoth's Bound Essence, so you get it at the end of the story. Before that, use the highest-level two-handed weapon you find. Spine Splinter (Lv 40, Revelwood) has three Brutal perks." },
      { q: "Is Warrior the same as Barbarian?", a: "In the skill tree, Warrior is the one-handed and parry area and Barbarian is the two-handed area. Players usually call any melee damage build a 'warrior build'." },
    ],
    related: ["tank", "assassin", "ranger"],
  },
  {
    slug: "healer",
    name: "Healer",
    short: "Co-op support that heals the group, revives fast and still deals fire damage.",
    title: "Enshrouded 1.0 Healer Build – Support Skill Tree, Heal Spells & Gear",
    description: "Enshrouded 1.0 Healer build for co-op: Water Aura, Healer, Divine Surge, Righteous Fire and revive skills, Eternal Heal Beam and Chain Heal, a level 1–50 skill order and gear.",
    tier: "A",
    difficulty: "Easy",
    modes: ["Co-op"],
    regions: ["healer", "battlemage", "trickster", "wizard"],
    weapons: "Staff (heal spells) + Wand",
    stats: "Intelligence, Spirit",
    keywords: ["enshrouded healer build", "enshrouded support build", "enshrouded co-op build"],
    intro: [
      "The Healer keeps a co-op group alive. Healer increases healing from spells and Water Aura by up to 45%, Water Aura passively heals you and allies within about 15 meters, and Divine Surge lets healing spells critically strike using your crit damage.",
      "A 1.0 Healer is not just a heal-bot. Righteous Fire turns every heal into a burst of fire that deals up to 60% of the heal as damage to nearby Fell enemies. Life Burst heals the group when you kill with a magic weapon. Eternal Heal Beam and Eternal Chain Heal mean you never run out of healing charges at endgame.",
    ],
    playstyle: [
      "Stay behind the front line and keep the beam or chain heal on whoever is taking damage.",
      "Use healing to deal damage: with Righteous Fire, heals near Fell enemies burn them.",
      "Revive fast. Saviour cuts revive time and Healing Revive brings allies back with more health.",
      "Blink (and Emergency Blink) gets you out of trouble and even breaks stuns.",
    ],
    core: ["HEALER", "WATER_AURA", "WATERS_OF_LIFE", "DIVINE_SURGE", "RIGHTEOUS_FIRE", "HEALER_REVIVE", "LIFE_BURST", "LIFE_ESSENCES"],
    stages: [
      { label: "Levels 1–15: first heals", level: 15, summary: "Healing power, an aura and faster revives.", steps: [["HEALER", 2], ["WATER_AURA", 2], { attr: "ATTR_INT", count: 3 }, ["SAVIOUR", 2], ["HEALER_REVIVE", 1], ["LIFE_ESSENCES", 1], { fill: ["ATTR_INT", "ATTR_SPIRIT"] }] },
      { label: "Levels 16–35: power healer", level: 35, summary: "Max out healing and the aura, and add the blink escape.", steps: ["HEALER", "WATER_AURA", "WATERS_OF_LIFE", "BLINK", "LIFE_ESSENCES", "HEALER_REVIVE", ["RIGHTEOUS_FIRE", 2], { attr: "ATTR_INT", count: 3 }, { fill: ["WIZARD", "MAGE_APPRENTICE", "SAVIOUR", "TERROR", "BLOODLETTING", "BLOOD_MAGIC", "WAND_MASTERY", "UNITY", "STING", "ARCANE_DEFLECTION", "INNER_FIRES", "SHROUD_RESISTANCE", "ARSONIST", "RADIANT_AURA", "NECROMANCER", "COUNTERSTRIKE", "WIZARD", "FROST", "ICE_RESISTANCE", "FIRE_RESISTANCE", "SHOCK_RESISTANCE", "SHROUD_MISTERY", "MASS_DESTRUCTION", "CHAIN_HIT", "ATTR_INT", "ATTR_SPIRIT"] }] },
      { label: "Levels 36–50: 1.0 endgame", level: 50, summary: "Crit heals, damage from healing and group sustain.", steps: ["DIVINE_SURGE", "RIGHTEOUS_FIRE", "LIFE_BURST", "EMERGENCY_BLINK", "SHROUD_FILTER", "SHROUD_MISTERY", "MANA_CURRENTS", "QUICK_CHARGE", "EXALTED", { attr: "ATTR_INT", count: 2 }, { attr: "ATTR_SPIRIT", count: 3 }, { fill: ["WIZARD", "MAGE_APPRENTICE", "SAVIOUR", "TERROR", "BLOODLETTING", "BLOOD_MAGIC", "WAND_MASTERY", "UNITY", "STING", "ARCANE_DEFLECTION", "INNER_FIRES", "SHROUD_RESISTANCE", "ARSONIST", "RADIANT_AURA", "NECROMANCER", "COUNTERSTRIKE", "WIZARD", "FROST", "ICE_RESISTANCE", "FIRE_RESISTANCE", "SHOCK_RESISTANCE", "SHROUD_MISTERY", "MASS_DESTRUCTION", "CHAIN_HIT", "ATTR_INT", "ATTR_SPIRIT"] }] },
    ],
    gear: {
      weapons: [GEAR.snakespineWand, GEAR.twistingWand],
      armor: [GEAR.flameArcanist, GEAR.lifelock, GEAR.vorgothCrown],
      extrasLabel: "Heal & support spells",
      extras: [GEAR.healBeam, GEAR.chainHeal, GEAR.barrier, GEAR.entangle],
    },
    food: [FOOD.algaeSalad, FOOD.herbalTea, FOOD.yellowGlowSoup, FOOD.beefStew],
    foodNote: "Water Aura and heals scale with Intelligence, and Mana keeps them going, so Magic and Mana foods are the priority.",
    pros: ["Every co-op group gets much stronger with a dedicated healer", "Righteous Fire and Life Burst add real damage", "Fast revives and stun-breaking blink", "Eternal heal spells remove charge management"],
    cons: ["Weaker solo than the other magic builds", "Damage depends on allies taking damage near Fell enemies", "Group-wide skills do little when you play alone"],
    faq: [
      { q: "Do healers scale with Intelligence?", a: "Yes. Water Aura healing scales with Intelligence, Waters of Life increases it per 2 points of Intelligence, and Life Essences adds maximum health per Intelligence point." },
      { q: "Can a healer play solo?", a: "It can, using Water Aura for self-healing, but you will deal less damage. For solo play we suggest the Battlemage with a few Healer nodes instead." },
      { q: "What are the best heal spells in 1.0?", a: "At endgame, Eternal Heal Beam II (aimed beam) and Eternal Chain Heal II (auto-targets nearby allies) are the Legendary level 45 options listed on the wiki." },
    ],
    related: ["battlemage", "summoner", "tank"],
  },
  {
    slug: "assassin",
    name: "Assassin",
    short: "Dagger build for sneak attacks, backstabs, poison and armor-breaking crits.",
    title: "Enshrouded 1.0 Assassin Build – Dagger Skill Tree, Sneak Attack & Poison",
    description: "Enshrouded 1.0 Assassin build: dagger skills (moved into the Assassin area in 1.0), Sneak Attack, Backstab Mastery, Venomous Blades, Expose Weakness, a level 1–50 skill order and gear.",
    tier: "B",
    difficulty: "Hard",
    modes: ["Solo", "Co-op"],
    regions: ["assassin", "ranger", "survivor", "athlete"],
    weapons: "Daggers, Bow as backup",
    stats: "Dexterity, Endurance",
    keywords: ["enshrouded assassin build", "enshrouded dagger build", "enshrouded rogue build"],
    intro: [
      "The Assassin is the high-risk, high-reward melee build. In 1.0, Keen Games moved the dagger skills from the Warrior area into the Assassin area, so this whole build now sits on one side of the tree next to the Ranger, sharing Dexterity with bows.",
      "The damage comes from openers and crits. A Sneak Attack deals +900% damage, Cutthroat adds up to +300% more, and Backstab Mastery boosts hits from behind. In longer fights, dagger crits trigger Expose Weakness (+25% physical damage taken) and the Venomous Blades skills add stacking poison.",
    ],
    playstyle: [
      "Open every fight with a Sneak Attack while the enemy is unaware.",
      "Circle behind targets. Strategic Maneuver turns your dodge into a sideways roll while locked on.",
      "Dagger crits apply Expose Weakness, so follow up fast while it lasts.",
      "Swap to a bow after a dagger crit. Slice and Dice gives your next bow shot +50% base damage.",
    ],
    core: ["DAGGER_MASTERY", "DAGGER_SPECIALIZATION", "BACKSTAB_MASTERY", "EXPOSE_WEAKNESS", "POISONED_BLADES", "POISON_MASTERY", "SNEAK_ATTACK", "CUTTHROAT", "VEILED_VIGOR", "GRACEFUL_STRIDE"],
    stages: [
      { label: "Levels 1–15: openers", level: 15, summary: "Sneak Attack, dagger damage and Dexterity.", steps: ["SNEAK_ATTACK", ["DAGGER_MASTERY", 2], { attr: "ATTR_DEX", count: 3 }, ["BACKSTAB_MASTERY", 2], ["SILENT_STRIDE", 1], ["VEILED_VIGOR", 1], { fill: ["ATTR_DEX", "ATTR_ENDURANCE"] }] },
      { label: "Levels 16–35: crits & poison", level: 35, summary: "Special Ability, armor break and the poison pair.", steps: ["DAGGER_MASTERY", "DAGGER_SPECIALIZATION", "EXPOSE_WEAKNESS", "POISONED_BLADES", "POISON_MASTERY", "THRUST", "BACKSTAB_MASTERY", { attr: "ATTR_DEX", count: 2 }, { fill: ["THRUST", "EXPOSE_WEAKNESS", "RUNNER", "REBOUND", "SNIPER", "MARKSMAN", "SKILL_SHOT", "AIRBORNE", "ARACHNOID", "VILE_CONCOCTION", "SHELL_SHOCK", "SURVIVAL_INSTINCT", "GOOD_METABOLISM", "ENDURANCE_OF_THE_FLAME", "BLESSED_ARROWS", "BARRAGE", "PUNCTURE", "DESSERT_STOMACH", "DESSERT_STOMACH", "SNAKE_EATER", "MITHRIDATIST", "UPDRAFT", "RUNNER", "REBOUND", "SWIFTSHOT_SUSTENANCE", "ATTR_DEX", "ATTR_ENDURANCE"] }] },
      { label: "Levels 36–50: 1.0 endgame", level: 50, summary: "Dexterity from the Flame, sneak multipliers and survivability.", steps: ["GRACEFUL_STRIDE", "CUTTHROAT", "VEILED_VIGOR", "VETERAN", "SLICE_AND_DICE", "QUICK_REFLEX_BLOCK", "STRATEGIC_MANEUVER", "VITALITY_SURGE", "FATAL_PRECISION", { attr: "ATTR_DEX", count: 3 }, { fill: ["THRUST", "EXPOSE_WEAKNESS", "RUNNER", "REBOUND", "SNIPER", "MARKSMAN", "SKILL_SHOT", "AIRBORNE", "ARACHNOID", "VILE_CONCOCTION", "SHELL_SHOCK", "SURVIVAL_INSTINCT", "GOOD_METABOLISM", "ENDURANCE_OF_THE_FLAME", "BLESSED_ARROWS", "BARRAGE", "PUNCTURE", "DESSERT_STOMACH", "DESSERT_STOMACH", "SNAKE_EATER", "MITHRIDATIST", "UPDRAFT", "RUNNER", "REBOUND", "SWIFTSHOT_SUSTENANCE", "ATTR_DEX", "ATTR_ENDURANCE"] }] },
    ],
    gear: {
      weapons: [GEAR.breachingBow],
      armor: [GEAR.skySpecter, GEAR.ashwind, GEAR.vorgothChest],
      extrasLabel: "Backup arrows",
      extras: [GEAR.celestiumArrow, GEAR.eternalBone],
    },
    food: [FOOD.taroCurry, FOOD.pumpkinSoup, FOOD.sweetMokka, FOOD.coconutMilk],
    foodNote: "Ranged and Dagger damage foods boost daggers too, and Stamina keeps your dodges going.",
    pros: ["The biggest burst opener in the game (Sneak Attack +900%)", "All dagger skills are in one area after the 1.0 move", "Shares Dexterity with the Ranger for an easy bow backup", "Poison and armor break help against tough single targets"],
    cons: ["Hard to play. Low armor means mistakes are punished", "Openers are much weaker once a fight has started", "No dedicated 1.0 dagger is documented on the wiki yet, so use the best dagger you loot"],
    faq: [
      { q: "Where did the dagger skills go in 1.0?", a: "The 1.0 changelog says dagger-related skills were moved from the warrior area of the skill tree to the assassin tree." },
      { q: "Does Venomous Blades need a special dagger?", a: "Yes. The skill says it raises the chance to poison 'when using Daggers with the Venomous Blades perk', so look for that perk on your daggers." },
      { q: "Assassin or Ranger?", a: "Both scale with Dexterity, so many players mix them. Pick Assassin if you like getting close and sneaking, and Ranger if you prefer staying at range." },
    ],
    related: ["ranger", "warrior", "tank"],
  },
];

export const buildBySlug = (slug: string) => BUILDS.find((b) => b.slug === slug)!;
