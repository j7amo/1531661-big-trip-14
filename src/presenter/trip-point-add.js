// презентер добавления новой точки маршрута
import TripPointAddFormView from '../view/trip-point-add-form.js';
import {remove, render, RenderPosition} from '../utils/render.js';
import {UpdateType, UserAction} from '../const.js';

export default class TripPointAddPresenter {
  constructor(tripPointsListContainer, changeData, offersModel, destinationsModel) {
    this._tripPointsListContainer = tripPointsListContainer;
    this._changeData = changeData;
    this._offersModel = offersModel.getOffers();
    this._destinationsModel = destinationsModel.getDestinations();
    this._tripPointAddComponent = null;
    this._handleFormSubmit = this._handleFormSubmit.bind(this);
    this._handleFormCancelClick = this._handleFormCancelClick.bind(this);
    this._handleEscKeyDown = this._handleEscKeyDown.bind(this);
  }

  init() {
    //this._prevTripPointAddComponent = this._tripPointAddComponent;

    this._tripPointAddComponent = new TripPointAddFormView(this._offersModel, this._destinationsModel);
    this._tripPointAddComponent.setFormSubmitHandler(this._handleFormSubmit);
    this._tripPointAddComponent.setFormCancelHandler(this._handleFormCancelClick);
    render(this._tripPointsListContainer, this._tripPointAddComponent, RenderPosition.AFTERBEGIN);
    document.addEventListener('keydown', this._handleEscKeyDown);

    // if (this._prevTripPointAddComponent === null) {
    //   render(this._tripPointsListContainer, this._tripPointAddComponent, RenderPosition.AFTERBEGIN);
    //   return;
    // }
    //
    // remove(this._prevTripPointAddComponent);
  }

  destroy() {
    remove(this._tripPointAddComponent);
    this._tripPointAddComponent = null;
    document.removeEventListener('keydown', this._handleEscKeyDown);
  }

  _handleEscKeyDown(evt) {
    if (evt.key === 'Esc' || evt.key === 'Escape') {
      evt.preventDefault();
      this.destroy();
    }
  }

  _handleFormCancelClick() {
    this.destroy();
  }

  _handleFormSubmit(tripPoint) {
    this._changeData(
      UserAction.ADD_TRIP_POINT,
      UpdateType.MINOR,
      tripPoint,
    );
    this.destroy();
  }
}
