// в этом файле будет отдельный класс для МОДЕЛИ направлений,
// так как наши модели реализуют паттерн "Наблюдатель", а у нас он уже реализован в отдельном классе,
// то нам достаточно для получения этого функционала унаследоваться от этого класса
import Observer from '../utils/observer';

export default class DestinationsModel extends Observer {
  constructor() {
    super();
    this._destinations = {};
  }

  setDestinations(destinations) {
    this._destinations = new Map(destinations);
  }

  getDestinations() {
    return this._destinations;
  }

  static adaptToClient (destinations) {
    return new Map(destinations.map((destination) => [destination.name, destination]));
  }
}
