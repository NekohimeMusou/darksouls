export { log as default };

function log(...args) {
  const moduleID = CONFIG.DARKSOULS.moduleID;

  const debugMode = game.modules.get('_dev-mode')?.api?.getPackageDebugValue(moduleID);

  if (debugMode) {
    console.log(moduleID, '|', ...args);
  }
}