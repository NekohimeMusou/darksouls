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

    this._prepareQty();
    this._prepareConsumables();
    this._prepareWeaponData();
  }

  _prepareQty() {
    const qty = this.system?.qty || 0;

    if (qty < 1) {
      const updates = {"system.equipped": false};

      if (Object.hasOwn(this.system, "wielded")) {
        updates["system.wielded"] = false;
      }

      this.update(updates);
    }
  }

  _prepareConsumables() {
    if (!this.type === "consumable") return;

    const systemData = this.system;

    // Is this ammunition?
    const consumableType = systemData.consumableType || "";

    systemData.isAmmunition = consumableType === "arrow" || consumableType === "bolt";
  }

  _prepareWeaponData() {
    if (!this.type === "weapon") return;

    const systemData = this.system;

    // Calculate modified damage
    const totalDmg = {
      1: this._calcDamage(1),
      2: this._calcDamage(2)
    };

    if (!systemData.chain && !this.isRangedWeapon) {
      systemData.chainHits = 1;
    }

    const chainDmg = Object.fromEntries(
      Object.keys(totalDmg).map(grip => [
        grip,
        Object.fromEntries([0, 1, 2, 3, 4]
          .map(i => [i, i * totalDmg[grip]]))
      ]));

    // FIXTHIS: Come up with a more elegant solution for this BS
    // Move to context?
    systemData.canAttack = this.canAttack;
    systemData.canGuard = this.canGuard;
    systemData.noChain = this.noChain;
    systemData.isRangedWeapon = this.isRangedWeapon;
    systemData.totalDmg = totalDmg;
    systemData.chainDmg = chainDmg;
  }

  _calcDamage(grip) {
    const baseDmg = this.system?.baseDmg?.[grip] || 0;

    const ammoBonus = this.actor?.wieldedAmmunition?.[this.ammoType]?.system?.damageBonus || 0;
    const statModBonus = this._powerModBonus;
    const enhanceBonus = this._enhanceBonus;

    // If there's no base damage, don't add bonuses and just return 0
    return baseDmg ? baseDmg + statModBonus + enhanceBonus + ammoBonus : 0;
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

  get has1hGrip() {
    const systemData = this.system;

    // It can be equipped in 1 hand if it has 1h base damage or if it's a catalyst or shield
    return this.type !== "consumable" && (Boolean(systemData?.baseDmg?.[1]) || systemData.category === "catalyst" || systemData.category === "shield");
  }

  get has2hGrip() {
    const systemData = this.system;

    // It can be equipped in 2 hands if it has 2h base damage
    return this.type !== "consumable" && Boolean(systemData?.baseDmg?.[2]);
  }

  get is2hOnly() {
    return this.has2hGrip && !this.has1hGrip;
  }

  get isRangedWeapon() {
    const systemData = this.system;

    return systemData.category === "bow" || systemData.category === "crossbow";
  }

  get isAmmunition() {
    const systemData = this.system;

    return (systemData?.consumableType === "arrow" || systemData?.consumableType === "bolt");
  }

  get noChain() {
    return !this.system.chain && !this.isRangedWeapon;
  }

  get ammoType() {
    const systemData = this.system;

    switch (systemData?.category) {
    case "bow":
      return "arrow";
    case "crossbow":
      return "bolt";
    default:
      return null;
    }
  }

  get canGuard() {
    return Boolean(this.system?.guardCost);
  }

  get canAttack() {
    return Boolean(this.system?.attackCost);
  }

  get currentGrip() {
    const wieldedItems = this?.actor?.system?.wieldedItems?.["weapon"] ?? null;

    if (this.type !== "weapon" || !this.system.wielded || !wieldedItems) return 0;

    return this.has2hGrip && wieldedItems.length < 2 ? 2 : 1;
  }

  /**
   * Return the weapon damage with the current grip.
   */
  get damage() {
    return this.system?.totalDmg?.[this.currentGrip] || 0;
  }

  /**
   * If this item type has no prereqs, return true.
   * If no actor is associated with the item, return false.
   */
  get prereqsMet() {
    const prereqs = Object.values(this.system?.prereqs).filter?.(p => p.stat);
    const pcStats = this.actor?.system?.stats;

    return !prereqs || (Boolean(pcStats) && prereqs.every(p => pcStats[p.stat].value >= p.value));
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

    return createMessage ? await ChatMessage.create(chatData) : chatData;
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