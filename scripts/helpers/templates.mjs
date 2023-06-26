export default async function preloadHandlebarsTemplates() {
  const templatePaths = [
    'systems/darksouls/templates/actor/parts/header.html',
    'systems/darksouls/templates/actor/parts/tab-stats.html',
    'systems/darksouls/templates/actor/parts/stats/stats-pane.html',
    'systems/darksouls/templates/actor/parts/stats/estus-pane.html',
    'systems/darksouls/templates/actor/parts/stats/weapons-pane.html',
    'systems/darksouls/templates/actor/parts/stats/armor-pane.html',
    'systems/darksouls/templates/actor/parts/tab-armor.html'
  ];

  return loadTemplates(templatePaths);
}