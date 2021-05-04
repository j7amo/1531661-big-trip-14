import AbstractView from './abstract.js';

const createTripPointsListTemplate = () => {
  return `<ul class="trip-events__list">
  </ul>`;
};

export default class TripPointsListView extends AbstractView {
  getTemplate() {
    return createTripPointsListTemplate();
  }
}
