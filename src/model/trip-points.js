// в этом файле будет отдельный класс для МОДЕЛИ точек маршрута,
// так как наши модели реализуют паттерн "Наблюдатель", а у нас он уже реализован в отдельном классе,
// то нам достаточно для получения этого функционала унаследоваться от этого класса
import Observer from '../utils/observer';

export default class TripPointsModel extends Observer {
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

  // добавим в модель точек маршрута публичные(их будут дёргать презентеры) методы для
  // ОБНОВЛЕНИЯ точки маршрута
  updateTripPoint(updateType, update) {
    // находим индекс, под которым в массиве точек маршрута в модели находится нужная нам точка,
    // в этом нам поможет её ID
    const index = this._tripPoints.findIndex((tripPoint) => tripPoint.id === update.id);

    // выкинем ошибку в том случае, если такой точки маршрута по каким-то загадочным причинам не оказалось в модели
    if (index === -1) {
      throw new Error('Can\'t update nonexistent trip point');
    }

    // пересобираем массив:
    // 1) используем spread-оператор на подмассиве точек маршрута ДО обновляемого элемента
    // 2) используем новый пришедший из презентера элемент
    // 3) снова используем spread-оператор на подмассиве точек маршрута ПОСЛЕ обновляемого элемента
    // в итоге получится тот же самый массив, но уже с новым элементом под нужным нам индексом
    this._tripPoints = [
      ...this._tripPoints.slice(0, index),
      update,
      ...this._tripPoints.slice(index + 1),
    ];

    // но это ещё не всё! так как мы обновили данные модели, мы должны уведомить всех наблюдателей-подписчиков
    // с передаваемыми в метод аргументами пока не ясно ничего...
    this._notify(updateType, update);
  }

  // ДОБАВЛЕНИЯ точки маршрута
  addTripPoint(updateType, update) {
    this._tripPoints.push(update);
    this._notify(updateType, update);
  }
  // УДАЛЕНИЯ точки маршрута
  deleteTripPoint(updateType, update) {
    const index = this._tripPoints.findIndex((tripPoint) => tripPoint.id === update.id);

    if (index === -1) {
      throw new Error('Can\'t update nonexistent trip point');
    }

    this._tripPoints = [
      ...this._tripPoints.slice(0, index),
      ...this._tripPoints.slice(index + 1),
    ];

    // но это ещё не всё! так как мы обновили данные модели, мы должны уведомить всех наблюдателей-подписчиков
    // с передаваемыми в метод аргументами пока не ясно ничего...
    this._notify(updateType, update);
  }
}
