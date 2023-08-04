export default class DarkSoulsActiveEffect extends ActiveEffect {
  /** @override */
  get isSuppressed() {
    const parent = this.parent;

    if (parent instanceof Item && Object.hasOwn(parent.system, "equipped")) {
      return !parent.system.equipped;
    }
    return false;
  }
}