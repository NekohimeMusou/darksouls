export default class DarkSoulsActor extends Actor {
  /** @override */
  prepareData() {
    // Prepare data for the actor. Calling the super version of this executes
    // the following, in order: data reset (to clear active effects),
    // prepareBaseData(), prepareEmbeddedDocuments() (including active effects),
    // prepareDerivedData().
    super.prepareData();
  }

  /** @override */
  prepareBaseData() {
    // Data modifications in this step occur before processing embedded documents or derived data
    this._prepareStats();
    this._prepareResources();
    
  }

  /**
     * @override
     * Augment actor data with additional dynamic data.
     */
  prepareDerivedData() {
    const flags = this.flags.darksouls || {};

    this.system.equippedItems = {};

    this._prepareWeapons();
    this._prepareArmor();
    this._prepareEquipLoad();
    this._prepareConsumables();
    this._prepareRings();
  }

  _prepareStats () {
    // Calculate stat totals and modifiers
    const stats = Object.values(this.system.stats);

    stats.forEach(
      stat => {
        stat.value = stat.base + stat.growth;
        stat.mod = Math.floor(stat.value / 4);
      }
    );

    // Calculate level and level mod
    // Level is (totalStats - 80)
    const statTotal = stats.reduce((total, stat) => total + stat.value || 0, 0);

    const level = statTotal - 80;

    this.system.level = {
      value: level,
      mod: Math.floor(level / 4)
    };

    // Calculate base spell power
    const int = stats.int?.value || 0;
    const fth = stats.fth?.value || 0;

    this.system.spellPower = {
      sorcery: int,
      miracle: fth,
      pyromancy: Math.floor((int + fth) / 2)
    };

    // Base initiative = DEX mod
    this.system.initiative = stats.dex?.mod || 0;
  }

  _prepareResources() {
    const stats = this.system.stats;

    this.system.hp.max = 5 + stats.vig?.mod || 0;
    this.system.fp.max = 5 + stats.atn?.mod || 0;
    this.system.luckPts.max = 5 + stats.luc?.mod || 0;
  }

  _prepareArmor() {
    const systemData = this.system;

    // Filter out all unequipped armor
    const equipped = this.items.filter(i => i.type === "armor" && i.system.equipped);

    const equippedArmor = {
      head: equipped.find(i => i.system.slot === "head") || null,
      torso: equipped.find(i => i.system.slot === "torso") || null,
      legs: equipped.find(i => i.system.slot === "legs") || null
    };

    // Calculate physical and magical defense and weight
    // Level bonus has been calculated in _calculatePcStats
    systemData.physDef = Object.values(equippedArmor)
      .reduce((phys, armor) => phys + (armor?.system.physDef || 0), 0) + systemData.level.mod;
    systemData.magDef = Object.values(equippedArmor)
      .reduce((mag, armor) => mag + (armor?.system.magDef || 0), 0) + systemData.level.mod;

    systemData.equippedItems["armor"] = equippedArmor;
  }

  _prepareConsumables() {
    const equippedConsumables = this.items.filter(i => i.type === "consumable" && i.system.equipped && i.system.qty >= 1);

    this.system.equippedItems["consumable"] = equippedConsumables;
  }

  _prepareRings() {
    const equippedRings = this.items.filter(i => i.type === "ring" && i.system.equipped);

    this.system.equippedItems["ring"] = equippedRings;
  }

  _prepareWeapons() {
    const equippedWeapons = this.items.filter(i => i.type === "weapon" && i.system.equipped);

    this.system.equippedItems["weapon"] = equippedWeapons;
  }

  _prepareEquipLoad() {
    const systemData = this.system;

    // Get a list of everything that contributes to equip load
    const equipment = this.items.filter(i => (i.type ==="armor" || i.type === "weapon") && i.system.equipped);

    // Calculate total weight and add to system data
    const totalWeight = equipment.reduce((wgt, i) => wgt + (i?.system.weight || 0), 0);
    systemData.totalWeight = totalWeight;

    const vit = systemData.stats[CONFIG.DARKSOULS.equipLoadStat].value;

    const evadeIndex = Math.min(Math.max(Math.floor((totalWeight-1)/vit), 0), 3);

    [systemData.equipLoadLevel, systemData.evadeCost] = CONFIG.DARKSOULS.evasion[evadeIndex];
  }

  /** @override */
  getRollData() {
    const data = foundry.utils.deepClone(super.getRollData());

    // Copy stats to top level
    if (data.stats) {
      for (let [k, v] of Object.entries(data.stats)) {
        // Fix this to use the base + growth value too
        data[k] = v.base + v.growth;
        data[`${k}Mod`] = v.mod;
      }
    }

    return data;
  }
}