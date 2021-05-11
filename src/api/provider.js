import TripPointsModel from '../model/trip-points.js';
import { isOnline } from '../utils/common.js';
import OffersModel from '../model/offers.js';
import DestinationsModel from '../model/destinations.js';

const getSyncedTripPoints = (items) => {
  return items.filter(({success}) => success)
    .map(({payload}) => payload.point);
};

// объявим метод, который будет создавать структуру хранилища
// он будет брать ID точки маршрута и сам её объект и эту пару записывать
const createTripPointStorageStructure = (items) => {
  return items.reduce((acc, current) => {
    return Object.assign({}, acc, {
      [current.id]: current,
    });
  }, {});
};

// опишем абстракцию Provider'а, который будет использовать делегирование:
// - если мы ОНЛАЙН, то вся работа передаётся классу Api, который у нас отвечает за взаимодействие с сервером
// - если мы ОФФЛАЙН - класс Api нам НЕ нужен, так как очевидно взаимодействия с сервером нет и с данными работаем локально
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
    const tripPointsStorage = Object.values(this._tripPointsStorage.getItems());

    return Promise.resolve(tripPointsStorage.map(TripPointsModel.adaptToClient));
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

    this._tripPointsStorage.setItem(tripPoint.id, TripPointsModel.adaptToServer(Object.assign({}, tripPoint)));

    return Promise.resolve(tripPoint);
  }

  addTripPoint(tripPoint) {
    if (isOnline()) {
      return this._api.addTripPoint(tripPoint)
        .then((addedTripPoint) => {
          this._tripPointsStorage.setItem(addedTripPoint.id, TripPointsModel.adaptToServer(addedTripPoint));
          return addedTripPoint;
        });
    }

    return Promise.reject(new Error('Failed to add trip point'));
  }

  deleteTripPoint(tripPoint) {
    if (isOnline()) {
      return this._api.deleteTripPoint(tripPoint)
        .then(() => this._tripPointsStorage.removeItem(tripPoint.id));
    }

    return Promise.reject(new Error('Failed to delete trip point'));
  }

  sync() {
    if (isOnline()) {
      const tripPointsStorage = Object.values(this._tripPointsStorage.getItems());

      return this._api.sync(tripPointsStorage)
        .then((response) => {
          // Забираем из ответа синхронизированные точки маршрута
          const createdTripPoints = getSyncedTripPoints(response.created);
          const updatedTripPoints = getSyncedTripPoints(response.updated);

          // Добавляем синхронизированные точки маршрута в хранилище.
          // Хранилище должно быть актуальным в любой момент.
          const items = createTripPointStorageStructure([...createdTripPoints, ...updatedTripPoints]);

          this._tripPointsStorage.setItems(items);
        });
    }

    return Promise.reject(new Error('Failed to sync data'));
  }
}
