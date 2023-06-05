export class DarkSoulsActor extends Actor {
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
    const data = this.data.data;

    // if (this.data.type === 'monster' && typeof(data.move) === 'string') {
    //     data.move = {normal: 120};
    // }
  }

  /**
     * @override
     * Augment actor data with additional dynamic data.
     */
  prepareDerivedData() {
    const actorData = this.data;
    const data = actorData.data;
    const flags = actorData.flags.darksouls || {};

    // this._prepareCharacterData(actorData);
    // this._prepareMonsterData(actorData);
  }

  /** @override */
  getRollData() {
    const data = foundry.utils.deepClone(super.getRollData());

    // this._getCharacterRollData(data);
    // this._getMonsterRollData(data);

    return data;
  }
}