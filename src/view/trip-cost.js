const createTripCostView = (allTripPointsData) => {
  let fullTripCost = 0;
  allTripPointsData.forEach((tripPoint) => fullTripCost += tripPoint.price);
  return `<p class="trip-info__cost">
    Total: &euro;&nbsp;<span class="trip-info__cost-value">${fullTripCost}</span>
  </p>`;
};

export { createTripCostView };
