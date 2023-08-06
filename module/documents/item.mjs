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
    const flags = this.flags.darksouls || {};

    this._prepareWeaponData();
  }

  _prepareWeaponData() {
    if (!this.type === "weapon") return;

    const systemData = this.system;

    // Calculate modified damage
    systemData.totalDmg = {
      "1h": this._calcDamage("1h"),
      "2h": this._calcDamage("2h")
    };
  }

  _calcDamage(grip) {
    const baseDmg = this.system.baseDmg?.[grip] || 0;
    const statModBonus = this._powerModBonus;
    const enhanceBonus = this._enhanceBonus;

    return baseDmg + statModBonus + enhanceBonus;
  }

  get _powerModBonus() {
    const powerMods = Object.values(this.system?.powerMods ?? {});
    const playerStats = this.actor?.system?.stats;

    return powerMods?.reduce?.((total, stat) => total + (playerStats?.[stat]?.mod || 0), 0) || 0;
  }

  get _enhanceBonus() {
    const weaponSize = this.system?.size;
    
    const enhanceLevel = this.system?.enhanceLevel || 0;

    const enhanceMultiplier = CONFIG.DARKSOULS.weaponSizes?.[weaponSize]?.enhanceMultiplier || 0;

    return enhanceLevel * enhanceMultiplier;
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

  async showChatCard({itemConsumed=false, rollMode=game.settings.get("core", "rollMode"), createMessage=true, template="systems/darksouls/templates/chat/item-card.html"}={}) {
    const speaker = ChatMessage.getSpeaker({actor: this.actor});

    const templateData = {
      actor: this.actor,
      item: this,
      data: this.getRollData(),
      itemConsumed
    };

    const content = await renderTemplate(template, templateData);

    const chatData = {
      user: game.user.id,
      type: CONST.CHAT_MESSAGE_TYPES.OTHER,
      content,
      speaker,
      rollMode
    };

    return createMessage ? ChatMessage.create(chatData) : chatData;
  }

  // TODO: Fix this so consumable effects aren't auto-activated
  get isEffectSuppressed() {
    if (!(this.type === "armor")) return !(this.system?.equipped ?? true);

    const equippedArmor = this.parent?.system?.equippedItems?.armor;

    return !(this.system.equipped && (equippedArmor instanceof Object) && Object.values(equippedArmor)
      .map(i => this.parent.items.get(i)).every(i => i?.system?.setId === this.system.setId));
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