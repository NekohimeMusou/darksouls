# Dark Souls TRPG (Unofficial)

*Unofficial* FVTT system for the Dark Souls TRPG, written by Hironori Katou and published by Group SNE. This system is based on the English translation by [matara](https://mataramakesgames.carrd.co/). This is a different game from the d20-based one by Steamworks!

CSS and some JS borrowed from <https://gitlab.com/asacolips-projects/foundry-mods/boilerplate>. Never would have figured this out without you!

This is *extremely* in a **prerelease** state. I originally threw it together in about 3 afternoons so I could have a little automation, and I've been gradually implementing features in my free time since then. You can improvise using the Description section of the sheet, but I currently recommend keeping track of your character's information somewhere else and just using this system for the automation.

## Features

- Boxes for tracking your resources such as HP, FP, and Estus! Wow!
- Put in your stats and it'll calculate your stat mods, level, and level mod for you. Technology!
  - You can click one to roll an action check
- Armor is fully implemented, except set bonuses
  - Equip load is inaccurate because weapons don't exist yet
- Automatic, target-based damage calculation! Computers!

### Damage Calculator

The main time-saving feature right now is the damage calculator. Weapons can calculate their damage automatically now, but you can use this for spells and the like until skills are in.

1. Calculate your attack's final damage value, *after* all stat and chain modifiers, magic bonuses, etc.
2. Type it in the "Damage Value" box
3. Check the box if the attack is magical, so it knows which defense to use
4. Target one or more tokens (by default you can hover your mouse over one and press the T key)
5. Click the damage button.

It'll compare your damage to the enemy's defense and calculate how much damage each one will take.

### Armor

Create a piece of armor, add it to your character sheet, and a fugly little row will appear on your main stats page allowing you to switch gear with a drop-down for convenience. It looks awful, but someday it won't.

## Known Issues

- Cleric armor set bonus is only a reminder
- Quantity field for consumable items doesn't update correctly if you close the sheet immediately after changing it. You have to click outside of the box or otherwise make it lose focus
- Ugly as hell
  - I am not very good at layouts or CSS. I took an entry-level course one time and I forget 2/3 of what I learned and 1/3 of that is out of date. please I need an adult

## To-do List

- Add skill functionality
- Better flask tracking
- Clean up UI

## Installation

Paste the following manifest URL into Foundry: <https://raw.githubusercontent.com/NekohimeMusou/darksouls/trunk/system.json>
