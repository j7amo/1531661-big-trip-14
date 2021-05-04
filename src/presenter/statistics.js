// презентер статистики
//import {UpdateType} from '../const.js';
import {remove, render, RenderPosition, replace} from '../utils/render.js';
import StatisticsView from '../view/statistics.js';

export default class StatisticsPresenter {
  constructor(statisticsContainer, tripPointsModel) {
    this._statisticsContainer = statisticsContainer;
    this._tripPointsModel = tripPointsModel;
    this._statisticsComponent = null;

    this._handleModelEvent = this._handleModelEvent.bind(this);
  }

  init() {
    this._tripPointsModel.addObserver(this._handleModelEvent);
    const prevStatisticsComponent = this._statisticsComponent;
    this._statisticsComponent = new StatisticsView(this._tripPointsModel.getTripPoints());
    //this._statisticsComponent.setActiveFilterChangeHandler(this._handleActiveFilterChange);
    if (prevStatisticsComponent === null) {
      render(this._statisticsContainer, this._statisticsComponent, RenderPosition.BEFOREEND);
      return;
    }

    replace(this._statisticsComponent, prevStatisticsComponent);
    remove(prevStatisticsComponent);
  }

  // добавим метод для полного уничтожения статистики (этот метод нам понадобится в точке входа)
  destroy() {
    remove(this._statisticsComponent);
    this._statisticsComponent = null;
    this._tripPointsModel.removeObserver(this._handleModelEvent);
  }

  _handleModelEvent() {
    this.init();
  }

  // _handleActiveFilterChange(activeFilter) {
  //   if (this._filtersModel.getFilter() === activeFilter) {
  //     return;
  //   }
  //   // при изменении фильтра передаём тип апдейта, чтобы система понимала насколько сильно надо обновить доску
  //   // PATCH - обновление одной точки маршрута
  //   // MINOR - обновление всего списка точек маршрута
  //   // MAJOR - обновление всей доски (список + сортировка)
  //   // Почему передаём MAJOR? Потому что по ТЗ при смене фильтров должна сбрасываться сортировка!
  //   this._filtersModel.setFilter(UpdateType.MAJOR, activeFilter);
  //   this._sortModel.setSort(UpdateType.MAJOR, null, true);
  // }
}
