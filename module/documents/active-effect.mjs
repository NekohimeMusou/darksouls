export default class DarkSoulsActiveEffect extends ActiveEffect {
  /** @override */
  get isSuppressed() {
    const parent = this.parent;

    if (parent instanceof Item) return Boolean(parent?.isEffectSuppressed);

    return false;
  }
}