export default async function preloadHandlebarsTemplates() {
  const templatePaths = [
    "systems/darksouls/templates/actor/parts/stats.html"
  ];

  return loadTemplates(templatePaths);
}