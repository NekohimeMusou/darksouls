export default async function preloadHandlebarsTemplates() {
  const templatePaths = [
    "systems/darksouls/templates/actor/parts/stats.html",
    "systems/darksouls/templates/actor/parts/header.html"
  ];

  return loadTemplates(templatePaths);
}