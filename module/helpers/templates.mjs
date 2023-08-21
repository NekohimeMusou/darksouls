export default async function preloadHandlebarsTemplates() {
  const templatePaths = [
    "systems/darksouls/templates/actor/parts/header.html",
    "systems/darksouls/templates/actor/parts/tab-stats.html",
    "systems/darksouls/templates/actor/parts/stats/stats-pane.html",
    "systems/darksouls/templates/actor/parts/stats/estus-pane.html",
    "systems/darksouls/templates/actor/parts/stats/damage-pane.html",
    "systems/darksouls/templates/actor/parts/stats/weapons-pane.html",
    "systems/darksouls/templates/actor/parts/stats/armor-pane.html",
    "systems/darksouls/templates/actor/parts/stats/defense-pane.html",
    "systems/darksouls/templates/actor/parts/stats/consumables-pane.html",
    "systems/darksouls/templates/actor/parts/stats/rings-pane.html",
    "systems/darksouls/templates/actor/parts/stats/resist-pane.html",
    "systems/darksouls/templates/actor/parts/tab-armor.html",
    "systems/darksouls/templates/actor/parts/tab-rings.html",
    "systems/darksouls/templates/actor/parts/tab-consumables.html",
    "systems/darksouls/templates/actor/parts/tab-weapons.html",
    "systems/darksouls/templates/item/parts/tab-description.html",
    "systems/darksouls/templates/item/parts/tab-weapon-shared.html",
    "systems/darksouls/templates/item/parts/tab-weapon-attack.html",
    "systems/darksouls/templates/item/parts/tab-weapon-guard.html",
    "systems/darksouls/templates/item/parts/prereqs-pane.html",
    "systems/darksouls/templates/shared/tab-effects.html"
  ];

  return loadTemplates(templatePaths);
}