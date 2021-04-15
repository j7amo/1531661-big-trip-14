import { createNewElement } from '../util.js';

const createNoTripPointsTemplate = () => {
  return `<li class="trip-events__item">
    <p class="trip-events__msg">
    Click New Event to create your first point
    </p>
  </li>`;
};

// по аналогии с site-menu.js производим "перевод на классы"
export default class NoTripPointsView {
  constructor() {
    this._element = null;
  }

  getTemplate() {
    return createNoTripPointsTemplate();
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
