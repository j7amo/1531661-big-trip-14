import { FilterType } from '../const.js';
import AbstractView from './abstract.js';
// Что делает и что нужно вьюхе фильтров?
// Вьюха фильтров отображает текущий выбранный фильтр. Это делается при помощи текущего значения активного фильтра:
// на основании этого значения выбирается какой чекбокс отметить выбранным.
// Так как это значение является данными, то оно должно храниться в соответствующей модели - модели фильтров.
// Кроме простого отображения активного фильтра вьюха должна ещё уведомлять свой презентер об изменении
// значения фильтра. А её презентер должен по цепочке передать новое значение фильтра в модель. Модель обновляет значение,
// уведомляет презентер и так до бесконечности.
const createFiltersTemplate = (activeFilter) => {
  return `<form class="trip-filters" action="#" method="get">
    <div class="trip-filters__filter">
      <input id="filter-everything" class="trip-filters__filter-input  visually-hidden" type="radio" name="trip-filter" value="everything" ${activeFilter === FilterType.EVERYTHING ? 'checked' : ''}>
      <label class="trip-filters__filter-label" for="filter-everything">Everything</label>
    </div>

    <div class="trip-filters__filter">
      <input id="filter-future" class="trip-filters__filter-input  visually-hidden" type="radio" name="trip-filter" value="future" ${activeFilter === FilterType.FUTURE ? 'checked' : ''}>
      <label class="trip-filters__filter-label" for="filter-future">Future</label>
    </div>

    <div class="trip-filters__filter">
      <input id="filter-past" class="trip-filters__filter-input  visually-hidden" type="radio" name="trip-filter" value="past" ${activeFilter === FilterType.PAST ? 'checked' : ''}>
      <label class="trip-filters__filter-label" for="filter-past">Past</label>
    </div>

    <button class="visually-hidden" type="submit">Accept filter</button>
  </form>`;
};

// по аналогии с site-menu.js производим "перевод на классы"
export default class FiltersView extends AbstractView {
  constructor(activeFilter) {
    super();
    this._activeFilter = activeFilter;
    this._handleActiveFilterChange = this._handleActiveFilterChange.bind(this);
  }

  getTemplate() {
    return createFiltersTemplate(this._activeFilter);
  }

  // объявим приватный метод для связи внешнего коллбэка от презентера с локальным событием
  _handleActiveFilterChange(evt) {
    evt.preventDefault();
    this._callback.activeFilterChange(evt.target.value);
  }

  // объявим сеттер для внешнего обработчика презентера (для уведомления презентера об изменении текущего фильтра)
  setActiveFilterChangeHandler(callback) {
    this._callback.activeFilterChange =  callback;
    this.getElement().addEventListener('change', this._handleActiveFilterChange);
  }
}
