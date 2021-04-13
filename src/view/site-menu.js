import { createNewElement } from '../util.js';

const createSiteMenuTemplate = () => {
  return `<nav class="trip-controls__trip-tabs  trip-tabs">
    <a class="trip-tabs__btn  trip-tabs__btn--active" href="#">Table</a>
    <a class="trip-tabs__btn" href="#">Stats</a>
  </nav>`;
};

export default class SiteMenuView {
  // Академия предлагает в конструктор при создании элемента напрямую ничего не передавать
  // при этом мы объявляем свойство _element (типа protected) и сэтим его null, чтобы оно физически было и методы класса
  // могли с ним взаимодействовать
  constructor() {
    this._element = null;
  }
  // далее объявляем методы класса
  // 1) для получения разметки шаблона
  getTemplate() {
    return createSiteMenuTemplate();
  }
  // 2) для получения DOM-элемента
  getElement() {
    if (!this._element) {
      this._element = createNewElement(this.getTemplate());
    }

    return this._element;
  }

  // 3) для удаления DOM-элемента
  removeElement() {
    this._element = null;
  }
}
