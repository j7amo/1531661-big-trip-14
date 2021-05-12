import dayjs from 'dayjs';
import AbstractView from './abstract.js';
import { getDurationInMinutes, getDurationFormatted } from '../utils/trip-point.js';

const createTripPointTemplate = (tripPointData) => {
  const {
    price,
    beginDate,
    endDate,
    destination,
    id,
    isFavorite,
    offers,
    type,
  } = tripPointData;

  const beginDateYearMonthDayFormatted = beginDate ? dayjs(beginDate).format('YYYY-MM-DD') : '';
  const beginDateMonthDayFormatted = beginDate ? dayjs(beginDate).format('MMM DD') : '';
  const beginFullDateWithTimeFormatted = beginDate ? dayjs(beginDate).format('YYYY-MM-DDTHH:mm') : '';
  const beginDateTimeFormatted = beginDate ? dayjs(beginDate).format('HH-mm') : '';
  const endFullDateWithTimeFormatted = endDate ? dayjs(endDate).format('YYYY-MM-DDTHH:mm') : '';
  const endDateTimeFormatted = endDate ? dayjs(endDate).format('HH-mm') : '';
  const eventDuration = getDurationInMinutes(tripPointData);

  let listOfOffers = '';
  offers.forEach(({title, price}) => {
    const offerTemplate = `<li class="event__offer">
      <span class="event__offer-title">${title}</span>
      &plus;&euro;&nbsp;
      <span class="event__offer-price">${price}</span>
    </li>`;
    listOfOffers += offerTemplate;
  });

  const isFavoriteClass = isFavorite ? 'event__favorite-btn--active' : '';

  return `<li class="trip-events__item">
    <div class="event">
      <span class="event__id visually-hidden">${id}</span>
      <time class="event__date" datetime="${beginDateYearMonthDayFormatted}">${beginDateMonthDayFormatted}</time>
      <div class="event__type">
        <img class="event__type-icon" width="42" height="42" src="img/icons/${type}.png" alt="Event type icon">
      </div>
      <h3 class="event__title">${type} ${destination ? destination.name : ''}</h3>
      <div class="event__schedule">
        <p class="event__time">
          <time class="event__start-time" datetime="${beginFullDateWithTimeFormatted}">${beginDateTimeFormatted}</time>
          &mdash;
          <time class="event__end-time" datetime="${endFullDateWithTimeFormatted}">${endDateTimeFormatted}</time>
        </p>
        <p class="event__duration">${getDurationFormatted(eventDuration) ? getDurationFormatted(eventDuration) : ''}</p>
      </div>
      <p class="event__price">
        &euro;&nbsp;<span class="event__price-value">${price ? price : ''}</span>
      </p>
      <h4 class="visually-hidden">Offers:</h4>
      <ul class="event__selected-offers">${listOfOffers}</ul>
      <button class="event__favorite-btn ${isFavoriteClass}" type="button">
        <span class="visually-hidden">Add to favorite</span>
        <svg class="event__favorite-icon" width="28" height="28" viewBox="0 0 28 28">
          <path d="M14 21l-8.22899 4.3262 1.57159-9.1631L.685209 9.67376 9.8855 8.33688 14 0l4.1145 8.33688 9.2003 1.33688-6.6574 6.48934 1.5716 9.1631L14 21z"/>
        </svg>
      </button>
      <button class="event__rollup-btn" type="button">
        <span class="visually-hidden">Open event</span>
      </button>
    </div>
  </li>`;
};

export default class TripPointView extends AbstractView {
  constructor(tripPoint) {
    super();
    this._tripPoint = tripPoint;

    this._handleClick = this._handleClick.bind(this);
    this._handleFavoriteClick = this._handleFavoriteClick.bind(this);
  }

  getTemplate() {
    return createTripPointTemplate(this._tripPoint);
  }

  setEditClickHandler(callback) {
    this._callback.click = callback;
    this.getElement().querySelector('.event__rollup-btn').addEventListener('click', this._handleClick);
  }

  setFavoriteClickHandler(callback) {
    this._callback.favoriteClick = callback;
    this.getElement().querySelector('.event__favorite-btn').addEventListener('click', this._handleFavoriteClick);
  }

  _handleClick(evt) {
    evt.preventDefault();
    this._callback.click();
  }

  _handleFavoriteClick(evt) {
    evt.preventDefault();
    this._callback.favoriteClick();
  }
}
