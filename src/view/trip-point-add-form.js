import { nanoid } from 'nanoid';
import he from 'he';
import '../../node_modules/flatpickr/dist/flatpickr.min.css';
import AbstractForm from './abstract-form.js';

const createTripPointCreationFormTemplate = (tripPoint, getEventTypesPickerMarkup, getDestinationOptionsMarkup, initAvailableOffersMarkup, getDestinationDescriptionMarkup) => {
  const {
    price: currentPrice,
    beginDate: currentBeginDate,
    endDate: currentEndDate,
    destination: currentDestination,
    id: currentId,
    type: currentType,
    isDisabled,
    isSaving,
  } = tripPoint;

  return `<li class="trip-events__item">
    <form class="event event--edit" action="#" method="post">
      <span class="event__edit-id visually-hidden">${currentId}</span>
      <header class="event__header">
        <div class="event__type-wrapper">
          <label class="event__type  event__type-btn" for="event-type-edit-toggle-1">
            <span class="visually-hidden">Choose event type</span>
            <img class="event__type-icon" width="17" height="17" src="img/icons/${currentType}.png" alt="Event type icon">
          </label>
          <input class="event__type-toggle  visually-hidden" id="event-type-edit-toggle-1" type="checkbox" ${ isDisabled ? 'disabled' : ''}>

          <div class="event__type-list">
            <fieldset class="event__type-group">
              <legend class="visually-hidden">Event type</legend>
              ${getEventTypesPickerMarkup()}
            </fieldset>
          </div>
        </div>

        <div class="event__field-group  event__field-group--destination">
          <label class="event__label  event__type-output" for="event-destination-1">
            ${currentType}
          </label>
          <input class="event__input  event__input--destination" id="event-destination-1" type="text" name="event-destination" value="${currentDestination ? he.encode(currentDestination.name) : ''}" list="destination-list-1" ${ isDisabled ? 'disabled' : ''} required>
          <datalist id="destination-list-1">
            ${getDestinationOptionsMarkup()}
          </datalist>
        </div>

        <div class="event__field-group  event__field-group--time">
          <label class="visually-hidden" for="event-start-time-1">From</label>
          <input class="event__input  event__input--time" id="event-start-time-1" type="text" name="event-start-time" value="${currentBeginDate ? currentBeginDate : ''}" ${ isDisabled ? 'disabled' : ''} required>
          &mdash;
          <label class="visually-hidden" for="event-end-time-1">To</label>
          <input class="event__input  event__input--time" id="event-end-time-1" type="text" name="event-end-time" value="${currentEndDate ? currentEndDate : ''}" ${ isDisabled ? 'disabled' : ''} required>
        </div>

        <div class="event__field-group  event__field-group--price">
          <label class="event__label" for="event-price-1">
            <span class="visually-hidden">Price</span>
            &euro;
          </label>
          <input class="event__input  event__input--price" id="event-price-1" type="number" name="event-price" value="${currentPrice ? currentPrice : ''}" ${ isDisabled ? 'disabled' : ''} required>
        </div>

        <button class="event__save-btn  btn  btn--blue" type="submit" ${ isDisabled ? 'disabled' : ''}>
          ${ isSaving ? 'Saving...' : 'Save' }
        </button>
        <button class="event__reset-btn" type="reset" ${ isDisabled ? 'disabled' : ''}>
          Cancel
        </button>
        <span class="visually-hidden">Open event</span>
        </button>
      </header>
      <section class="event__details">
        <section class="event__section  event__section--offers">
          <h3 class="event__section-title  event__section-title--offers">Offers</h3>

          <div class="event__available-offers">
            ${initAvailableOffersMarkup()}
          </div>
        </section>
        ${currentDestination ? getDestinationDescriptionMarkup(currentDestination.name) : ''}
      </section>
    </form>
  </li>`;
};

export default class TripPointAddFormView extends AbstractForm {
  constructor(eventTypeToOffersPairs, destinations) {
    super();
    this._eventTypeToOffersPairs = eventTypeToOffersPairs;
    this._destinations = destinations;
    this._initialStateData = {
      price: undefined,
      beginDate: undefined,
      endDate: undefined,
      destination: undefined,
      id: nanoid(),
      isFavorite: false,
      offers: [],
      type: Array.from(this._eventTypeToOffersPairs.keys())[0],
    };
    this._stateData = Object.assign({}, this._initialStateData);

    this._formCancelHandler = this._formCancelHandler.bind(this);
    this._formSubmitHandler = this._formSubmitHandler.bind(this);
    this._getEventTypesPickerMarkup = this._getEventTypesPickerMarkup.bind(this);
    this._getDestinationOptionsMarkup = this._getDestinationOptionsMarkup.bind(this);
    this._getDestinationDescriptionMarkup = this._getDestinationDescriptionMarkup.bind(this);
    this._initAvailableOffersMarkup = this._initAvailableOffersMarkup.bind(this);
    this._priceInputHandler = this._priceInputHandler.bind(this);
    this._handleBeginDateChange = this._handleBeginDateChange.bind(this);
    this._handleEndDateChange = this._handleEndDateChange.bind(this);
    this._eventTypeChangeHandler = this._eventTypeChangeHandler.bind(this);
    this._eventOffersToggleHandler = this._eventOffersToggleHandler.bind(this);
    this._destinationChangeHandler = this._destinationChangeHandler.bind(this);
    this._initDatePicker = this._initDatePicker.bind(this);
    this._beginDateClickHandler = this._beginDateClickHandler.bind(this);
    this._endDateClickHandler = this._endDateClickHandler.bind(this);
    this._destroyBeginDatePicker = this._destroyBeginDatePicker.bind(this);
    this._destroyEndDatePicker = this._destroyEndDatePicker.bind(this);

    this._setInnerHandlers();
  }

  getTemplate() {
    return createTripPointCreationFormTemplate(this._stateData, this._getEventTypesPickerMarkup, this._getDestinationOptionsMarkup, this._initAvailableOffersMarkup, this._getDestinationDescriptionMarkup);
  }

  setFormCancelHandler(callback) {
    this._callback.cancelAdd = callback;
    this.getElement().querySelector('.event__reset-btn').addEventListener('click', this._formCancelHandler);
  }

  reset() {
    this.updateState(
      this._initialStateData,
      false,
    );
    this._destroyBeginDatePicker();
    this._destroyEndDatePicker();
  }

  restoreHandlers() {
    this._setInnerHandlers();
    this.setFormSubmitHandler(this._callback.formSubmit);
    this.setFormCancelHandler(this._callback.cancelAdd);
  }

  _formCancelHandler(evt) {
    evt.preventDefault();
    this._callback.cancelAdd();
  }

  _initAvailableOffersMarkup() {
    let availableOffersOptionsMarkup = '';
    const availableOffers = this._eventTypeToOffersPairs.get(this._stateData.type).offers;
    for (let i = 0; i < availableOffers.length; i++) {
      const randomId = nanoid();
      const offerTemplate = `<div class="event__offer-selector">
      <input class="event__offer-checkbox  visually-hidden" id="event-offer-${randomId}-1" type="checkbox" name="event-offer-${this._stateData.type}">
      <label class="event__offer-label" for="event-offer-${randomId}-1">
        <span class="event__offer-title">${availableOffers[i].title}</span>
        &plus;&euro;&nbsp;
        <span class="event__offer-price">${availableOffers[i].price}</span>
      </label>
    </div>`;

      availableOffersOptionsMarkup += offerTemplate;
    }
    return availableOffersOptionsMarkup;
  }
}
