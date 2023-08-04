export default class DarkSoulsItem extends Item {
  /** @override */
  prepareData() {
    // As with the actor class, items are documents that can have their data
    // preparation methods overridden (such as prepareBaseData()).
    super.prepareData();
  }

  /**
     * @override
     * Augment item data with additional dynamic data.
     */
  prepareDerivedData() {
    const itemData = this;
    const flags = itemData.flags.darksouls || {};
  }

  /**
     * Prepare a data object which is passed to any Roll formulas which are created related to this Item
     * @override
     */
  getRollData() {
    // If present, return the actor's roll data.
    if ( !this.actor ) return null;
    const rollData = this.actor.getRollData();
    rollData.item = foundry.utils.deepClone(this.system);
    
    return rollData;
  }

  get isEffectSuppressed() {
    if (!(this.type === "armor")) return !(this.system?.equipped ?? true);

    const equippedArmor = this.parent?.system?.equippedItems?.armor;

    return !(this.system.equipped && (equippedArmor instanceof Object) && Object.values(equippedArmor).map(a => this.parent.items.get(a)).every(a => a?.system?.setId === this.system.setId));
  }

  /**
   * Get the Actor which is the author of a chat card
   * @param {HTMLElement} card    The chat card being used
   * @returns {Actor|null}        The Actor document or null
   * @private
   */
  static async _getChatCardActor(card) {

    // Case 1 - a synthetic actor from a Token
    if ( card.dataset.tokenId ) {
      const token = await fromUuid(card.dataset.tokenId);
      if ( !token ) return null;
      return token.actor;
    }

    // Case 2 - use Actor ID directory
    const actorId = card.dataset.actorId;
    return game.actors.get(actorId) || null;
  }
}