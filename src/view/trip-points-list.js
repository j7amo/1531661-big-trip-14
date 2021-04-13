import {createNewElement} from '../util.js';

const createTripPointsListTemplate = () => {
  return `<ul class="trip-events__list">
  </ul>`;
};

// по аналогии с site-menu.js производим "перевод на классы"
export default class TripPointsListView {
  constructor() {
    this._element = null;
  }

  getTemplate() {
    return createTripPointsListTemplate();
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
