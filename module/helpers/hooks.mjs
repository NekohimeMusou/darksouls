export function registerHooks() {
  Hooks.on("updateItem", _onQtyUpdate);
  Hooks.on("createItem", _onConsumableAdd);
}

async function _onQtyUpdate(item, updates, options, itemId) {
  const newQty = updates?.system?.qty;

  if (newQty == null) return;

  if (item.type === "consumable" && newQty < 1) {
    await item.delete({parent: item.parent});
  }
}

// FIXTHIS: This seems like it should use preCreateItem and return false,
// but that created a phantom item listing on the actor sheet that doesn't
// go away until the page is refreshed
async function _onConsumableAdd(newItem, options, userId) {
  if (newItem.type !== "consumable" || !newItem.actor) return;

  const oldItem = newItem.actor.items.find(i => i.name === newItem.name);

  if (oldItem instanceof Item && !Object.is(oldItem, newItem)) {
    const newQty = newItem.system?.qty || 0;
    const oldQty = oldItem.system?.qty || 0;

    await oldItem.update({_id: oldItem.id, "system.qty": newQty + oldQty});
    await newItem.delete({parent: newItem.parent});
  }
}