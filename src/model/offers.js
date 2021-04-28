// в этом файле будет отдельный класс для МОДЕЛИ офферов (опций),
// так как наши модели реализуют паттерн "Наблюдатель", а у нас он уже реализован в отдельном классе,
// то нам достаточно для получения этого функционала унаследоваться от этого класса
import Observer from '../utils/observer';

export default class OffersModel extends Observer {
  constructor() {
    super();
    this._offers = {};
  }

  setOffers(offers) {
    this._offers = Object.assign({}, offers);
  }

  getOffers() {
    return this._offers;
  }
}
