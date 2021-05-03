// напишем презентер, который свяжет изменения в модели точек маршрута с изменением отображения данных
// в соответствующих вьюхах:
// - вьюха информации (отображение начального города, города где-то посередине, финального города маршрута
// и дат начала и завершения поездки)
// - вьюха стоимости поездки (отображение общей стоимости поездки, которая складывается из собственной стоимости точки маршрута,
// которую вводит пользователь в соответствующее поле и стоимости офферов, которые пользователь может прокликать и выбрать)
import TripInfoView from '../view/trip-info.js';
import TripCostView from '../view/trip-cost.js';
import {remove, render, RenderPosition, replace} from '../utils/render.js';

export default class TripInfoPresenter {
  constructor(tripInfoContainer, tripPointsModel) {
    this._tripInfoContainer = tripInfoContainer;
    this._tripPointsModel = tripPointsModel;
    this._tripInfoComponent = null;
    this._tripCostComponent = null;
    this._handleModelEvent = this._handleModelEvent.bind(this);
    this._tripPointsModel.addObserver(this._handleModelEvent);
  }

  _handleModelEvent() {
    this.init();
  }

  init() {
    const prevTripInfoComponent = this._tripInfoComponent;
    const prevTripCostComponent = this._tripCostComponent;
    this._tripInfoComponent = new TripInfoView(this._tripPointsModel.getTripPoints());
    this._tripCostComponent = new TripCostView(this._tripPointsModel.getTripPoints());

    if (prevTripInfoComponent === null || prevTripCostComponent === null) {
      render(this._tripInfoContainer, this._tripInfoComponent, RenderPosition.BEFOREEND);
      render(this._tripInfoContainer, this._tripCostComponent, RenderPosition.BEFOREEND);
      return;
    }

    replace(this._tripInfoComponent, prevTripInfoComponent);
    replace(this._tripCostComponent, prevTripCostComponent);
    remove(prevTripInfoComponent);
    remove(prevTripCostComponent);
  }
}
