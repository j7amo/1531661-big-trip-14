import AbstractView from './abstract.js';

const createNoTripPointsTemplate = () => {
  return `<li class="trip-events__item">
    <p class="trip-events__msg">
    Click New Event to create your first point
    </p>
  </li>`;
};

export default class NoTripPointsView extends AbstractView {
  getTemplate() {
    return createNoTripPointsTemplate();
  }
}
