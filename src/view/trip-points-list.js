import AbstractView from './abstract.js';

const createTripPointsListTemplate = () => {
  return `<ul class="trip-events__list">
  </ul>`;
};

// по аналогии с site-menu.js производим "перевод на классы"
export default class TripPointsListView extends AbstractView {
  getTemplate() {
    return createTripPointsListTemplate();
  }
}
