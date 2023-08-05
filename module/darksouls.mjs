// Import document classes
import DarkSoulsActor from "./documents/actor.mjs";
import DarkSoulsItem from "./documents/item.mjs";
import DarkSoulsActiveEffect from "./documents/active-effect.mjs";
// Import sheet classes
import DarkSoulsActorSheet from "./sheets/actor-sheet.mjs";
import DarkSoulsItemSheet from "./sheets/item-sheet.mjs";
// Import helper/utility classes and constants
import { DARKSOULS } from "./helpers/config.mjs";
import preloadHandlebarsTemplates from "./helpers/templates.mjs";

Hooks.once("init", async function() {
  console.log("DARKSOULS | Initializing Dark Souls Game System");

  // Add utility classes/functions to the global game object
  // So they're more easily accessible in global contexts
  game.darksouls = {
    DarkSoulsActor,
    DarkSoulsItem
  };

  game.settings.register("darksouls", "useConsumableByDefault", {
    name: "Consume Items By Default",
    hint: "Bypass the dialog and use up a consumable when clicked from the main tab. Hold Shift for the opposite behavior.",
    scope: "client",
    config: true,
    type: Boolean,
    default: false,
    requiresReload: false
  });

  // Disable legacy active effect transferral
  CONFIG.ActiveEffect.legacyTransferral = false;

  // Add custom config constants
  CONFIG.DARKSOULS = DARKSOULS;

  // Define custom Document classes
  CONFIG.Actor.documentClass = DarkSoulsActor;
  CONFIG.Item.documentClass = DarkSoulsItem;
  CONFIG.ActiveEffect.documentClass = DarkSoulsActiveEffect;

  // Register sheet application classes
  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("darksouls", DarkSoulsActorSheet, { makeDefault: true });
  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet("darksouls", DarkSoulsItemSheet, { makeDefault: true });

  preloadHandlebarsTemplates();
  registerHandlebarsHelpers();
});

function registerHandlebarsHelpers() {
  Handlebars.registerHelper("upperCase", (str) => str?.toLocaleUpperCase() || "");
}
