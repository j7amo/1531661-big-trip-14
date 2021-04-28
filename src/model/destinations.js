// в этом файле будет отдельный класс для МОДЕЛИ направлений,
// так как наши модели реализуют паттерн "Наблюдатель", а у нас он уже реализован в отдельном классе,
// то нам достаточно для получения этого функционала унаследоваться от этого класса
import Observer from '../utils/observer';

export default class Destinations extends Observer {
  constructor() {
    super();
    this._destinations = [];
  }

  setTripPoints(destinations) {
    this._destinations = destinations.slice();
  }

  getTripPoints() {
    return this._destinations;
  }
}
