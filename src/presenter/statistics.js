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

    if (prevStatisticsComponent === null) {
      render(this._statisticsContainer, this._statisticsComponent, RenderPosition.BEFOREEND);
      return;
    }

    replace(this._statisticsComponent, prevStatisticsComponent);
    remove(prevStatisticsComponent);
  }

  destroy() {
    remove(this._statisticsComponent);
    this._statisticsComponent = null;
    this._tripPointsModel.removeObserver(this._handleModelEvent);
  }

  _handleModelEvent() {
    this.init();
  }
}
