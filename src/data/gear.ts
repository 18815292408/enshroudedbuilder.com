// Item facts adapted from enshrouded.wiki.gg (CC BY-SA 4.0), pages edited Oct 15–16 2026
// for the 1.0 release. Only values stated on those pages are listed here.
export type Gear = { name: string; kind: string; facts: string; wiki: string };

/** When the wiki pages behind the item facts were last edited (see the header note). */
export const WIKI_EDITED = "Oct 15–16 2026";

const w = (title: string) => `https://enshrouded.wiki.gg/wiki/${encodeURIComponent(title.replace(/ /g, "_"))}`;
const g = (name: string, kind: string, facts: string): Gear => ({ name, kind, facts, wiki: w(name) });

export const GEAR = {
  // Armor (chest pieces listed; stats are the chest piece values from the wiki)
  flameArcanist: g("Flame Arcanist Chest", "Magic armor · Lv 45", "Chest: +112 physical / +223 magical armor. Crafted by the Alchemist with Celestium Bars, Archaic Infusion, Blue Fabric, Gold Bars and an Archaic Core."),
  lifelock: g("Lifelock Chest", "Magic armor · Lv 45", "Chest: +84 physical / +112 magical armor. Crafted by the Alchemist."),
  vorgothCrown: g("Vorgoth's Soulbound Crown", "Magic head armor · Legendary · Lv 45", "+42 physical / +56 magical armor. Needs Vorgoth's Bound Essence, which is used to craft Vorgoth's armor."),
  vorgothChest: g("Vorgoth's Soulbound Chest", "Ranged armor · Legendary · Lv 45", "+98 physical / +98 magical armor. Needs Vorgoth's Bound Essence and a Bursting Fell Heart."),
  ashwind: g("Ashwind Strider Chest", "Ranged armor · Lv 45", "Chest: +168 physical / +168 magical armor. Crafted by the Hunter with Gold Bars, Celestium Bars, Red Fabric, Archaic Infusion and an Archaic Core."),
  skySpecter: g("Sky Specter Chest", "Ranged armor · Lv 45", "Chest: +98 physical / +98 magical armor. Crafted by the Hunter."),
  crestflame: g("Crestflame Chest", "Melee armor · Lv 45", "Chest: +251 physical / +140 magical armor – the highest physical value among the 1.0 chest pieces listed here. Crafted by the Blacksmith."),
  emberguard: g("Emberguard Chestplate", "Melee armor · Lv 45", "Chest: +223 physical / +112 magical armor. Crafted by the Blacksmith."),
  // Shields & wards
  incredibleWard: g("Incredible Ward", "Ward (magic shield) · Lv 45", "Crafted by the Alchemist at the Blast Furnace with Celestium Bars, Diamond, Sparkling Dust and Bursting Fell Hearts."),
  crestflameShield: g("Crestflame Shield", "Shield · Lv 45", "Crafted by the Blacksmith with Smithing Tools (Celestium Bars, Moonstone Dust, Basalt, Fish Scales and more)."),
  emberguardShield: g("Emberguard Shield", "Shield · Lv 45", "Crafted by the Blacksmith with Smithing Tools."),
  astrodomeShield: g("Astrodome Shield", "Shield · Lv 45", "Crafted by the Blacksmith with Smithing Tools."),
  // Weapons
  twistingWand: g("Twisting Wand", "Wand · Lv 40 · Kindlewastes", "Fires Shroud-damage projectiles. Perks listed: Magic Shroud Damage, Mana Leech, Health Leech, Spiritual. Attack speed 0.6s."),
  snakespineWand: g("Snakespine Wand", "Wand · Lv 40 · Hollow Halls loot", "Perks listed: Blunt Damage, Sacred, Magic Ice Damage, Mana Leech. Attack speed 0.6s, +1 mana regeneration."),
  breachingBow: g("Breaching Bow", "Bow · Celestium tier", "Crafted by the Hunter with Celestium Bars, String, Conifer Logs and Ectoplasm Aggregate."),
  spearfisherBow: g("Spearfisher Bow", "Bow · Celestium tier", "Crafted by the Hunter with the same Celestium recipe as the Breaching Bow."),
  shroudVessel: g("Shroud Vessel's Greatsword", "Two-handed greatsword · Legendary", "Crafted with Celestium Bars, Steel Bars, Diamonds and Vorgoth's Bound Essence – an end-of-story weapon."),
  spineSplinter: g("Spine Splinter", "Two-handed club · Lv 40 · Revelwood", "Perks listed: Brutal ×3, Piercing Damage, Blunt Damage. Parry power 137, attack speed 0.7s."),
  sunAxe: g("Sun Axe", "One-handed axe · Lv 40 · Kindlewastes", "Perks listed: Cutting Damage, Magic Fire Damage ×2, Piercing Damage, Merciless."),
  steelMoonAxe: g("Steel Moon Axe", "One-handed axe · Lv 40 · Albaneve Summits", "Perks listed: Cutting Damage, Piercing Damage, Brutal ×2, Precise."),
  // Ammunition
  celestiumArrow: g("Celestium Arrow", "Arrow · Lv 47", "Crafted by the Hunter in stacks of 50 (Twigs, Celestium Bars, Feathers, Gold Dust)."),
  eternalEmber: g("Eternal Ember Arrow III", "Eternal arrow · Legendary · Lv 45", "Never runs out. Crafted by the Hunter (Archaic Infusion, Sparkling Dust, Magma Gel)."),
  eternalVoltaic: g("Eternal Voltaic Arrow III", "Eternal arrow · Legendary · Lv 45", "Never runs out. Crafted by the Hunter (Archaic Infusion, Sparkling Dust, Celestium Bars)."),
  eternalBone: g("Eternal Giant Bone Arrow II", "Eternal arrow · Legendary · Lv 45", "Never runs out. Crafted by the Collector (Ectoplasm Aggregate, Icy Giant Bones, Archaic Cores)."),
  // Spells
  eternalFireball: g("Eternal Fireball III", "Eternal spell · Legendary · Lv 45", "A fireball that erupts on impact and deals area damage. Crafted by the Alchemist from 20 Fireball IV charges plus materials."),
  pillarFlames: g("Eternal Pillar Of Flames I", "Eternal spell · Legendary · Lv 45 · new in 1.0", "Ignites an area that keeps damaging enemies and applies a burn debuff."),
  blizzard: g("Eternal Blizzard II", "Eternal spell · Legendary · Lv 45 · new in 1.0", "A freezing storm that damages everything inside and slows enemies."),
  ballLightning: g("Eternal Ball Lightning I", "Eternal spell · Legendary · Lv 45 · new in 1.0", "A slow ball of lightning that passes through enemies and deals Stamina damage, filling Stun Bars."),
  iceBolt: g("Eternal Ice Bolt IV", "Eternal spell · Legendary · Lv 45", "An icy projectile that deals area damage and slows."),
  shroudMeteor: g("Eternal Shroud Meteor", "Eternal spell · Legendary · Lv 45", "Calls down a Shroud Meteor on up to five foes."),
  entangle: g("Eternal Entangle", "Eternal spell · Rare · Lv 45 · new in 1.0", "Roots enemies in an area (bigger enemies are slowed instead). Rooted enemies can still attack."),
  hollowWretch: g("Eternal Hollow Wretch II", "Eternal summon · Legendary · Lv 45 · new in 1.0", "Summons a Hollow Wretch ally. The default cap is 1 Hollow ally and skills raise it. Crafted by the Collector."),
  hollowWretchCharge: g("Hollow Wretch II", "Summon spell charges · Lv 44 · new in 1.0", "Crafted by the Collector in stacks of 100 (Ectoplasm Cluster, Icy Giant Bones)."),
  fireTotem: g("Eternal Fire Totem II", "Eternal summon · Legendary · Lv 45 · new in 1.0", "A totem that fires fiery projectiles and explodes when it expires. Default cap is 1 totem."),
  iceTotem: g("Eternal Ice Totem II", "Eternal summon · Legendary · Lv 45 · new in 1.0", "A totem that fires icy projectiles and slows enemies."),
  shockTotem: g("Eternal Shock Totem", "Eternal summon · Legendary · Lv 45 · new in 1.0", "A totem that fires shock projectiles that also deal Stamina damage."),
  bonestorm: g("Eternal Bonestorm II", "Eternal spell · Legendary · Lv 45", "A flurry of homing bone projectiles. Crafted by the Collector."),
  healBeam: g("Eternal Heal Beam II", "Eternal spell · Legendary · Lv 45", "An aimed mending ray that continuously heals allies inside it."),
  chainHeal: g("Eternal Chain Heal II", "Eternal spell · Legendary · Lv 45", "A mending ray that seeks out nearby allies automatically."),
  barrier: g("Eternal Protective Barrier", "Eternal spell · Rare · Lv 45", "Crafted by the Alchemist (Archaic Infusion, Archaic Cores, Sparkling Dust)."),
  shockWisp: g("Shock Wisp I", "Spell charges · Lv 12", "A wisp that follows you and throws shock projectiles that fill Stun Bars."),
} satisfies Record<string, Gear>;

/** Food buffs from the wiki food tables. The tables were last edited before 1.0, so values may have been rebalanced. */
export type Food = { name: string; effect: string };
export const FOOD: Record<string, Food> = {
  algaeSalad: { name: "Algae Salad", effect: "+120 Mana, +21% Magic damage (55 min)" },
  roastedShiitake: { name: "Roasted Shiitake Mushroom", effect: "+21% Magic damage (50 min)" },
  yellowGlowSoup: { name: "Yellow Glow Soup", effect: "+100 Mana, +10 Mana regen, +18% Magic damage (50 min)" },
  latte: { name: "Latte", effect: "+30 Stamina, +6% Magic damage (55 min)" },
  candiedGinger: { name: "Candied Ginger", effect: "+48 Mana regeneration (9 min)" },
  meatWrap: { name: "Meat Wrap", effect: "+200 Health, +6% Magic damage (45 min)" },
  taroCurry: { name: "Taro Root Curry", effect: "+60 Mana, +21% Ranged and Dagger damage (55 min)" },
  pumpkinSoup: { name: "Pumpkin Soup", effect: "+12 Stamina regen, +18% Ranged and Dagger damage (50 min)" },
  sweetMokka: { name: "Sweet Mokka", effect: "+30 Stamina, +6% Ranged and Dagger damage (55 min)" },
  chickenSoup: { name: "Chicken Soup", effect: "+160 Health, +6% Ranged and Dagger damage (40 min)" },
  friedRice: { name: "Fried Rice", effect: "+10 Stamina, +21% Melee damage (55 min)" },
  blackCoffee: { name: "Black Coffee", effect: "+30 Stamina, +6% Melee damage (55 min)" },
  beefStew: { name: "Beef Stew", effect: "+240 Health, +12 Health regen (50 min)" },
  crabCakes: { name: "Crab Cakes", effect: "+280 Health, +21% damage vs Wildlife (55 min)" },
  plantainCurry: { name: "Plantain Curry", effect: "+21 Health regen, +9 Stamina regen (55 min)" },
  coconutMilk: { name: "Coconut Milk", effect: "+60 Stamina, +27 Stamina regen (50 min)" },
  herbalTea: { name: "Herbal Mountain Tea", effect: "+100 Mana, +50 Stamina, +24 Stamina regen (50 min)" },
};

/** New 1.0 foods confirmed by the wiki; buff values not yet documented there. */
export const NEW_FOODS = ["Grandleaf Cabbage Rolls", "Prickle Pearl Tart", "Exotic Fruit Salad", "Pearlbloom Nectar", "Thyme Tea", "Grilled Cinderscale"];
