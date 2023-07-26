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
