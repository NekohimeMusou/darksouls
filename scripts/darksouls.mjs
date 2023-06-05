// Import document classes
import DarkSoulsActor from "./documents/actor.mjs";
import DarkSoulsItem from "./documents/item.mjs";
// Import sheet classes
import DarkSoulsActorSheet from "./sheets/actor-sheet.mjs";
import DarkSoulsItemSheet from "./sheets/item-sheet.mjs";
// Import helper/utility classes and constants
import { DARKSOULS } from "./helpers/config.mjs";
import preloadHandlebarsTemplates from "./helpers/templates.mjs";

Hooks.once('init', async function() {
    console.log("DARKSOULS | Initializing Dark Souls Game System");

    // Define custom Document classes
    CONFIG.Actor.documentClass = DarkSoulsActor;
    CONFIG.Item.documentClass = DarkSoulsItem;

    // Register sheet application classes
    Actors.unregisterSheet('core', ActorSheet);
    Actors.registerSheet('darksouls', DarkSoulsActorSheet, { makeDefault: true });
    Items.unregisterSheet('core', ItemSheet);
    Items.registerSheet('darksouls', DarkSoulsItemSheet, { makeDefault: true });

    preloadHandlebarsTemplates();
});