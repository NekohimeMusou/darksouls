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
  }

  /**
     * @override
     * Augment actor data with additional dynamic data.
     */
  prepareDerivedData() {
    const actorData = this;
    const flags = actorData.flags.darksouls || {};

    DarkSoulsActor.#preparePcData(actorData);
    DarkSoulsActor.#prepareMonsterData(actorData);
  }

  static #preparePcData(actorData) {
    if (actorData.type !== 'pc') return;

    DarkSoulsActor.#preparePcStats(actorData);
    DarkSoulsActor.#prepareArmor(actorData);
    DarkSoulsActor.#prepareEquipLoad(actorData);
  }

  static #preparePcStats (actorData) {
    // Calculate stat totals and modifiers
    const stats = Object.values(actorData.system.stats);

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

    actorData.system.level = {
      value: level,
      mod: Math.floor(level / 4)
    };
  }

  static #prepareArmor(actorData) {
    const systemData = actorData.system;

    // Filter out all unequipped armor
    const equippedArmor = actorData.items.filter(
      item => item.type === 'armor' && item.system.equipped
    );

    // Calculate physical and magical defense and weight
    // Level bonus has been calculated in #calculatePcStats
    systemData.physDef = equippedArmor.reduce((phys, armor) => phys + (armor?.system.physDef || 0), 0) + systemData.level.mod;
    systemData.magDef = equippedArmor.reduce((mag, armor) => mag + (armor?.system.magDef || 0), 0) + systemData.level.mod;
  }

  static #prepareEquipLoad(actorData) {
    const systemData = actorData.system;

    // Get a list of everything that contributes to equip load
    const equipment = actorData.items.filter(i => (i.type ==='armor' || i.type === 'weapon') && i.system.equipped);

    // Calculate total weight and add to system data
    const totalWeight = equipment.reduce((wgt, i) => wgt + (i?.system.weight || 0), 0);
    systemData.totalWeight = totalWeight;

    const vit = systemData.stats[CONFIG.DARKSOULS.equipLoadStat].value;

    const evadeIndex = Math.min(Math.max(Math.floor((totalWeight-1)/vit), 0), 3);

    [systemData.equipLoadLevel, systemData.evadeCost] = CONFIG.DARKSOULS.evasion[evadeIndex];
  }

  static #prepareMonsterData(actorData) {
    if (actorData.type !== 'monster') return;
  }

  /** @override */
  getRollData() {
    const data = foundry.utils.deepClone(super.getRollData());

    this.#getPcRollData(data);
    this.#getMonsterRollData(data);

    return data;
  }

  #getPcRollData(data) {
    if (this.type !== 'pc') return;

    // Copy stats to top level
    if (data.stats) {
      for (let [k, v] of Object.entries(data.stats)) {
        // Fix this to use the base + growth value too
        data[k] = v.base + v.growth;
        data[`${k}Mod`] = v.mod;
      }
    }
  }

  #getMonsterRollData(data) {
    if (this.type !== 'monster') return;
  }
}