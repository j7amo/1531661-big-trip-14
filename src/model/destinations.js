import Observer from '../utils/observer';

export default class DestinationsModel extends Observer {
  constructor() {
    super();
    this._destinations = {};
  }

  getDestinations() {
    return this._destinations;
  }

  setDestinations(destinations) {
    this._destinations = new Map(destinations);
  }

  static adaptToClient (destinations) {
    return new Map(destinations.map((destination) => [destination.name, destination]));
  }

  static adaptToServer (destinations) {
    return Array.from(destinations.values());
  }
}
