import { onManageActiveEffect, prepareActiveEffectCategories } from "../helpers/effects.mjs";
export default class DarkSoulsItemSheet extends ItemSheet {
  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["darksouls", "sheet", "item"],
      width: 520,
      height: 480,
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "attributes" }]
    });
  }

  /** @override */
  get template() {
    const path = "systems/darksouls/templates/item";
    // Return a single sheet for all item types.
    // return `${path}/item-sheet.html`;

    // Alternatively, you could use the following return statement to do a
    // unique item sheet by type, like `weapon-sheet.html`.
    return `${path}/item-${this.item.type}-sheet.html`;
  }

  /** @override */
  getData() {
    // Retrieve base data structure.
    const context = super.getData();

    const itemData = this.item.toObject(false);

    context.system = itemData.system;
    context.flags = itemData.flags;

    // Retrieve the roll data for TinyMCE editors.
    context.rollData = {};

    const actor = this.object?.parent ?? null;

    if (actor) {
      context.rollData = actor.getRollData();
    }

    // Sort active effects into categories
    context.effects = prepareActiveEffectCategories(this.item.effects);

    Object.assign(context, this.#getItemInfo(itemData));

    context.DARKSOULS = CONFIG.DARKSOULS;

    return context;
  }

  #getItemInfo() {
    const item = this.item;

    const editLocked = item.system.editLocked;
    const attackIsPhysical = item.system?.damageType === "physical";
    const isTorsoArmor = item.type === "armor" && item.system.slot === "torso";

    return { editLocked, attackIsPhysical, isTorsoArmor };
  }

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Everything below here is only needed if the sheet is editable
    if (!this.isEditable) return;

    // Roll handlers, click handlers, etc. would go here.

    // Active Effect management
    html.find(".effect-control").click(ev => onManageActiveEffect(ev, this.item));
    html.find(".qty-field").change(this.#onQtyUpdate.bind(this));
  }

  // FIXTHIS: Does not fire if you close the sheet (e.g. click the X button) before clicking outside the input box
  async #onQtyUpdate(event) {
    event.preventDefault();

    const element = event.currentTarget;
    const item = this.item;

    if (!item) return;

    // If it is, update the quantity
    const qty = Math.max(element.value, 1);
    element.value = qty;

    await item.update({"system.qty": qty});

    if (item.parent instanceof Actor) await item.parent.sheet.render(false);
  }
}