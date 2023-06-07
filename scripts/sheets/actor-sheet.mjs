export default class DarkSoulsActorSheet extends ActorSheet {
  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["darksouls", "sheet", "actor"],
      template: "systems/darksouls/templates/actor/actor-sheet.html",
      width: 600,
      height: 600,
      tabs: [{navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "stats" }]
    });
  }

  /** @override */
  getData() {
    const context = super.getData();

    const actorData = context.actor.data;

    // Add the actor's data to context.data for easier access, as well as flags
    context.data = actorData.data;
    context.flags = actorData.flags;

    context.isGM = game.user.isGM;

    // Prepare character data and items; use if statements here when we have more than one type (e.g. `if (actorData.type == 'character') {})

    // if (actorData.type == 'character') {
    //   this._prepareCharacterData(context);
    // } 
    // if (actorData.type == 'monster') {
    //   this._prepareMonsterData(context);
    // }

    // Add roll data for TinyMCE editors
    context.rollData = context.actor.getRollData();

    // Prepare active effects
    // context.effects = prepareActiveEffectCategories(this.actor.effects);

    return context;
  }

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Render the item sheet for viewing/editing prior to the editable check.
    html.find('.item-edit').click(ev => {
      const li = $(ev.currentTarget).parents(".item");
      const item = this.actor.items.get(li.data("itemId"));
      item.sheet.render(true);
    });

    if (!this.isEditable) return;

    // Add Inventory Item
    html.find('.item-create').click(this._onItemCreate.bind(this));

    // Delete Inventory Item
    html.find('.item-delete').click(ev => {
      const li = $(ev.currentTarget).parents(".item");
      const item = this.actor.items.get(li.data("itemId"));
      item.delete();
      li.slideUp(200, () => this.render(false));
    });

    // Equip Inventory Item
    // html.find('.item-toggle').click(this._onItemToggle.bind(this));

    // Drag events for macros.
    if (this.actor.owner) {
      let handler = ev => this._onDragStart(ev);
      html.find('li.item').each((i, li) => {
        if (li.classList.contains("inventory-header")) return;
        li.setAttribute("draggable", true);
        li.addEventListener("dragstart", handler, false);
      });
    }
  }

  /**
   * Handle creating a new Owned Item for the actor using initial data defined in the HTML dataset
   * @param {Event} event   The originating click event
   * @private
   */
  async _onItemCreate(event) {
    event.preventDefault();
    const header = event.currentTarget;
    // Get the type of item to create.
    const type = header.dataset.type;
    // Grab any data associated with this control.
    const data = duplicate(header.dataset);
    // Initialize a default name.
    const itemName = `New ${type.capitalize()}`;
    // Prepare the item object.
    const itemData = {
      name: itemName,
      type: type,
      data: data
    };
    // Remove the type from the dataset since it's in the itemData.type prop.
    delete itemData.data.type;

    // Finally, create the item!
    return await Item.create(itemData, {parent: this.actor});
  }

  async _onItemRoll(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const dataset = element.dataset;

    if (dataset.rollType && dataset.rollType == 'item') {
      const itemId = element.closest('.item').dataset.itemId;
      const item = this.actor.items.get(itemId);
      if (item) return await item.showItemCard(game.settings.get("core", "rollMode"));
    }
  }

  // Might have to change for Dark Souls
  async _onItemToggle(event) {
    event.preventDefault();
    const itemId = event.currentTarget.closest(".item").dataset.itemId;
    const item = this.actor.items.get(itemId);

    const itemData = item.data.data;

    if (item.type === 'weapon' && this.actor.equippedWeapon && !itemData.isEquipped) {
      ui.notifications.warn(`You already have a ${this.actor.equippedWeapon.name} equipped!`)
      return null;
    }

    return item.update({"data.isEquipped": !item.data.data.isEquipped});
  }
}