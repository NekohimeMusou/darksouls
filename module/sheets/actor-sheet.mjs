import { onManageActiveEffect, prepareActiveEffectCategories } from "../helpers/effects.mjs";

export default class DarkSoulsActorSheet extends ActorSheet {
  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["darksouls", "sheet", "actor"],
      template: "systems/darksouls/templates/actor/actor-sheet.html",
      width: 800,
      height: 800,
      tabs: [{navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "stats"}]
    });
  }

  /** @override */
  getData() {
    const context = super.getData();

    const actorData = this.actor.toObject(false);

    // Add the actor's data to context.data for easier access, as well as flags
    context.system = actorData.system;
    context.flags = actorData.flags;

    // Prepare character data and items
    DarkSoulsActorSheet.#prepareArmor(context);
    DarkSoulsActorSheet.#prepareConsumables(context);
    DarkSoulsActorSheet.#prepareRings(context);
    DarkSoulsActorSheet.#prepareWeapons(context);

    context.equippedItems = actorData.system.equippedItems;

    DarkSoulsActorSheet.#addStatLabels(context);

    // Add global data to context
    context.DARKSOULS = CONFIG.DARKSOULS;

    // Add roll data for TinyMCE editors
    context.rollData = context.actor.getRollData();

    // Prepare active effects
    context.effects = prepareActiveEffectCategories(this.actor.effects);

    return context;
  }

  static #prepareArmor(context) {
    const armor = context.items.filter(i => i.type === "armor");

    const armorBySlot = {
      head: armor.filter(i => i.system.slot === "head"),
      torso: armor.filter(i => i.system.slot === "torso"),
      legs: armor.filter(i => i.system.slot === "legs")
    };

    context.armor = armor;
    context.armorBySlot = armorBySlot;
  }

  static #prepareConsumables(context) {
    const consumables = context.items.filter(i => i.type === "consumable");

    context.consumables = consumables;
  }

  static #prepareRings(context) {
    const rings = context.items.filter(i => i.type === "ring");

    context.rings = rings;
  }

  static #prepareWeapons(context) {
    const weapons = context.items.filter(i => i.type === "weapon");

    context.weapons = weapons;
  }

  static #addStatLabels(context) {
    // Add labels for ability scores
    // There's probably a smoother way to do this
    for (const [k, v] of Object.entries(context.system.stats)) {
      v.label = game.i18n.localize(CONFIG.DARKSOULS.stats[k]) ?? k;
    }
  }

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Render the item sheet for viewing/editing prior to the editable check.
    html.find(".item-edit").click(ev => {
      const li = $(ev.currentTarget).parents(".item");
      const item = this.actor.items.get(li.data("itemId"));
      item.sheet.render(true);
    });

    // Everything below here is only needed if the sheet is editable
    if (!this.isEditable) return;

    // Add Inventory Item
    html.find(".item-create").click(this.#onItemCreate.bind(this));

    // Delete Inventory Item
    html.find(".item-delete").click(ev => {
      const li = $(ev.currentTarget).parents(".item");
      const item = this.actor.items.get(li.data("itemId"));
      item.delete();
      li.slideUp(200, () => this.render(false));
    });

    // Active Effect management
    html.find(".effect-control").click(ev => onManageActiveEffect(ev, this.actor));

    // Drag events for macros.
    if (this.actor.isOwner) {
      let handler = ev => this._onDragStart(ev);
      html.find("li.item").each((_, li) => {
        if (li.classList.contains("inventory-header")) return;
        li.setAttribute("draggable", true);
        li.addEventListener("dragstart", handler, false);
      });
    }

    // Ability checks
    html.find(".roll-stat").click(this.#onStatRoll.bind(this));
    // Damage calculation
    // NOTE: Only used on temporary damage pane
    html.find(".click-damage").click(this.#onDamageCalc.bind(this));
    // Weapon attack
    html.find(".click-weapon-attack").click(this.#onWeaponAttack.bind(this));
    // Weapon chain hits
    html.find(".item-chain-hits").change(this.#onChainSelect.bind(this));
    // Equip armor
    html.find(".item-select").change(this.#onItemSelect.bind(this));
    // Equip consumables
    html.find(".item-equip-control").change(this.#onItemEquip.bind(this));
    // Wield weapons
    html.find(".item-wielded-control").change(this.#onWield.bind(this));
    // Use item
    html.find(".use-item").click(this.#onItemUse.bind(this));
  }

  /**
   * Handle creating a new Owned Item for the actor using initial data defined in the HTML dataset
   * @param {Event} event   The originating click event
   * @private
   */
  async #onItemCreate(event) {
    event.preventDefault();
    const header = event.currentTarget;
    // Get the type of item to create.
    const type = header.dataset.type;
    // Grab any data associated with this control.
    const system = duplicate(header.dataset);
    // Initialize a default name.
    const name = `New ${type.capitalize()}`;
    // Prepare the item object.
    const itemData = {
      name,
      type,
      system
    };
    // Remove the type from the dataset since it's in the itemData.type prop.
    delete itemData.system["type"];

    // Finally, create the item!
    return await Item.create(itemData, {parent: this.actor});
  }

  async #onStatRoll(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const dataset = element.dataset;

    if (dataset.roll) {
      const label = dataset.label ? `${dataset.label} Check:` : "";
      const roll = await new Roll(dataset.roll, this.actor.getRollData()).roll();
      roll.toMessage({
        speaker: ChatMessage.getSpeaker({ actor: this.actor }),
        flavor: label,
        rollMode: game.settings.get("core", "rollMode")
      });

      return roll;
    }
  }

  async #onDamageCalc(event) {
    event.preventDefault();

    if (game.user.targets.size < 1) {
      ui.notifications.info("No target selected.");
      return;
    }

    const actorData = this.actor.system;

    const attackPower = actorData.damage;
    const attackIsMagical = actorData.attackIsMagical;

    const damageStrings = [];

    for (const targetToken of game.user.targets) {
      if (Object.is(targetToken.actor, this.actor)) {
        ui.notifications.info("Why are you hitting yourself?!");
      }

      const targetName = targetToken.actor.name;
      const targetData = targetToken.actor.system;

      const defensePower = (attackIsMagical ? (targetData.defense["mag"]) : (targetData.defense["phys"])) || 0;

      const damage = Math.min(Math.ceil((attackPower - defensePower) / 10), 7);

      damageStrings.push(`<div>Damage to ${targetName}: ${damage}</div>`);
    }

    if (damageStrings.length < 1) return;

    // Build chat card

    const speaker = ChatMessage.getSpeaker();
    const type = CONST.CHAT_MESSAGE_TYPES.OTHER;
    const flavor = `Attack Power: ${attackPower} (${attackIsMagical ? "Magical" : "Physical"})`;
    const content = `${this.actor.name} attacks!\n${damageStrings.join("\n")}`;

    return await ChatMessage.create({
      speaker,
      type,
      flavor,
      content
    });
  }

  async #onItemSelect(event) {
    event.preventDefault();

    // Get the item this event is attached to
    const element = event.currentTarget;

    // Get the item objects by ID
    const oldItemId = element.closest(".item").dataset.itemId;
    const oldItem = this.actor.items.get(oldItemId) || null;
    const newItem = this.actor.items.get(element.value) || null;

    // Toggle equip attributes if necessary
    if (oldItem) {
      await oldItem.update({"system.equipped": false});
    }

    if (newItem) {
      await newItem.update({"system.equipped": true});
    }
  }

  async #onItemEquip(event) {
    event.preventDefault();

    // Get the item this event is attached to
    const element = event.currentTarget;
    const itemId = element.closest(".item").dataset.itemId;
    const item = this.actor.items.get(itemId) || null;

    // If it's not a valid item, don't do anything else
    if (!item) return;

    // If it's already equipped, we don't have to check anything
    if (item.system.equipped) {
      const updates = {"_id": item.id, "system.equipped": false};
      if (item.type === "weapon" || item.type === "consumable") updates["system.wielded"] = false;
      return await this.actor.updateEmbeddedDocuments("Item", [updates]);
    }

    // If the item doesn't exist, don't equip it
    if (item.system.qty < 1) {
      element.checked = false;
      return await ui.notifications.notify(game.i18n.localize("DARKSOULS.ZeroQtyMsg"), "info");
    }

    /* TODO: If the item has prerequisites, check them */
    // if (item.system.prereqs) {

    // }

    const equippedItems = this.actor.system.equippedItems[item.type];

    const equipCap = CONFIG.DARKSOULS.equipmentCaps[item.type]?.cap || 0;

    // FIXTHIS: Add logic to equip 1 arrow and 1 bolt
    if (equipCap && equippedItems.length >= equipCap) {
      element.checked = false;
      const msg = CONFIG.DARKSOULS.equipmentCaps[item.type]?.msg || "Unknown Item Equip Error";
      return await ui.notifications.notify(game.i18n.localize(msg), "info");
    }

    return await item.update({"system.equipped": true});
  }

  async #onItemUse(event) {
    event.preventDefault();

    // Get the item this event is attached to
    const element = event.currentTarget;
    const dataset = element.closest(".item").dataset;
    const itemId = dataset.itemId;
    const item = this.actor.items.get(itemId) || null;

    // If it's not a valid item, don't do anything else
    if (!item) return;

    const canConsume = item.type === "consumable" && dataset?.canConsumeItem;
    const consumeByDefault = game.settings.get("darksouls", "consumeItemByDefault");
    const isShiftHeld = event.shiftKey;

    const itemConsumed = canConsume && consumeByDefault ^ isShiftHeld;

    if (itemConsumed) {
      const newQty = item.system.qty - 1;

      await this.actor.updateEmbeddedDocuments("Item", [{_id: item.id, "system.qty": newQty}]);
    }

    return await item.showChatCard({itemConsumed});
  }

  async #onWield(event) {
    event.preventDefault();

    // Get the item this event is attached to
    const element = event.currentTarget;
    const dataset = element.closest(".item").dataset;
    const itemId = dataset.itemId;
    const newItem = this.actor.items.get(itemId) || null;

    // Array of wielded items
    const newItemType = newItem?.type;
    const wieldedItems = this.actor.system?.wieldedItems?.[newItemType];

    if (!(Array.isArray(wieldedItems))) return;

    const updates = [{"_id": newItem.id, "system.wielded": element.checked}];

    // Extra logic if we're equipping something
    if (element.checked) {
      if (newItemType === "weapon") {
        // If it's 1H and two 1H weapons are already wielded, stop and complain
        if (newItem.has1hGrip && wieldedItems.length > 1) {
          element.checked = false;
          return await ui.notifications.info(game.i18n.localize("DARKSOULS.HandsFullMsg"));
        }

        // If the new item is 2h only or the old item was 2h only, un-wield all old items
        if (newItem.is2hOnly || wieldedItems.some(i => i.is2hOnly)) {
          updates.push(...wieldedItems.map(i => ({"_id": i.id, "system.wielded": false})));
        }
      }

      // If the new item is ammunition, un-wield other ammo of the same type
      if (newItem.isAmmunition) {
        const ammoType = newItem.system.consumableType;
        const wieldedAmmo = wieldedItems.filter(i => i.system.consumableType === ammoType);
        updates.push(...wieldedAmmo.map(i => ({_id: i.id, "system.wielded": false})));
      }
    }

    // Update the item(s)
    this.actor.updateEmbeddedDocuments("Item", updates);
  }

  async #onWeaponAttack(event) {
    event.preventDefault();

    // Get the item this event is attached to
    const element = event.currentTarget;
    const dataset = element.closest(".item").dataset;
    const itemId = dataset.itemId;
    const item = this.actor.items.get(itemId) || null;

    // If it's not a valid item, don't do anything else
    if (!item || !item.type === "weapon") return;

    if (!item.system.wielded) {
      return await ui.notifications.info(game.i18n.localize("DARKSOULS.NotWieldedMsg"));
    }

    const targets = game.user.targets;

    if (targets.size < 1) {
      return await ui.notifications.info(game.i18n.localize("DARKSOULS.NoTargetMsg"));
    }

    // If this weapon uses ammo, get the user's currently wielded ammo of that type, if any
    const ammoType = CONFIG.DARKSOULS.ammoTypes?.[item.system?.category];
    const ammunition = this.actor.wieldedAmmunition?.[ammoType];

    if (ammoType && !ammunition) {
      return await ui.notifications.info(game.i18n.localize("DARKSOULS.NoAmmunitionMsg"));
    }

    // If 2 weapons are wielded OR there's no 2H damage, use the 1H damage
    const wieldedItems = this.actor.system.wieldedItems["weapon"];
    const dmgValues = item.system.totalDmg;
    const weaponDmg = (wieldedItems.length > 1 || !dmgValues?.["2h"] ? dmgValues?.["1h"] : dmgValues?.["2h"]) || 0;
    const chainHits = item.system.chainHits;
    const totalDmg = weaponDmg * chainHits;

    const damageCategory = item.system.magical ? "mag" : "phys";
    const damageTypes = new Set([item.system?.damageType ?? "physical"]);
    const ammoDamageType = ammunition?.system?.damageType;

    if (ammoDamageType) {
      damageTypes.add(ammoDamageType);
    }

    const damageStrings = [];

    for (const target of targets) {
      // If they have themselves targeted, make fun of 'em
      if (Object.is(target.actor, this.actor)) {
        await ui.notifications.info(game.i18n.localize("DARKSOULS.HitYourselfMsg"));
        continue;
      }

      const targetName = target.actor.name;
      const targetData = target.actor.system;

      const defense = targetData?.defense?.[damageCategory] || 0;
      const resist = damageTypes.reduce(
        (total, damageType) => total + (targetData?.resistances?.resistance?.[damageType] || 0), 0);
      const weakness = damageTypes.reduce(
        (total, damageType) => total + (targetData?.resistances?.weakness?.[damageType] || 0), 0);

      const HpDmg = Math.min(Math.max(Math.ceil((totalDmg - defense) / 10), 0), 7) + weakness - resist;

      damageStrings.push(`<div>${targetName}: ${HpDmg} Damage</div>`);
    }

    // Subtract ammunition if it's a ranged weapon
    if (ammunition) {
      const newQty = ammunition.system.qty - 1;

      await this.actor.updateEmbeddedDocuments("Item", [{_id: ammunition.id, "system.qty": newQty}]);
    }

    // Build chat card
    const physOrMag = damageTypes.size === 1 && damageTypes.has("physical") 
      ? ""
      : ` (${game.i18n.localize(CONFIG.DARKSOULS.damageCategories[damageCategory])})`;
    const damageTypeString = `${Array.from(damageTypes.map(t => game.i18n.localize(CONFIG.DARKSOULS.damageTypes[t])))
      .join(" / ")}${physOrMag}`;

    const speaker = ChatMessage.getSpeaker();
    const type = CONST.CHAT_MESSAGE_TYPES.OTHER;
    const flavor = `${item.name}: ${totalDmg} ${damageTypeString}`;
    const content = `<div>${this.actor.name} attacks! (${chainHits}HIT)</div>${damageStrings.join("")}`;

    return await ChatMessage.create({
      speaker,
      type,
      flavor,
      content
    });
  }

  async #onChainSelect(event) {
    event.preventDefault();

    // Get the item this event is attached to
    const element = event.currentTarget;
    const dataset = element.closest(".item").dataset;
    const itemId = dataset.itemId;
    const item = this.actor.items.get(itemId) || null;

    // If it's not a valid item, don't do anything else
    if (!item) return;

    return await item.update({"system.chainHits": element.value});
  }
}