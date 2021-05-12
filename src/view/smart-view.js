import Abstract from './abstract';

export default class AbstractSmartView extends Abstract {
  constructor() {
    super();
    this._stateData = {};
  }

  updateElementMarkup() {
    const oldElement = this.getElement();
    const oldElementParent = oldElement.parentElement;
    this.removeElement();
    const newElement = this.getElement();
    oldElementParent.replaceChild(newElement, oldElement);
    this.restoreHandlers();
  }

  updateState(update, localStateUpdate) {
    if (!update) {
      return;
    }

    this._stateData = Object.assign(
      {},
      this._stateData,
      update,
    );

    if (localStateUpdate) {
      return;
    }

    this.updateElementMarkup();
  }

  restoreHandlers() {
    throw new Error('Abstract method not implemented: restoreHandlers');
  }
}
