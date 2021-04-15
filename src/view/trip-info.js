import dayjs from 'dayjs';
import AbstractView from './abstract.js';

const getEndDateCorrectViewFormat = (beginDate, sortedTripPoints) => {
  return dayjs(beginDate).month() === dayjs(sortedTripPoints[sortedTripPoints.length - 1].endDate).month()
    ? dayjs(sortedTripPoints[sortedTripPoints.length - 1].endDate).format('DD')
    : dayjs(sortedTripPoints[sortedTripPoints.length - 1].endDate).format('MMM DD');
};

const createTripInfoTemplate = (allTripPointsData = '') => {
  if (allTripPointsData === '') {
    return;
  }

  const prettyTripPoints = Array.from(allTripPointsData.values());
  const sortedTripPoints = prettyTripPoints.sort((firstPoint, secondPoint) => dayjs(firstPoint.beginDate).diff(dayjs(secondPoint.beginDate)));
  const departureTo = sortedTripPoints[0].destination.name;
  const middleTripPoint = sortedTripPoints[Math.floor(sortedTripPoints.length / 2)].destination.name;
  const arrivalFrom = sortedTripPoints[sortedTripPoints.length - 1].destination.name;
  const beginDate = dayjs(sortedTripPoints[0].beginDate).format('MMM DD');

  if (sortedTripPoints.length === 1) {
    return `<div class="trip-info__main">
    <h1 class="trip-info__title">${departureTo}</h1>
    <p class="trip-info__dates">${beginDate}&nbsp;&mdash;&nbsp;${getEndDateCorrectViewFormat(beginDate, sortedTripPoints)}</p>
  </div>`;
  } else if (sortedTripPoints.length === 2) {
    return `<div class="trip-info__main">
    <h1 class="trip-info__title">${departureTo} &mdash; ${arrivalFrom}</h1>
    <p class="trip-info__dates">${beginDate}&nbsp;&mdash;&nbsp;${getEndDateCorrectViewFormat(beginDate, sortedTripPoints)}</p>
  </div>`;
  } else {
    return `<div class="trip-info__main">
    <h1 class="trip-info__title">${departureTo} &mdash; ${middleTripPoint} &mdash; ${arrivalFrom}</h1>
    <p class="trip-info__dates">${beginDate}&nbsp;&mdash;&nbsp;${getEndDateCorrectViewFormat(beginDate, sortedTripPoints)}</p>
  </div>`;
  }
};

// по аналогии с site-menu.js производим "перевод на классы"
export default class TripInfoView extends AbstractView {
  constructor(allTripPointsData) {
    super();
    this._allTripPointsData = allTripPointsData;
  }

  getTemplate() {
    return createTripInfoTemplate(this._allTripPointsData);
  }
}
