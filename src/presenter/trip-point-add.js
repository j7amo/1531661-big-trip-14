import TripPointAddFormView from '../view/trip-point-add-form.js';
import {remove, render, RenderPosition} from '../utils/render.js';
import {UpdateType, UserAction} from '../const.js';
import {toast} from '../utils/toast';
import {isOnline} from '../utils/common';

const newTripPointButtonElement = document.querySelector('.trip-main__event-add-btn');

export default class TripPointAddPresenter {
  constructor(tripPointsListContainer, changeData, offersModel, destinationsModel) {
    this._tripPointsListContainer = tripPointsListContainer;
    this._changeData = changeData;
    this._offersModel = offersModel;
    this._destinationsModel = destinationsModel;
    this._tripPointAddComponent = null;

    this._handleFormSubmit = this._handleFormSubmit.bind(this);
    this._handleFormCancelClick = this._handleFormCancelClick.bind(this);
    this._handleEscKeyDown = this._handleEscKeyDown.bind(this);
  }

  init() {
    this._tripPointAddComponent = new TripPointAddFormView(this._offersModel.getOffers(), this._destinationsModel.getDestinations());
    this._tripPointAddComponent.setFormSubmitHandler(this._handleFormSubmit);
    this._tripPointAddComponent.setFormCancelHandler(this._handleFormCancelClick);
    render(this._tripPointsListContainer, this._tripPointAddComponent, RenderPosition.AFTERBEGIN);
    document.addEventListener('keydown', this._handleEscKeyDown);
  }

  destroy() {
    remove(this._tripPointAddComponent);
    this._tripPointAddComponent = null;
    document.removeEventListener('keydown', this._handleEscKeyDown);
  }

  setSaving() {
    this._tripPointAddComponent.updateState({
      isDisabled: true,
      isSaving: true,
    });
  }

  setAborting() {
    const resetFormState = () => {
      this._tripPointAddComponent.updateState({
        isDisabled: false,
        isSaving: false,
        isDeleting: false,
      });
    };

    this._tripPointAddComponent.shake(resetFormState);
  }

  _handleEscKeyDown(evt) {
    if (evt.key === 'Esc' || evt.key === 'Escape') {
      evt.preventDefault();
      this.destroy();
      newTripPointButtonElement.disabled = false;
    }
  }

  _handleFormCancelClick() {
    this.destroy();
    newTripPointButtonElement.disabled = false;
  }

  _handleFormSubmit(tripPoint) {
    if (!isOnline()) {
      toast('You can\'t save trip point while offline');
      return;
    }

    this._changeData(
      UserAction.ADD_TRIP_POINT,
      UpdateType.MINOR,
      tripPoint,
    );
    newTripPointButtonElement.disabled = false;
  }
}
