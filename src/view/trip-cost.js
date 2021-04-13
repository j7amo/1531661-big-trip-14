import { createNewElement } from '../util.js';

const createTripCostTemplate = (allTripPointsData) => {
  let fullTripCost = 0;
  const prettyTripPoints = Array.from(allTripPointsData.values());
  prettyTripPoints.forEach((tripPoint) => fullTripCost += tripPoint.price);
  return `<p class="trip-info__cost">
    Total: &euro;&nbsp;<span class="trip-info__cost-value">${fullTripCost}</span>
  </p>`;
};

// по аналогии с site-menu.js производим "перевод на классы"
export default class TripCostView {
  constructor(allTripPointsData) {
    this._element = null;
    this._allTripPointsData = allTripPointsData;
  }

  getTemplate() {
    return createTripCostTemplate(this._allTripPointsData);
  }

  getElement() {
    if (!this._element) {
      this._element = createNewElement(this.getTemplate());
    }

    return this._element;
  }

  removeElement() {
    this._element = null;
  }
}
