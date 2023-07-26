import { onManageActiveEffect, prepareActiveEffectCategories } from "../helpers/effects.mjs";

export default class DarkSoulsActorSheet extends ActorSheet {
  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["darksouls", "sheet", "actor"],
      template: "systems/darksouls/templates/actor/actor-sheet.html",
      width: 600,
      height: 800,
      tabs: [{navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "stats" }]
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
    DarkSoulsActorSheet.#addStatLabels(context);
    DarkSoulsActorSheet.#prepareConsumables(context);

    context.DARKSOULS = CONFIG.DARKSOULS;

    // Add roll data for TinyMCE editors
    context.rollData = context.actor.getRollData();

    // Prepare active effects
    context.effects = prepareActiveEffectCategories(this.actor.effects);

    return context;
  }

  static #prepareArmor(context) {
    const armor = context.items.filter(item => item.type === "armor");

    const armorBySlot = {
      head: armor.filter(item => item.system.slot === "head"),
      torso: armor.filter(item => item.system.slot === "torso"),
      legs: armor.filter(item => item.system.slot === "legs")
    };

    context.armor = armor;
    context.armorBySlot = armorBySlot;
  }

  static #prepareConsumables(context) {
    const consumables = context.items.filter(item => item.type === "consumable");

    const equippedConsumables = consumables.filter(item => Boolean(item.system.equipped));

    context.consumables = consumables;
    context.equippedConsumables = equippedConsumables;
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
    html.find(".click-damage").click(this.#onDamageCalc.bind(this));
    // Equip armor
    html.find(".armor-select").change(this.#onArmorEquip.bind(this));
    // Equip consumables
    html.find(".item-equip-checkbox").change(this.#onConsumableEquip.bind(this));
    // Update consumable quantity
    html.find(".qty-field").change(this.#onQuantityUpdate.bind(this));
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

      const defensePower = (attackIsMagical ? (targetData.magDef) : (targetData.physDef)) || 0;

      const damage = Math.min(Math.ceil((attackPower - defensePower) / 10), 7);

      damageStrings.push(`<div>Damage to ${targetName}: ${damage}</div>`);
    }

    if (damageStrings.length < 1) return;

    // Build chat card

    const speaker = ChatMessage.getSpeaker();
    const type = CONST.CHAT_MESSAGE_TYPES.OTHER;
    const flavor = `Attack Power: ${attackPower} (${attackIsMagical ? "Magical" : "Physical"})`;
    const content = `${this.actor.name} attacks!\n${damageStrings.join("\n")}`;

    return ChatMessage.create({
      speaker,
      type,
      flavor,
      content
    });
  }

  async #onArmorEquip(event) {
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

  async #onConsumableEquip(event) {
    event.preventDefault();

    // Get the item this event is attached to
    const element = event.currentTarget;
    const itemId = element.closest(".item").dataset.itemId;
    const item = this.actor.items.get(itemId) || null;

    // If it's not a valid item, don't do anything else
    if (!item) return;

    const equippedConsumables = this.actor.system.equippedConsumables;

    if (item.system.equipped) {
      // If it's equipped, just unequip it
      await item.update({"system.equipped": false});
    } else if (equippedConsumables.length >= 3) {
      // If there are already 3 consumables equipped, notify the user
      ui.notifications.notify(game.i18n.localize("DARKSOULS.TooManyConsumablesError"), "warning");
      element.checked = false;
    } else {
      // If there's room, equip the item
      await item.update({"system.equipped": true});
    }
  }

  async #onQuantityUpdate(event) {
    event.preventDefault();

    // Get the item this event is attached to
    const element = event.currentTarget;
    const itemId = element.closest(".item").dataset.itemId;
    const item = this.actor.items.get(itemId) || null;

    // If it's not a valid item, don't do anything else
    if (!item) return;

    // If it is, update the quantity
    const qty = element.value;

    await item.update({"system.qty": qty});
  }
}