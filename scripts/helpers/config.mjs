export const DARKSOULS = {};

DARKSOULS.moduleID = 'DARKSOULS',

DARKSOULS.stats = {
  vig: 'DARKSOULS.Vigor',
  atn: 'DARKSOULS.Attunement',
  vit: 'DARKSOULS.Vitality',
  str: 'DARKSOULS.Strength',
  dex: 'DARKSOULS.Dexterity',
  int: 'DARKSOULS.Intelligence',
  fth: 'DARKSOULS.Faith',
  luc: 'DARKSOULS.Luck',
};

DARKSOULS.armorSlots = {
  head: 'DARKSOULS.HeadSlot',
  torso: 'DARKSOULS.TorsoSlot',
  legs: 'DARKSOULS.LegSlot'
};

DARKSOULS.equipLoadStat = 'vit';

DARKSOULS.evasion = [
  ['DARKSOULS.EquipLoadLight', 6],
  ['DARKSOULS.EquipLoadMedium', 8],
  ['DARKSOULS.EquipLoadHeavy', 10],
  ['DARKSOULS.EquipLoadOver', 'N/A']
];

DARKSOULS.damageTypes = {
  poison: 'DARKSOULS.PoisonType',
  bleeding: 'DARKSOULS.BleedingType',
  dark: 'DARKSOULS.DarkType',
  cold: 'DARKSOULS.ColdType',
  magic: 'DARKSOULS.MagicType',
  fire: 'DARKSOULS.FireType',
  lightning: 'DARKSOULS.LightningType'
};
