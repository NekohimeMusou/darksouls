export const DARKSOULS = {};

DARKSOULS.moduleID = "DARKSOULS",

DARKSOULS.classes = {
  assassin: "DARKSOULS.Assassin",
  cleric: "DARKSOULS.Cleric",
  deprived: "DARKSOULS.Deprived",
  herald: "DARKSOULS.Herald",
  knight: "DARKSOULS.Knight",
  mercenary: "DARKSOULS.Mercenary",
  pyromancer: "DARKSOULS.Pyromancer",
  sorcerer: "DARKSOULS.Sorcerer",
  thief: "DARKSOULS.Thief",
  warrior: "DARKSOULS.Warrior"
};

DARKSOULS.stats = {
  vig: "DARKSOULS.Vigor",
  atn: "DARKSOULS.Attunement",
  vit: "DARKSOULS.Vitality",
  str: "DARKSOULS.Strength",
  dex: "DARKSOULS.Dexterity",
  int: "DARKSOULS.Intelligence",
  fth: "DARKSOULS.Faith",
  luc: "DARKSOULS.Luck",
};

DARKSOULS.armorSlots = {
  head: "DARKSOULS.Head",
  torso: "DARKSOULS.Torso",
  legs: "DARKSOULS.Legs"
};

DARKSOULS.equipLoadStat = "vit";

DARKSOULS.evasion = [
  ["DARKSOULS.EquipLoadLight", 6],
  ["DARKSOULS.EquipLoadMedium", 8],
  ["DARKSOULS.EquipLoadHeavy", 10],
  ["DARKSOULS.EquipLoadOver", "N/A"]
];

DARKSOULS.damageTypes = {
  physical: "DARKSOULS.Physical",
  poison: "DARKSOULS.Poison",
  bleeding: "DARKSOULS.Bleeding",
  dark: "DARKSOULS.Dark",
  cold: "DARKSOULS.Cold",
  magic: "DARKSOULS.Magic",
  fire: "DARKSOULS.Fire",
  lightning: "DARKSOULS.Lightning"
};

DARKSOULS.damageCategories = {
  phys: "DARKSOULS.Phys",
  mag: "DARKSOULS.Mag"
};

DARKSOULS.consumableTypes = {
  medicine: "DARKSOULS.Medicine",
  throwingKnives: "DARKSOULS.ThrowingKnives",
  throwingJar: "DARKSOULS.ThrowingJar",
  pineResin: "DARKSOULS.PineResin",
  talisman: "DARKSOULS.Talisman",
  currency: "DARKSOULS.Currency",
  arrow: "DARKSOULS.Arrow",
  bolt: "DARKSOULS.Bolt"
};

DARKSOULS.equipmentCaps = {
  consumable: {
    cap: 3,
    msg: "DARKSOULS.TooManyConsumablesMsg"
  },
  weapon: {
    cap: 3,
    msg: "DARKSOULS.TooManyWeaponsMsg"
  },
  ring: {
    cap: 2,
    msg: "DARKSOULS.TooManyRingsMsg"
  }
};

DARKSOULS.weaponSizes = {
  small: {
    name: "DARKSOULS.Small",
    enhanceMultiplier: 2
  },
  medium: {
    name: "DARKSOULS.Medium",
    enhanceMultiplier: 3
  },
  large: {
    name: "DARKSOULS.Large",
    enhanceMultiplier: 4
  },
  special: {
    name: "DARKSOULS.Special",
    enhanceMultiplier: 5
  }
};

DARKSOULS.weaponCategories = {
  dagger: "DARKSOULS.Dagger",
  straightSword: "DARKSOULS.StraightSword",
  greatsword: "DARKSOULS.Greatsword",
  curvedSword: "DARKSOULS.CurvedSword",
  thrustingSword: "DARKSOULS.ThrustingSword",
  katana: "DARKSOULS.Katana",
  axe: "DARKSOULS.Axe",
  hammer: "DARKSOULS.Hammer",
  greatHammer: "DARKSOULS.GreatHammer",
  spear: "DARKSOULS.Spear",
  halberd: "DARKSOULS.Halberd",
  reaper: "DARKSOULS.Reaper",
  whip: "DARKSOULS.Whip",
  fist: "DARKSOULS.Fist",
  catalyst: "DARKSOULS.Catalyst",
  shield: "DARKSOULS.Shield",
  bow: "DARKSOULS.Bow",
  crossbow: "DARKSOULS.Crossbow"
};

DARKSOULS.ammoTypes = {
  bow: "arrow",
  crossbow: "bolt"
};

const validPowerMods = ["str", "dex", "int", "fth", "luc"];

DARKSOULS.powerMods = Object.fromEntries(validPowerMods.map(s => [s, s.toLocaleUpperCase()]));

DARKSOULS.chainHits = {
  melee: Object.fromEntries([1, 2, 3, 4].map(i => [i, `${i}HIT`])),
  ranged: Object.fromEntries([1, 2].map(i => [i, `${i}HIT`]))
};
