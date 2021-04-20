import TripPointView from '../view/trip-point.js';
import TripPointEditFormView from '../view/trip-point-edit.js';
import { render, RenderPosition, replace } from '../utils/render.js';

export default class TripPointPresenter {
  constructor(tripPointsListContainer) {
    this._tripPointsListContainer = tripPointsListContainer;
    this._tripPointCardComponent = null;
    this._tripPointEditFormComponent = null;
    this._handleCardEditClick = this._handleCardEditClick.bind(this);
    this._handleFormEditClick = this._handleFormEditClick.bind(this);
    this._handleFormSubmit = this._handleFormSubmit.bind(this);
    this._handleEscKeyDown = this._handleEscKeyDown.bind(this);
  }

  init(tripPoint, eventTypeToOffersMap, destinations) {
    this._tripPoint = tripPoint;
    this._tripPointCardComponent = new TripPointView(this._tripPoint);
    this._tripPointEditFormComponent = new TripPointEditFormView(this._tripPoint, eventTypeToOffersMap, destinations);
    this._tripPointCardComponent.setEditClickHandler(this._handleCardEditClick);
    this._tripPointEditFormComponent.setEditClickHandler(this._handleFormEditClick);
    this._tripPointEditFormComponent.setFormSubmitHandler(this._handleFormSubmit);

    render(this._tripPointsListContainer, this._tripPointCardComponent, RenderPosition.BEFOREEND);
  }

  _switchFromCardToForm() {
    replace(this._tripPointEditFormComponent, this._tripPointCardComponent);
    document.addEventListener('keydown', this._handleEscKeyDown);
  }

  _switchFromFormToCard() {
    replace(this._tripPointCardComponent, this._tripPointEditFormComponent);
    document.removeEventListener('keydown', this._handleEscKeyDown);
  }

  // обработчик события нажатия Escape, когда пункт маршрута в представлении формы редактирования
  _handleEscKeyDown(evt) {
    if (evt.key === 'Esc' || evt.key === 'Escape') {
      evt.preventDefault();
      this._switchFromFormToCard();
    }
  }

  // обработчик события click треугольной кнопки, когда пункт маршрута в обычном представлении
  _handleCardEditClick() {
    this._switchFromCardToForm();
  }

  // обработчик события click треугольной кнопки, когда пункт маршрута в представлении формы редактирования
  _handleFormEditClick() {
    this._switchFromFormToCard();
  }

  // обработчик события submit, когда пункт маршрута в представлении формы редактирования
  _handleFormSubmit() {
    this._switchFromFormToCard();
  }
}
