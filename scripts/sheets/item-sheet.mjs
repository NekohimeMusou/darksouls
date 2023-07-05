export default class DarkSoulsItemSheet extends ItemSheet {
  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ['darksouls', 'sheet', 'item'],
      width: 520,
      height: 480,
      tabs: [{ navSelector: '.sheet-tabs', contentSelector: '.sheet-body', initial: 'attributes' }]
    });
  }

  /** @override */
  get template() {
    const path = 'systems/darksouls/templates/item';
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

    // Add armor slot options for select box
    context.armorSlots = CONFIG.DARKSOULS.armorSlots;

    return context;
  }

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Everything below here is only needed if the sheet is editable
    if (!this.isEditable) return;

    // Roll handlers, click handlers, etc. would go here.
  }
}