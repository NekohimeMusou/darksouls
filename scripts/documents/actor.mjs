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
    const systemData = actorData.system;
    const flags = actorData.flags.darksouls || {};

    this._preparePcData(actorData);
    this._prepareMonsterData(actorData);
  }

  _preparePcData(actorData) {
    if (actorData.type !== 'pc') return;

    const systemData = actorData.system;

    const stats = Object.values(systemData.stats);

    for (const stat of stats) {
      // TODO: Change this to base/growth format

      // Calculate stat totals
      stat.value = stat.base + stat.growth;

      // Calculate the modifier
      stat.mod = Math.floor(stat.value / 4);
    }

    // Level is (totalStats - 80)

    const statTotal = stats.reduce(
      (total, stat) => total + stat.value || 0,
      0
    );

    const level = statTotal - 80;

    systemData.level = {
      value: level,
      mod: Math.floor(level / 4)
    };
  }

  _prepareMonsterData(actorData) {
    if (actorData.type !== 'monster') return;
  }

  /** @override */
  getRollData() {
    const data = foundry.utils.deepClone(super.getRollData());

    this._getPcRollData(data);
    this._getMonsterRollData(data);

    return data;
  }

  _getPcRollData(data) {
    if (this.type !== 'pc') return;

    // Copy stats to top level
    if (data.stats) {
      for (let [k, v] of Object.entries(data.stats)) {
        // Fix this to use the base + growth value too
        data[k] = v.base;
        data[`${k}Mod`] = v.mod;
      }
    }
  }

  _getMonsterRollData(data) {
    if (this.type !== 'monster') return;
  }
}