export const DARKSOULS = {};

DARKSOULS.moduleID = "DARKSOULS",

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
  poison: "DARKSOULS.Poison",
  bleeding: "DARKSOULS.Bleeding",
  dark: "DARKSOULS.Dark",
  cold: "DARKSOULS.Cold",
  magic: "DARKSOULS.Magic",
  fire: "DARKSOULS.Fire",
  lightning: "DARKSOULS.Lightning"
};

DARKSOULS.consumableTypes = {
  medicine: "DARKSOULS.Medicine",
  throwingKnives: "DARKSOULS.ThrowingKnives",
  throwingJar: "DARKSOULS.ThrowingJar",
  pineResin: "DARKSOULS.PineResin",
  talisman: "DARKSOULS.Talisman",
  currency: "DARKSOULS.Currency"
};

DARKSOULS.equipmentCaps = {
  consumable: 3,
  ring: 2
};

DARKSOULS.weaponSizes = {
  small: {
    name: "DARKSOULS.Small",
    enhanceBonus: 2
  },
  medium: {
    name: "DARKSOULS.Medium",
    enhanceBonus: 3
  },
  large: {
    name: "DARKSOULS.Large",
    enhanceBonus: 4
  },
  special: {
    name: "DARKSOULS.Special",
    enhanceBonus: 5
  }
};

DARKSOULS.baseEnhanceBonus = {
  small: 2,
  medium: 3,
  large: 4,
  special: 5
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
  shield: "DARKSOULS.Shield"
};

const validPowerMods = ["str", "dex", "int", "fth", "luc"];

DARKSOULS.powerMods = Object.fromEntries(validPowerMods.map(s => [s, s.toLocaleUpperCase()]));
