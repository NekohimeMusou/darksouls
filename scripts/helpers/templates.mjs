export default async function preloadHandlebarsTemplates() {
  const templatePaths = [
    "systems/darksouls/templates/actor/parts/header.html",
    "systems/darksouls/templates/actor/parts/tab-stats.html"
  ];

  return loadTemplates(templatePaths);
}