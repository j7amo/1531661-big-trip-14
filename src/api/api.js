import TripPointsModel from '../model/trip-points.js';
import OffersModel from '../model/offers.js';
import DestinationsModel from '../model/destinations.js';

const Method = {
  GET: 'GET',
  PUT: 'PUT',
  POST: 'POST',
  DELETE: 'DELETE',
};

const SuccessHTTPStatusRange = {
  MIN: 200,
  MAX: 299,
};

const URL = {
  TRIP_POINTS: 'points',
  TRIP_POINTS_SYNC: 'points/sync',
  OFFERS: 'offers',
  DESTINATIONS: 'destinations',
};

const headersContentType = {'Content-Type': 'application/json'};
const headersToAppend = 'Authorization';

export default class Api {
  constructor(endPoint, authorization) {
    this._endPoint = endPoint;
    this._authorization = authorization;
  }

  getTripPoints() {
    return this._load({url: URL.TRIP_POINTS})
      .then(Api.toJSON)
      .then((tripPoints) => tripPoints.map((tripPoint) => TripPointsModel.adaptToClient(tripPoint)));
  }

  getOffers() {
    return this._load({url: URL.OFFERS})
      .then(Api.toJSON)
      .then((offers) => OffersModel.adaptToClient(offers));
  }

  getDestinations() {
    return this._load({url: URL.DESTINATIONS})
      .then(Api.toJSON)
      .then((destinations) => DestinationsModel.adaptToClient(destinations));
  }

  updateTripPoint(tripPoint) {
    return this._load({
      url: `${URL.TRIP_POINTS}/${tripPoint.id}`,
      method: Method.PUT,
      body: JSON.stringify(TripPointsModel.adaptToServer(tripPoint)),
      headers: new Headers(headersContentType),
    })
      .then(Api.toJSON)
      .then(TripPointsModel.adaptToClient);
  }

  addTripPoint(tripPoint) {
    return this._load({
      url: URL.TRIP_POINTS,
      method: Method.POST,
      body: JSON.stringify(TripPointsModel.adaptToServer(tripPoint)),
      headers: new Headers(headersContentType),
    })
      .then(Api.toJSON)
      .then(TripPointsModel.adaptToClient);
  }

  deleteTripPoint(tripPoint) {
    return this._load({
      url: `${URL.TRIP_POINTS}/${tripPoint.id}`,
      method: Method.DELETE,
    });
  }

  sync(data) {
    return this._load({
      url: URL.TRIP_POINTS_SYNC,
      method: Method.POST,
      body: JSON.stringify(data),
      headers: new Headers(headersContentType),
    })
      .then(Api.toJSON);
  }

  _load({
    url,
    method = Method.GET,
    body = null,
    headers = new Headers(),
  }) {
    headers.append(headersToAppend, this._authorization);
    return fetch(
      `${this._endPoint}/${url}`,
      {method, body, headers},
    )
      .then(Api.checkStatus)
      .catch(Api.catchError);
  }

  static checkStatus(response) {
    if (
      response.status < SuccessHTTPStatusRange.MIN ||
      response.status > SuccessHTTPStatusRange.MAX
    ) {
      throw new Error(`${response.status}: ${response.statusText}`);
    }

    return response;
  }

  static toJSON(response) {
    return response.json();
  }

  static catchError(err) {
    throw err;
  }
}
