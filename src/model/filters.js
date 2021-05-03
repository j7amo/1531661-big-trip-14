// заведём отдельную модель для фильтров
// здесь будем хранить, менять значение текущего фильтра и оповещать наблюдателей (какой-нибудь презентер)
import Observer from '../utils/observer.js';
import { FilterType } from '../const.js';

export default class FiltersModel extends Observer {
  constructor() {
    super();
    // при создании модели сразу запишем дефолтный тип фильтра в свойство экземпляра модели
    this._activeFilter = FilterType.EVERYTHING;
  }

  // сеттер будет не только устанавливать текущее значение фильтра, но и дёргать _notify для оповещения
  // заинтересованных в этом презентеров, чтобы они могли сразу отреагировать, если нужно
  setFilter(updateType, filter) {
    this._activeFilter = filter;
    this._notify(updateType, filter);
  }

  getFilter() {
    return this._activeFilter;
  }
}
