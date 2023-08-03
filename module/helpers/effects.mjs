/**
 * Manage Active Effect instances through the Actor Sheet via effect control buttons.
 * @param {MouseEvent} event      The left-click event on the effect control
 * @param {Actor|Item} owner      The owning document which manages this effect
 */
export async function onManageActiveEffect(event, owner) {
  event.preventDefault();
  const a = event.currentTarget;
  const li = a.closest("li");
  const effect = li.dataset.effectId ? owner.effects.get(li.dataset.effectId) : null;
  const actor = owner.actor;
  switch ( a.dataset.action ) {
  case "create":
    return await owner.createEmbeddedDocuments("ActiveEffect", [{
      name: "New Effect",
      icon: "icons/svg/aura.svg",
      origin: owner.uuid,
      "duration.rounds": li.dataset.effectType === "temporary" ? 1 : undefined,
      disabled: li.dataset.effectType === "inactive"
    }]);
  case "edit":
    return await effect.sheet.render(true);
  case "delete":
    await owner.deleteEmbeddedDocuments("ActiveEffect", [effect._id]);
    if (actor) await actor.sheet.render(false);
    return;
  case "toggle":
    await owner.updateEmbeddedDocuments("ActiveEffect", [{_id: effect._id, disabled: !effect.disabled}]);
    if (actor) await actor.sheet.render(false);
    return;
  }
}
  
/**
   * Prepare the data structure for Active Effects which are currently applied to an Actor or Item.
   * @param {ActiveEffect[]} effects    The array of Active Effect instances to prepare sheet data for
   * @return {object}                   Data for rendering
   */
export function prepareActiveEffectCategories(effects) {
  
  // Define effect header categories
  const categories = {
    temporary: {
      type: "temporary",
      label: "Temporary Effects",
      effects: []
    },
    passive: {
      type: "passive",
      label: "Passive Effects",
      effects: []
    },
    inactive: {
      type: "inactive",
      label: "Inactive Effects",
      effects: []
    }
  };
  
  // Iterate over active effects, classifying them into categories
  for ( let e of effects ) {
    if ( e.disabled ) categories.inactive.effects.push(e);
    else if ( e.isTemporary ) categories.temporary.effects.push(e);
    else categories.passive.effects.push(e);
  }
  return categories;
}