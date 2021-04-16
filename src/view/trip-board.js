import AbstractView from './abstract.js';

const createTripBoardTemplate = () => {
  return `<section class="trip-events">
    <h2 class="visually-hidden">Trip events</h2>
  </section>`;
};

// по аналогии с site-menu.js производим "перевод на классы"
export default class TripBoardView extends AbstractView {
  getTemplate() {
    return createTripBoardTemplate();
  }
}
