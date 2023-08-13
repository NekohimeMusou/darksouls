export function registerHooks() {
  Hooks.on("updateItem", _onQtyUpdate);
}

async function _onQtyUpdate(item, updates, options, itemId) {
  const newQty = updates?.system?.qty;

  if (newQty == null) return;

  if (item.type === "consumable" && newQty < 1) {
    await item.delete({parent: item.parent});
  }
}