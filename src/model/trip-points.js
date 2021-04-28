// в этом файле будет отдельный класс для МОДЕЛИ точек маршрута,
// так как наши модели реализуют паттерн "Наблюдатель", а у нас он уже реализован в отдельном классе,
// то нам достаточно для получения этого функционала унаследоваться от этого класса
import Observer from '../utils/observer';

export default class TripPoints extends Observer {
  constructor() {
    super();
    this._tripPoints = [];
  }

  // объявим сеттер и геттер для свойства this._tripPoints
  // если я правильно понимаю, то эти методы будут "дёргать" презентеры для обновления модели и получения новых данных
  // из неё ( но это не точно =))))
  setTripPoints(tripPoints) {
    this._tripPoints = tripPoints.slice();
  }

  getTripPoints() {
    return this._tripPoints;
  }
}
