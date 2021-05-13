import AbstractSmartView from './smart-view.js';
import { nanoid } from 'nanoid';
import flatpickr from 'flatpickr';
import '../../node_modules/flatpickr/dist/flatpickr.min.css';
import dayjs from 'dayjs';
import {toast} from '../utils/toast.js';

const DateType = {
  BEGIN_DATE: 'BEGIN_DATE',
  END_DATE: 'END_DATE',
};

export default class AbstractForm extends AbstractSmartView {

  setFormSubmitHandler(callback) {
    this._callback.formSubmit = callback;
    this.getElement().querySelector('.event--edit').addEventListener('submit', this._formSubmitHandler);
  }


  reset(tripPoint) {
    this.updateState(
      AbstractForm.parseTripPointToStateData(tripPoint),
      false,
    );
    this._destroyBeginDatePicker();
    this._destroyEndDatePicker();
  }

  _initDatePicker(dateType, elementForPickerAdd, defaultDate, onChangeCallback) {
    let datePicker;

    switch (dateType) {
      case DateType.BEGIN_DATE:
        datePicker = '_beginDatePicker';
        break;
      case DateType.END_DATE:
        datePicker = '_endDatePicker';
        break;
    }

    if (this[datePicker]) {
      this[datePicker].destroy();
      this[datePicker] = null;
    }

    this[datePicker] = flatpickr(
      elementForPickerAdd,
      {
        mode: 'single',
        enableTime: true,
        dateFormat: 'd/m/y H:i',
        time_24hr: true,
        defaultDate: defaultDate,
        onChange: onChangeCallback,
      },
    );
  }

  _handleBeginDateChange([userDate]) {
    this.updateState({
      beginDate: userDate,
    }, true);
  }

  _handleEndDateChange([userDate]) {
    this.updateState({
      endDate: userDate,
    }, true);
  }

  _beginDateClickHandler(evt) {
    evt.preventDefault();
    evt.target.removeEventListener('click', this._beginDateClickHandler);
    this._initDatePicker(DateType.BEGIN_DATE, evt.target, this._stateData.beginDate, this._handleBeginDateChange);
    this._beginDatePicker.open();
  }

  _endDateClickHandler(evt) {
    evt.preventDefault();
    evt.target.removeEventListener('click', this._endDateClickHandler);
    this._initDatePicker(DateType.END_DATE, evt.target, this._stateData.endDate, this._handleEndDateChange);
    this._endDatePicker.open();
  }

  _destroyBeginDatePicker() {
    if (this._beginDatePicker) {
      this._beginDatePicker.destroy();
      this._beginDatePicker = null;
    }
  }

  _destroyEndDatePicker() {
    if (this._endDatePicker) {
      this._endDatePicker.destroy();
      this._endDatePicker = null;
    }
  }

  _formSubmitHandler(evt) {
    evt.preventDefault();
    if (dayjs(this._stateData.beginDate).diff(dayjs(this._stateData.endDate)) > 0) {
      toast('End date must be after begin date');
      return;
    }

    this._callback.formSubmit(AbstractForm.parseStateDataToTripPoint(this._stateData));
    this._destroyBeginDatePicker();
    this._destroyEndDatePicker();
  }

  _priceInputHandler(evt) {
    evt.preventDefault();
    this.updateState({
      price: evt.target.value,
    }, true);
  }

  _eventTypeChangeHandler(evt) {
    evt.preventDefault();
    const update = {
      offers: [],
      type: evt.target.value,
    };
    this.updateState(update, false);
  }

  _eventOffersToggleHandler(evt) {
    evt.preventDefault();
    const offerCheckbox = evt.target;
    const container = offerCheckbox.parentElement;
    const offerTitleElement = container.querySelector('.event__offer-title').textContent;
    const offerPriceElement = Number(container.querySelector('.event__offer-price').textContent);

    if (offerCheckbox.checked === false) {
      const indexToRemove = this._stateData.offers.findIndex(({
        title,
        price,
      }) => (title === offerTitleElement && price === offerPriceElement));
      this._stateData.offers.splice(indexToRemove, 1);
      this.updateState({
        offers: this._stateData.offers,
      }, true);
    } else {
      const offerToAdd = {
        title: offerTitleElement,
        price: offerPriceElement,
      };
      this._stateData.offers.push(offerToAdd);
      this.updateState({
        offers: this._stateData.offers,
      }, true);
    }
  }

  _destinationChangeHandler(evt) {
    evt.preventDefault();
    this.updateState({
      destination: this._destinations.get(evt.target.value),
    }, false);
  }

  _setInnerHandlers() {
    this.getElement().querySelector('.event__input--price').addEventListener('change', this._priceInputHandler);
    this.getElement().querySelector('.event__type-group').addEventListener('change', this._eventTypeChangeHandler);
    this.getElement().querySelector('.event__field-group--destination').addEventListener('change', this._destinationChangeHandler);
    const availableOffers = this.getElement().querySelectorAll('.event__offer-checkbox');
    availableOffers.forEach((offer) => offer.addEventListener('change', this._eventOffersToggleHandler));
    this.getElement().querySelector('input[id = "event-start-time-1"]').addEventListener('click', this._beginDateClickHandler);
    this.getElement().querySelector('input[id = "event-end-time-1"]').addEventListener('click', this._endDateClickHandler);
  }

  _getEventTypesPickerMarkup() {
    let eventTypeItemsMarkup = '';

    Array.from(this._eventTypeToOffersPairs.keys()).forEach((type) => {
      let eventTypesTemplate;
      if (type === this._stateData.type) {
        eventTypesTemplate = `<div class="event__type-item">
      <input id="event-type-${type}-1" class="event__type-input  visually-hidden" type="radio" name="event-type" value="${type}" checked>
      <label class="event__type-label  event__type-label--${type}" for="event-type-${type}-1">${type}</label>
      </div>`;
      } else {
        eventTypesTemplate = `<div class="event__type-item">
      <input id="event-type-${type}-1" class="event__type-input  visually-hidden" type="radio" name="event-type" value="${type}">
      <label class="event__type-label  event__type-label--${type}" for="event-type-${type}-1">${type}</label>
      </div>`;
      }
      eventTypeItemsMarkup += eventTypesTemplate;
    });

    return eventTypeItemsMarkup;
  }

  _getDestinationOptionsMarkup() {
    let destinationOptionsMarkup = '';

    Array.from(this._destinations.keys()).forEach((destination) => {
      const destinationsTemplate = `<option value="${destination}"></option>`;
      destinationOptionsMarkup += destinationsTemplate;
    });

    return destinationOptionsMarkup;
  }

  _initAvailableOffersMarkup(isDisabled) {
    let availableOffersOptionsMarkup = '';
    const selectedOffers = this._stateData.offers;
    const availableOffers = this._eventTypeToOffersPairs.get(this._stateData.type).offers;

    for (let i = 0; i < availableOffers.length; i++) {
      const randomId = nanoid();
      const isAvailableOfferSelected = selectedOffers.some((selectedOffer) => (availableOffers[i].title === selectedOffer.title && availableOffers[i].price === selectedOffer.price));
      const checkboxChecked = isAvailableOfferSelected ? 'checked' : '';
      const offerTemplate = `<div class="event__offer-selector">
      <input class="event__offer-checkbox  visually-hidden" id="event-offer-${randomId}-1" type="checkbox" name="event-offer-${this._stateData.type}" ${checkboxChecked} ${ isDisabled ? 'disabled' : ''}>
      <label class="event__offer-label" for="event-offer-${randomId}-1">
        <span class="event__offer-title">${availableOffers[i].title}</span>
        &plus;&euro;&nbsp;
        <span class="event__offer-price">${availableOffers[i].price}</span>
      </label>
      </div>`;

      availableOffersOptionsMarkup += offerTemplate;
    }

    if (availableOffersOptionsMarkup.length === 0) {
      return '';
    }

    return `<section class="event__section  event__section--offers">
      <h3 class="event__section-title  event__section-title--offers">Offers</h3>
      <div class="event__available-offers">
        ${availableOffersOptionsMarkup}
      </div>
    </section>`;
  }

  _getDestinationDescriptionMarkup(destinationName) {
    const newDestination = this._destinations.get(destinationName);
    let eventPhotosMarkup = '';
    for (let i = 0; i < newDestination.pictures.length; i++) {
      const src = newDestination.pictures[i].src;
      const alt = newDestination.pictures[i].description;
      eventPhotosMarkup += `<img class="event__photo" src="${src}" alt="${alt}">`;
    }

    if (eventPhotosMarkup.length === 0) {
      return '';
    }

    return `<section class="event__section  event__section--destination">
      <h3 class="event__section-title  event__section-title--destination">Destination</h3>
      <p class="event__destination-description">${newDestination.description}</p>
      <div class="event__photos-container">
        <div class="event__photos-tape">
          ${eventPhotosMarkup}
        </div>
      </div>
    </section>`;
  }

  static parseTripPointToStateData(tripPoint) {
    return Object.assign(
      {},
      tripPoint,
      {
        offers: tripPoint.offers.slice(),
        isDisabled: false,
        isSaving: false,
        isDeleting: false,
      },
    );
  }

  static parseStateDataToTripPoint(stateData) {
    stateData =  Object.assign({}, stateData);

    delete stateData.isDisabled;
    delete stateData.isSaving;
    delete stateData.isDeleting;

    return stateData;
  }
}
