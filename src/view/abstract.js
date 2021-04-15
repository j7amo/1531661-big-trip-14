import { createNewElement } from '../utils/render.js';

export default class Abstract {
  constructor() {
    if (new.target === Abstract) {
      throw new Error('Can\'t instantiate abstract class');
    }
    this._element = null;
    // добавляем новое свойство, в котором будем хранить переданные коллбэки
    // (видимо, для последующего удаления обработчиков)
    this._callback = {};
  }

  getTemplate() {
    throw new Error('Abstract method not implemented: getTemplate');
  }

  getElement() {
    if (!this._element) {
      this._element = createNewElement(this.getTemplate());
    }

    return this._element;
  }

  removeElement() {
    this._element = null;
  }
}
