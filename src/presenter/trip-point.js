import TripPointView from '../view/trip-point.js';
import TripPointEditFormView from '../view/trip-point-edit.js';
import {remove, render, RenderPosition, replace} from '../utils/render.js';
import { UserAction, UpdateType } from '../const.js';
import { isOnline } from '../utils/common.js';
import { toast } from '../utils/toast.js';

const Mode = {
  DEFAULT: 'DEFAULT',
  EDITING: 'EDITING',
};

const State = {
  SAVING: 'SAVING',
  DELETING: 'DELETING',
  ABORTING: 'ABORTING',
};

export default class TripPointPresenter {
  constructor(tripPointsListContainer, changeData, changeMode) {
    this._tripPointsListContainer = tripPointsListContainer;
    this._changeData = changeData;
    this._changeMode = changeMode;
    this._tripPointCardComponent = null;
    this._tripPointEditFormComponent = null;
    this._mode = Mode.DEFAULT;

    this._handleFavoritesClick = this._handleFavoritesClick.bind(this);
    this._handleCardEditClick = this._handleCardEditClick.bind(this);
    this._handleFormEditClick = this._handleFormEditClick.bind(this);
    this._handleFormSubmit = this._handleFormSubmit.bind(this);
    this._handleFormDeleteClick = this._handleFormDeleteClick.bind(this);
    this._escKeyDownHandler = this._escKeyDownHandler.bind(this);
  }

  init(tripPoint, eventTypeToOffersPairs, destinations) {
    this._tripPoint = tripPoint;
    this._prevTripPointCardComponent = this._tripPointCardComponent;
    this._prevTripPointEditFormComponent = this._tripPointEditFormComponent;

    this._tripPointCardComponent = new TripPointView(this._tripPoint);
    this._tripPointEditFormComponent = new TripPointEditFormView(this._tripPoint, eventTypeToOffersPairs, destinations);

    this._tripPointCardComponent.setEditClickHandler(this._handleCardEditClick);
    this._tripPointEditFormComponent.setEditClickHandler(this._handleFormEditClick);
    this._tripPointEditFormComponent.setFormSubmitHandler(this._handleFormSubmit);
    this._tripPointCardComponent.setFavoriteClickHandler(this._handleFavoritesClick);
    this._tripPointEditFormComponent.setFormDeleteClickHandler(this._handleFormDeleteClick);

    if (this._prevTripPointCardComponent === null || this._prevTripPointEditFormComponent === null) {
      render(this._tripPointsListContainer, this._tripPointCardComponent, RenderPosition.BEFOREEND);
      return;
    }

    if (this._mode === Mode.DEFAULT) {
      replace(this._tripPointCardComponent, this._prevTripPointCardComponent);
    }

    if (this._mode === Mode.EDITING) {
      replace(this._tripPointCardComponent, this._prevTripPointEditFormComponent);
      this._mode = Mode.DEFAULT;
    }

    remove(this._prevTripPointCardComponent);
    remove(this._prevTripPointEditFormComponent);
  }

  destroy() {
    remove(this._tripPointCardComponent);
    remove(this._tripPointEditFormComponent);
  }

  resetView() {
    if (this._mode === Mode.EDITING) {
      this._switchFromFormToCard();
    }
  }

  setViewState(state) {
    const resetViewState = () => {
      this._tripPointEditFormComponent.updateState({
        isDisabled: false,
        isSaving: false,
        isDeleting: false,
      });
    };

    switch (state) {
      case State.SAVING:
        this._tripPointEditFormComponent.updateState({
          isDisabled: true,
          isSaving: true,
        });
        break;
      case State.DELETING:
        this._tripPointEditFormComponent.updateState({
          isDisabled: true,
          isDeleting: true,
        });
        break;
      case State.ABORTING:
        this._tripPointCardComponent.shake(resetViewState);
        this._tripPointEditFormComponent.shake(resetViewState);
        break;
    }
  }

  _switchFromCardToForm() {
    replace(this._tripPointEditFormComponent, this._tripPointCardComponent);
    document.addEventListener('keydown', this._escKeyDownHandler);
    this._changeMode();
    this._mode = Mode.EDITING;
  }

  _switchFromFormToCard() {
    replace(this._tripPointCardComponent, this._tripPointEditFormComponent);
    document.removeEventListener('keydown', this._escKeyDownHandler);
    this._mode = Mode.DEFAULT;
  }

  _handleFavoritesClick() {
    this._changeData(
      UserAction.UPDATE_TRIP_POINT,
      UpdateType.MINOR,
      Object.assign(
        {},
        this._tripPoint,
        {
          isFavorite: !this._tripPoint.isFavorite,
        },
      ),
    );
  }

  _escKeyDownHandler(evt) {
    if (evt.key === 'Esc' || evt.key === 'Escape') {
      evt.preventDefault();
      this._tripPointEditFormComponent.reset(this._tripPoint);
      this._switchFromFormToCard();
    }
  }

  _handleCardEditClick() {
    if (!isOnline()) {
      toast('You can\'t edit trip point while offline');
      return;
    }

    this._switchFromCardToForm();
  }

  _handleFormEditClick() {
    this._tripPointEditFormComponent.reset(this._tripPoint);
    this._switchFromFormToCard();
  }

  _handleFormSubmit(tripPoint) {
    // if (!isOnline()) {
    //   toast('You can\'t save trip point while offline');
    //   return;
    // }

    this._changeData(
      UserAction.UPDATE_TRIP_POINT,
      UpdateType.MINOR,
      tripPoint,
    );
  }

  _handleFormDeleteClick(tripPoint) {
    // if (!isOnline()) {
    //   toast('You can\'t delete trip point while offline');
    //   return;
    // }

    this._changeData(
      UserAction.DELETE_TRIP_POINT,
      UpdateType.MINOR,
      tripPoint,
    );
  }
}

export { State };
