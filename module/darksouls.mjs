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

  // CONFIG.debug.hooks = true;

  // Add utility classes/functions to the global game object
  // So they're more easily accessible in global contexts
  game.darksouls = {
    DarkSoulsActor,
    DarkSoulsItem
  };

  // Add custom config constants
  CONFIG.DARKSOULS = DARKSOULS;

  handleLegacyBehavior();

  registerSettings();
  registerDocumentClasses();
  registerSheetApplications();
  registerHandlebarsHelpers();
  preloadHandlebarsTemplates();
});

function registerHandlebarsHelpers() {
  Handlebars.registerHelper("upperCase", (str) => str?.toLocaleUpperCase() || "");
}

function handleLegacyBehavior() {
  const foundryMajorVersion = Math.floor(Number(game.version));

  if (foundryMajorVersion <= 11) {
    // Disable legacy active effect transferral
    CONFIG.ActiveEffect.legacyTransferral = false;
  }
}

function registerSettings() {
  game.settings.register("darksouls", "consumeItemByDefault", {
    name: game.i18n.localize("DARKSOULS.ConsumeItemByDefaultName"),
    hint: game.i18n.localize("DARKSOULS.ConsumeItemByDefaultHint"),
    scope: "client",
    config: true,
    type: Boolean,
    default: false,
    requiresReload: false
  });
}

function registerDocumentClasses() {
  CONFIG.Actor.documentClass = DarkSoulsActor;
  CONFIG.Item.documentClass = DarkSoulsItem;
  CONFIG.ActiveEffect.documentClass = DarkSoulsActiveEffect;
}

function registerSheetApplications() {
  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("darksouls", DarkSoulsActorSheet, { makeDefault: true });
  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet("darksouls", DarkSoulsItemSheet, { makeDefault: true });
}