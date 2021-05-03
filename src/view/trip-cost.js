import AbstractView from './abstract.js';

const createTripCostTemplate = (allTripPointsData) => {
  if (allTripPointsData.length === 0) {
    return ' ';
  }
  let fullTripCost = 0;
  const prettyTripPoints = Array.from(allTripPointsData.values());
  prettyTripPoints.forEach((tripPoint) => {
    fullTripCost = tripPoint.price ? (fullTripCost + Number(tripPoint.price)) : fullTripCost;
    tripPoint.offers.forEach((offer) => fullTripCost += Number(offer.price));
  });
  return `<p class="trip-info__cost">
    Total: &euro;&nbsp;<span class="trip-info__cost-value">${fullTripCost}</span>
  </p>`;
};

// по аналогии с site-menu.js производим "перевод на классы"
export default class TripCostView extends AbstractView {
  constructor(allTripPointsData) {
    super();
    this._allTripPointsData = allTripPointsData;
  }

  getTemplate() {
    return createTripCostTemplate(this._allTripPointsData);
  }
}
