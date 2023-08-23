export default class DarkSoulsActor extends Actor {
  /** 
   * @override
   * @inheritdoc
   * */
  prepareData() {
    // Prepare data for the actor. Calling the super version of this executes
    // the following, in order: data reset (to clear active effects),
    // prepareBaseData(), prepareEmbeddedDocuments() (including active effects),
    // prepareDerivedData().
    super.prepareData();
  }

  /** 
   * @override
   * @inheritdoc
   *  */
  prepareBaseData() {
    // Data modifications in this step occur before processing embedded documents or derived data
    this._prepareStats();
    this._prepareResources();
  }

  /**
     * Augment actor data with additional dynamic data.
     * @override
     * @inheritdoc
     */
  prepareDerivedData() {
    const flags = this.flags.darksouls || {};

    // Containers for equipped/wielded items
    this.system.equippedItems = {};
    this.system.wieldedItems = {};

    this._prepareWeapons();
    this._prepareArmor();
    this._prepareEquipLoad();
    this._prepareConsumables();
    this._prepareRings();
  }

  /**
   * Calculate the base data for a PC. This includes:
   * 
   * - Stat totals and modifiers
   * - Level and level modifier
   * - Base spell power
   * - Initiative mod
   * @protected
   */
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

  /**
   * Calculate base HP, FP, and Luck Point caps.
   * @protected
   */
  _prepareResources() {
    const systemData = this.system;
    const stats = systemData.stats;

    systemData.hp.max = 5 + stats.vig?.mod || 0;
    systemData.fp.max = 5 + stats.atn?.mod || 0;
    systemData.luckPts.max = 5 + stats.luc?.mod || 0;
  }

  /**
   * Sort equipped armor and calculate defense values.
   * @protected
   */
  _prepareArmor() {
    const systemData = this.system;

    // Sort equipped armor by slot for ease of access
    const equipped = this.items.filter(i => i.type === "armor" && i.system.equipped);

    const equippedArmor = {
      head: equipped.find(i => i.system.slot === "head") || null,
      torso: equipped.find(i => i.system.slot === "torso") || null,
      legs: equipped.find(i => i.system.slot === "legs") || null
    };

    // Calculate physical and magical defense
    const levelMod = systemData?.level?.mod || 0;

    const defense = {
      phys: Object.values(equippedArmor)
        .reduce((total, armor) => total + (armor?.system.defense["phys"] || 0), 0) + levelMod,
      mag: Object.values(equippedArmor)
        .reduce((total, armor) => total + (armor?.system.defense["mag"] || 0), 0) + levelMod
    };

    systemData.defense = defense;
    systemData.equippedItems["armor"] = equippedArmor;
  }

  /**
   * Sort equipped consumables.
   * Ammunition is "wielded" to indicate that it's the current type in use.
   */
  _prepareConsumables() {
    const equipped = this.items.filter(i => i.type === "consumable" && i.system?.equipped && i.system?.qty >= 1);

    const wielded = equipped.filter(i => i.system?.wielded);

    this.system.wieldedItems["consumable"] = wielded;
    this.system.equippedItems["consumable"] = equipped;
  }

  /**
   * Sort equipped rings.
   */
  _prepareRings() {
    const equippedRings = this.items.filter(i => i.type === "ring" && i.system.equipped);

    this.system.equippedItems["ring"] = equippedRings;
  }

  /**
   * Sort items into "equipped" (one of the 3 equipped items on the main page)
   * and "wielded" (actually held in hand)
   *  */
  _prepareWeapons() {
    const equippedWeapons = this.items.filter(i => i.type === "weapon" && i.system.equipped);

    const wielded = equippedWeapons.filter(i => i.system?.wielded);

    this.system.wieldedItems["weapon"] = wielded;
    this.system.equippedItems["weapon"] = equippedWeapons;
  }

  /**
   * Calculate weight, equip load, and evade cost.
   */
  _prepareEquipLoad() {
    const systemData = this.system;

    // Get everything that contributes to equip load
    const equipment = this.items.filter(i => (i.type ==="armor" || i.type === "weapon") && i.system.equipped);

    // Calculate total weight and add to system data
    const totalWeight = equipment.reduce((wgt, i) => wgt + (i?.system.weight || 0), 0);
    systemData.totalWeight = totalWeight;

    // Find the load level and evade cost for the current weight
    const vit = systemData.stats[CONFIG.DARKSOULS.equipLoadStat].value;

    const evadeIndex = Math.min(Math.max(Math.floor((totalWeight-1)/vit), 0), 3);

    [systemData.equipLoadLevel, systemData.evadeCost] = CONFIG.DARKSOULS.evasion[evadeIndex];
  }

  /** 
   * @override
   * @inheritdoc
   */
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

  /**
   * @returns an Object containing the wielded bolts and arrows, if any
   */
  get wieldedAmmunition() {
    const wieldedAmmunition = {
      bolt: this.items.find(i => i.system?.consumableType === "bolt" && i.system?.wielded),
      arrow: this.items.find(i => i.system?.consumableType === "arrow" && i.system?.wielded)
    };

    return wieldedAmmunition;
  }
}