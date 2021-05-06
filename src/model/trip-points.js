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
  // UPDATE после 8-го раздела:
  // теперь у нас при получении данных с сервера возникает ситуация, при которой на старте приложения у нас НЕ
  // отрисовывается основной контент (сортировка + список точек маршрута).
  // Причиной такого поведения является тот факт, что получение данных с сервера это асинхронная операция и
  // она выполняется после основной отрисовки, поэтому мы вынуждены изменить СЕТТЕР в модели: теперь каждая "установка"
  // данных в модели будет провоцировать возникновение события, оповещать о нём наблюдателей( чтобы вызывать перерисовку)
  setTripPoints(updateType, tripPoints) {
    this._tripPoints = tripPoints.slice();
    this._notify(updateType);
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
      throw new Error('Can\'t delete nonexistent trip point');
    }

    this._tripPoints = [
      ...this._tripPoints.slice(0, index),
      ...this._tripPoints.slice(index + 1),
    ];

    // но это ещё не всё! так как мы обновили данные модели, мы должны уведомить всех наблюдателей-подписчиков
    // с передаваемыми в метод аргументами пока не ясно ничего...
    this._notify(updateType, update);
  }

  // после того, как мы начали работать с данными, которые приходят с сервера, мы убедились в том, что
  // сами структуры данных и названия свойств отличаются и поэтому нам нужно написать АДАПТЕРЫ
  // это будут статические методы моделей (почему статические? ХЗ)
  // АДАПТЕР №1: СЕРВЕР => ЛОКАЛЬНЫЙ ФОРМАТ
  static adaptToClient (tripPoint) {
    // для того, чтобы адаптировать полученный с сервера объект к тому, с чем умеет работать наш код
    // воспользуемся проверенным методом, при котором используем Object.assign + пустой объект + входной объект
    // + подмешиваем/меняем то, что нам нужно для обеспечения совместимости
    const adaptedTripPoint = Object.assign(
      {},
      tripPoint,
      // здесь мы добавим в объект нужные нам свойства
      {
        price: tripPoint.base_price ? Number(tripPoint.base_price) : tripPoint.base_price,
        beginDate: tripPoint.date_from ? new Date(tripPoint.date_from) : tripPoint.date_from,
        endDate: tripPoint.date_to ? new Date(tripPoint.date_to) : tripPoint.date_to,
        isFavorite: tripPoint.is_favorite,
      },
    );
    // а здесь - удалим ненужные
    delete adaptedTripPoint.base_price;
    delete adaptedTripPoint.date_from;
    delete adaptedTripPoint.date_to;
    delete adaptedTripPoint.is_favorite;

    return adaptedTripPoint;
  }
  // АДАПТЕР №2: ЛОКАЛЬНЫЙ ФОРМАТ => СЕРВЕР
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
