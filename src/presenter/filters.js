import { replace, remove, render, RenderPosition} from '../utils/render.js';
import { UpdateType } from '../const.js';
import FiltersView from '../view/filters.js';

export default class FiltersPresenter {
  constructor(filtersContainer, filtersModel, sortModel, tripPointsModel) {
    this._filtersContainer = filtersContainer;
    this._filtersModel = filtersModel;
    this._sortModel = sortModel;
    // module9-task2
    // прокачаем фильтры: теперь в зависимости от того, какие точки маршрута есть в модели, фильтры будут
    // соответствующим образом отрисовываться (например,если на данный момент в модели нет точек,
    // подходящих под фильтр FUTURE, то соответствующий контрол фильтра будет disabled)
    this._tripPointsModel = tripPointsModel;
    this._filtersComponent = null;

    this._handleModelEvent = this._handleModelEvent.bind(this);
    this._handleActiveFilterChange = this._handleActiveFilterChange.bind(this);

    this._filtersModel.addObserver(this._handleModelEvent);
    // module9-task2
    // так как нам теперь интересно, что происходит в модели точек маршрута, то нужно подписаться на обновления
    this._tripPointsModel.addObserver(this._handleModelEvent);
  }

  init() {
    const prevFiltersComponent = this._filtersComponent;
    this._filtersComponent = new FiltersView(this._filtersModel.getFilter(), this._tripPointsModel.getTripPoints());
    this._filtersComponent.setActiveFilterChangeHandler(this._handleActiveFilterChange);

    if (prevFiltersComponent === null) {
      render(this._filtersContainer, this._filtersComponent, RenderPosition.BEFOREEND);
      return;
    }

    replace(this._filtersComponent, prevFiltersComponent);
    remove(prevFiltersComponent);
  }

  _handleModelEvent() {
    this.init();
  }

  _handleActiveFilterChange(activeFilter) {
    if (this._filtersModel.getFilter() === activeFilter) {
      return;
    }
    // при изменении фильтра передаём тип апдейта, чтобы система понимала насколько сильно надо обновить доску
    // PATCH - обновление одной точки маршрута
    // MINOR - обновление всего списка точек маршрута
    // MAJOR - обновление всей доски (список + сортировка)
    // Почему передаём MAJOR? Потому что по ТЗ при смене фильтров должна сбрасываться сортировка!
    this._filtersModel.setFilter(UpdateType.MAJOR, activeFilter);
    this._sortModel.setSort(UpdateType.MAJOR, null, true);
  }
}
