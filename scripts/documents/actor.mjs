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

    this.#preparePcData(actorData);
    this.#prepareMonsterData(actorData);
  }

  static #preparePcData(actorData) {
    if (actorData.type !== "pc") return;

    const systemData = actorData.system;

    for (let [_, stat] of Object.entries(systemData.stats)) {
      // Calculate the modifier
      stat.mod = Math.floor(stat.value / 4);
    }
  }

  static #prepareMonsterData(actorData) {
    if (actorData.type !== "monster") return;
  }

  /** @override */
  getRollData() {
    const data = foundry.utils.deepClone(super.getRollData());

    this.#getPcRollData(data);
    this.#getMonsterRollData(data);

    return data;
  }

  static #getPcRollData(data) {
    if (data.type !== "pc") return;

    // Copy stats to top level
    if (data.stats) {
      for (let [k, v] of Object.entries(data.stats)) {
        data[k] = foundry.utils.deepClone(v);
      }
    }
  }

  static #getMonsterRollData(data) {
    if (data.type !== "monster") return;
  }
}