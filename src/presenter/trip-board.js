import TripBoardView from '../view/trip-board.js';
import TripPointsListView from '../view/trip-points-list.js';
import NoTripPointsView from '../view/no-trip-points.js';
import {remove, render, RenderPosition} from '../utils/render.js';
import {filter} from '../utils/filters.js';
import {FilterType, UpdateType, UserAction} from '../const.js';
import {sort} from '../utils/sort.js';
import TripPointPresenter, { State as TripPointViewState } from './trip-point.js';
import SortPresenter from './sort.js';
import TripPointAddPresenter from './trip-point-add.js';
import LoadingView from '../view/loading.js';

export default class TripBoardPresenter {
  constructor(tripBoardContainer, filtersModel, sortModel, tripPointsModel, offersModel, destinationsModel, api) {
    this._tripBoardContainer = tripBoardContainer;
    this._isLoading = true;
    this._loadingComponent = new LoadingView();
    this._tripBoardComponent = new TripBoardView();
    this._tripPointsListComponent = new TripPointsListView();
    this._noTripPointsComponent = new NoTripPointsView();
    this._tripPointPresenters = {};
    this._sortPresenters = [];
    this._filtersModel = filtersModel;
    this._sortModel = sortModel;
    this._tripPointsModel = tripPointsModel;
    this._offersModel = offersModel;
    this._destinationsModel = destinationsModel;
    this._api = api;

    this._handleViewAction = this._handleViewAction.bind(this);
    this._handleModelEvent = this._handleModelEvent.bind(this);
    this._handleModeChange = this._handleModeChange.bind(this);

    this._tripPointAddPresenter = new TripPointAddPresenter(this._tripPointsListComponent, this._handleViewAction, this._offersModel, this._destinationsModel);
  }

  init() {
    render(this._tripBoardContainer, this._tripBoardComponent, RenderPosition.BEFOREEND);
    render(this._tripBoardComponent, this._tripPointsListComponent, RenderPosition.BEFOREEND);
    this._filtersModel.addObserver(this._handleModelEvent);
    this._sortModel.addObserver(this._handleModelEvent);
    this._tripPointsModel.addObserver(this._handleModelEvent);
    this._offersModel.addObserver(this._handleModelEvent);
    this._destinationsModel.addObserver(this._handleModelEvent);
    this._renderTripBoard();
  }

  destroy() {
    this._clearTripBoard();
    remove(this._tripBoardComponent);
    remove(this._tripPointsListComponent);
    this._filtersModel.removeObserver(this._handleModelEvent);
    this._sortModel.removeObserver(this._handleModelEvent);
    this._tripPointsModel.removeObserver(this._handleModelEvent);
    this._offersModel.removeObserver(this._handleModelEvent);
    this._destinationsModel.removeObserver(this._handleModelEvent);
  }

  createTripPoint() {
    this._filtersModel.setFilter(UpdateType.MAJOR, FilterType.EVERYTHING);
    this._sortModel.setSort(UpdateType.MAJOR, null, true);
    this._tripPointAddPresenter.init();
  }

  _getTripPoints() {
    const activeFilter = this._filtersModel.getFilter();
    const activeSort = this._sortModel.getSort();
    const tripPoints = this._tripPointsModel.getTripPoints();
    const filteredTripPoints = filter[activeFilter](tripPoints);

    return filteredTripPoints.sort(sort[activeSort]);
  }

  _getOffers() {
    return this._offersModel.getOffers();
  }

  _getDestinations() {
    return this._destinationsModel.getDestinations();
  }

  _handleViewAction(actionType, updateType, update) {
    switch(actionType) {
      case UserAction.UPDATE_TRIP_POINT:
        this._tripPointPresenters[update.id].setViewState(TripPointViewState.SAVING);
        this._api.updateTripPoint(update)
          .then((response) => this._tripPointsModel.updateTripPoint(updateType, response))
          .catch(() => this._tripPointPresenters[update.id].setViewState(TripPointViewState.ABORTING));
        break;
      case UserAction.ADD_TRIP_POINT:
        this._tripPointAddPresenter.setSaving();
        this._api.addTripPoint(update)
          .then((response) => this._tripPointsModel.addTripPoint(updateType, response))
          .catch(() => this._tripPointAddPresenter.setAborting());
        break;
      case UserAction.DELETE_TRIP_POINT:
        this._tripPointPresenters[update.id].setViewState(TripPointViewState.DELETING);
        this._api.deleteTripPoint(update)
          .then(() => this._tripPointsModel.deleteTripPoint(updateType, update))
          .catch(() => this._tripPointPresenters[update.id].setViewState(TripPointViewState.ABORTING));
        break;
    }
  }

  _handleModelEvent(updateType, data) {
    switch(updateType) {
      case UpdateType.PATCH:
        this._tripPointPresenters[data.id].init(data);
        break;
      case UpdateType.MINOR:
        this._clearTripBoard();
        this._renderTripBoard();
        break;
      case UpdateType.MAJOR:
        this._clearTripBoard();
        this._renderTripBoard();
        break;
      case UpdateType.INIT:
        this._isLoading = false;
        remove(this._loadingComponent);
        this._renderTripBoard();
        break;
    }
  }

  _clearTripBoard() {
    this._tripPointAddPresenter.destroy();
    Object.values(this._tripPointPresenters).forEach((tripPointPresenter) => tripPointPresenter.destroy());
    this._tripPointPresenters = {};
    this._sortPresenters.forEach((sortPresenter) => sortPresenter.destroy());
    this._sortPresenters = [];
    remove(this._loadingComponent);
    remove(this._noTripPointsComponent);
  }

  _handleModeChange() {
    this._tripPointAddPresenter.destroy();
    Object.values(this._tripPointPresenters).forEach((tripPointPresenter) => tripPointPresenter.resetView());
  }

  _renderSort() {
    const sortPresenter = new SortPresenter(this._tripBoardComponent, this._sortModel);
    this._sortPresenters.push(sortPresenter);
    sortPresenter.init();
  }

  _renderTripPoint(tripPoint, eventTypeToOffersPairs, destinations) {
    const tripPointPresenter = new TripPointPresenter(this._tripPointsListComponent, this._handleViewAction, this._handleModeChange);
    tripPointPresenter.init(tripPoint, eventTypeToOffersPairs, destinations);
    this._tripPointPresenters[tripPoint.id] = tripPointPresenter;
  }

  _renderNoTripPoints() {
    render(this._tripPointsListComponent, this._noTripPointsComponent, RenderPosition.AFTERBEGIN);
  }

  _renderLoading() {
    render(this._tripPointsListComponent, this._loadingComponent, RenderPosition.AFTERBEGIN);
  }

  _renderTripBoard() {
    if (this._isLoading) {
      this._renderLoading();
      return;
    }

    const tripPoints = this._getTripPoints();
    const eventOffers = this._getOffers();
    const destinations = this._getDestinations();

    if (tripPoints.length === 0) {
      this._renderNoTripPoints();
      return;
    }

    this._renderSort();

    tripPoints.forEach((tripPoint) => this._renderTripPoint(tripPoint, eventOffers, destinations));
  }

}
