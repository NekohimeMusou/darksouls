export default async function preloadHandlebarsTemplates() {
  const templatePaths = [
    'systems/darksouls/templates/actor/parts/header.html',
    'systems/darksouls/templates/actor/parts/tab-stats.html',
    'systems/darksouls/templates/actor/parts/stats/stats-pane.html',
    'systems/darksouls/templates/actor/parts/stats/estus-pane.html',
    'systems/darksouls/templates/actor/parts/stats/damage-pane.html',
    'systems/darksouls/templates/actor/parts/stats/armor-pane.html',
    'systems/darksouls/templates/actor/parts/stats/defense-pane.html',
    'systems/darksouls/templates/actor/parts/stats/weight-pane.html',
    'systems/darksouls/templates/actor/parts/tab-armor.html'
  ];

  return loadTemplates(templatePaths);
}