import TripPointsModel from '../model/trip-points.js';
import { isOnline } from '../utils/common.js';
import OffersModel from '../model/offers.js';
import DestinationsModel from '../model/destinations.js';
import { toast } from '../utils/toast.js';

const getSyncedTripPoints = (items) => {
  return items
    .filter(({success}) => success)
    .map(({payload}) => payload.point);
};

const createTripPointStorageStructure = (items) => {
  return items.reduce((acc, current) => {
    return Object.assign(
      {},
      acc,
      {
        [current.id]: current,
      },
    );
  },
  {});
};

export default class Provider {
  constructor(api, tripPointsStorage, offersStorage, destinationsStorage) {
    this._api = api;
    this._tripPointsStorage = tripPointsStorage;
    this._offersStorage = offersStorage;
    this._destinationsStorage = destinationsStorage;
  }

  getTripPoints() {
    if (isOnline()) {
      return this._api.getTripPoints()
        .then((tripPoints) => {
          const items = createTripPointStorageStructure(tripPoints.map(TripPointsModel.adaptToServer));
          this._tripPointsStorage.setItems(items);
          return tripPoints;
        });
    }

    const storagedTripPoints = Object.values(this._tripPointsStorage.getItems());

    return Promise.resolve(storagedTripPoints.map(TripPointsModel.adaptToClient));
  }

  getOffers() {
    if (isOnline()) {
      return this._api.getOffers()
        .then((offers) => {
          const items = OffersModel.adaptToServer(offers);
          this._offersStorage.setItems(items);
          return offers;
        });
    }

    return Promise.resolve(OffersModel.adaptToClient(this._offersStorage.getItems()));
  }

  getDestinations() {
    if (isOnline()) {
      return this._api.getDestinations()
        .then((destinations) => {
          const items = DestinationsModel.adaptToServer(destinations);
          this._destinationsStorage.setItems(items);
          return destinations;
        });
    }

    return Promise.resolve(DestinationsModel.adaptToClient(this._destinationsStorage.getItems()));
  }

  updateTripPoint(tripPoint) {
    if (isOnline()) {
      return this._api.updateTripPoint(tripPoint)
        .then((updatedTripPoint) => {
          this._tripPointsStorage.setItem(updatedTripPoint.id, TripPointsModel.adaptToServer(updatedTripPoint));
          return updatedTripPoint;
        });
    }

    return Promise.reject(toast('You can\'t update trip point while offline'));
  }

  addTripPoint(tripPoint) {
    if (isOnline()) {
      return this._api.addTripPoint(tripPoint)
        .then((addedTripPoint) => {
          this._tripPointsStorage.setItem(addedTripPoint.id, TripPointsModel.adaptToServer(addedTripPoint));
          return addedTripPoint;
        });
    }

    return Promise.reject(toast('You can\'t add trip point while offline'));
  }

  deleteTripPoint(tripPoint) {
    if (isOnline()) {
      return this._api.deleteTripPoint(tripPoint)
        .then(() => this._tripPointsStorage.removeItem(tripPoint.id));
    }

    return Promise.reject(toast('You can\'t delete trip point while offline'));
  }

  sync() {
    if (isOnline()) {
      const storagedTripPoints = Object.values(this._tripPointsStorage.getItems());

      return this._api.sync(storagedTripPoints)
        .then((response) => {
          const createdTripPoints = getSyncedTripPoints(response.created);
          const updatedTripPoints = getSyncedTripPoints(response.updated);
          const items = createTripPointStorageStructure([...createdTripPoints, ...updatedTripPoints]);
          this._tripPointsStorage.setItems(items);
        });
    }

    return Promise.reject(new Error('Failed to sync data'));
  }
}
