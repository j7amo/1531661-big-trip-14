import dayjs from 'dayjs';
import {getRandomInt} from '../util.js';

export const createTripPointEditionFormTemplate = (allTripPointsData, currentTripPointData) => {
  let destinationOptionsMarkup = '';
  let eventTypeItemsMarkup = '';

  allTripPointsData.forEach(({destination, type}) => {
    const destinationsTemplate = `<option value="${destination.name}"></option>`;
    destinationOptionsMarkup += destinationsTemplate;
    const eventTypesTemplate = `<div class="event__type-item">
    <input id="event-type-${type}-1" class="event__type-input  visually-hidden" type="radio" name="event-type" value="${type}">
    <label class="event__type-label  event__type-label--${type}" for="event-type-${type}-1">${type}</label>
  </div>`;
    eventTypeItemsMarkup += eventTypesTemplate;
  });

  const {
    price: currentPrice,
    beginDate: currentBeginDate,
    endDate: currentEndDate,
    destination: currentDestination,
    //isFavorite: currentIsFavorite,
    offers: currentOffers,
    type: currentType,
  } = currentTripPointData;

  const beginDateWithTimeFormatted = dayjs(currentBeginDate).format('DD/MM/YY HH:mm');
  const endDateWithTimeFormatted = dayjs(currentEndDate).format('DD/MM/YY HH:mm');

  let offersOptionsMarkup = '';
  for (let i = 0; i < currentOffers.length; i++) {
    const randomId = getRandomInt(0, Number.MAX_VALUE);
    const offerTemplate = `<div class="event__offer-selector">
      <input class="event__offer-checkbox  visually-hidden" id="event-offer-${randomId}-1" type="checkbox" name="event-offer-${currentType}">
      <label class="event__offer-label" for="event-offer-${randomId}-1">
        <span class="event__offer-title">${currentOffers[i].title}</span>
        &plus;&euro;&nbsp;
        <span class="event__offer-price">${currentOffers[i].price}</span>
      </label>
    </div>`;

    offersOptionsMarkup += offerTemplate;
  }

  return `<li class="trip-events__item">
    <form class="event event--edit" action="#" method="post">
      <header class="event__header">
        <div class="event__type-wrapper">
          <label class="event__type  event__type-btn" for="event-type-toggle-1">
            <span class="visually-hidden">Choose event type</span>
            <img class="event__type-icon" width="17" height="17" src="img/icons/${currentType}.png" alt="Event type icon">
          </label>
          <input class="event__type-toggle  visually-hidden" id="event-type-toggle-1" type="checkbox">

          <div class="event__type-list">
            <fieldset class="event__type-group">
              <legend class="visually-hidden">Event type</legend>
              ${eventTypeItemsMarkup}
            </fieldset>
          </div>
        </div>

        <div class="event__field-group  event__field-group--destination">
          <label class="event__label  event__type-output" for="event-destination-1">
            ${currentType}
          </label>
          <input class="event__input  event__input--destination" id="event-destination-1" type="text" name="event-destination" value="${currentDestination.name}" list="destination-list-1">
          <datalist id="destination-list-1">
            ${destinationOptionsMarkup}
          </datalist>
        </div>

        <div class="event__field-group  event__field-group--time">
          <label class="visually-hidden" for="event-start-time-1">From</label>
          <input class="event__input  event__input--time" id="event-start-time-1" type="text" name="event-start-time" value="${beginDateWithTimeFormatted}">
          &mdash;
          <label class="visually-hidden" for="event-end-time-1">To</label>
          <input class="event__input  event__input--time" id="event-end-time-1" type="text" name="event-end-time" value="${endDateWithTimeFormatted}">
        </div>

        <div class="event__field-group  event__field-group--price">
          <label class="event__label" for="event-price-1">
            <span class="visually-hidden">Price</span>
            &euro;
          </label>
          <input class="event__input  event__input--price" id="event-price-1" type="text" name="event-price" value="${currentPrice}">
        </div>

        <button class="event__save-btn  btn  btn--blue" type="submit">Save</button>
        <button class="event__reset-btn" type="reset">Delete</button>
        <button class="event__rollup-btn" type="button">
          <span class="visually-hidden">Open event</span>
        </button>
      </header>
      <section class="event__details">
        <section class="event__section  event__section--offers">
          <h3 class="event__section-title  event__section-title--offers">Offers</h3>

          <div class="event__available-offers">
            ${offersOptionsMarkup}
          </div>
        </section>

        <section class="event__section  event__section--destination">
          <h3 class="event__section-title  event__section-title--destination">Destination</h3>
          <p class="event__destination-description">${currentDestination.description}</p>
        </section>
      </section>
    </form>
  </li>`;
};
