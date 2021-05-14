import Observer from '../utils/observer';

export default class TripPointsModel extends Observer {
  constructor() {
    super();
    this._tripPoints = [];
  }

  getTripPoints() {
    return this._tripPoints;
  }

  setTripPoints(updateType, tripPoints) {
    this._tripPoints = tripPoints.slice();
    this._notify(updateType);
  }

  updateTripPoint(updateType, update) {
    const index = this._tripPoints.findIndex((tripPoint) => tripPoint.id === update.id);

    if (index === -1) {
      throw new Error('Can\'t update nonexistent trip point');
    }

    this._tripPoints = [
      ...this._tripPoints.slice(0, index),
      update,
      ...this._tripPoints.slice(index + 1),
    ];

    this._notify(updateType, update);
  }

  addTripPoint(updateType, update) {
    this._tripPoints.push(update);
    this._notify(updateType, update);
  }

  deleteTripPoint(updateType, update) {
    const index = this._tripPoints.findIndex((tripPoint) => tripPoint.id === update.id);

    if (index === -1) {
      throw new Error('Can\'t delete nonexistent trip point');
    }

    this._tripPoints = [
      ...this._tripPoints.slice(0, index),
      ...this._tripPoints.slice(index + 1),
    ];

    this._notify(updateType, update);
  }

  static adaptToClient (tripPoint) {
    const adaptedTripPoint = Object.assign(
      {},
      tripPoint,
      {
        price: tripPoint.base_price ? Number(tripPoint.base_price) : tripPoint.base_price,
        beginDate: tripPoint.date_from ? new Date(tripPoint.date_from) : tripPoint.date_from,
        endDate: tripPoint.date_to ? new Date(tripPoint.date_to) : tripPoint.date_to,
        isFavorite: tripPoint.is_favorite,
      },
    );
    delete adaptedTripPoint.base_price;
    delete adaptedTripPoint.date_from;
    delete adaptedTripPoint.date_to;
    delete adaptedTripPoint.is_favorite;

    return adaptedTripPoint;
  }

  static adaptToServer (tripPoint) {
    const adaptedTripPoint = Object.assign(
      {},
      tripPoint,
      {
        'base_price': tripPoint.price ? Number(tripPoint.price) : tripPoint.price,
        'date_from': tripPoint.beginDate instanceof Date ? tripPoint.beginDate.toISOString() : null,
        'date_to': tripPoint.endDate instanceof Date ? tripPoint.endDate.toISOString() : null,
        'is_favorite': tripPoint.isFavorite,
      },
    );
    delete adaptedTripPoint.price;
    delete adaptedTripPoint.beginDate;
    delete adaptedTripPoint.endDate;
    delete adaptedTripPoint.isFavorite;

    return adaptedTripPoint;
  }
}
