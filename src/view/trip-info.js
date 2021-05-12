import dayjs from 'dayjs';
import AbstractView from './abstract.js';

const getEndDateCorrectViewFormat = (beginDate, sortedTripPoints) => {
  if (!beginDate) {
    return ' ';
  } else {
    return dayjs(beginDate).month() === dayjs(sortedTripPoints[sortedTripPoints.length - 1].endDate).month()
      ? dayjs(sortedTripPoints[sortedTripPoints.length - 1].endDate).format('DD')
      : dayjs(sortedTripPoints[sortedTripPoints.length - 1].endDate).format('MMM DD');
  }
};

const createTripInfoTemplate = (allTripPointsData) => {
  if (allTripPointsData.length === 0) {
    return ' ';
  }

  const prettyTripPoints = Array.from(allTripPointsData.values());
  const sortedTripPoints = prettyTripPoints.sort((firstPoint, secondPoint) => dayjs(firstPoint.beginDate).diff(dayjs(secondPoint.beginDate)));
  const departureTo = sortedTripPoints[0].destination ? sortedTripPoints[0].destination.name : '';
  const arrivalFrom = sortedTripPoints[sortedTripPoints.length - 1].destination ? sortedTripPoints[sortedTripPoints.length - 1].destination.name : '';
  const beginDate = sortedTripPoints[0].beginDate ? dayjs(sortedTripPoints[0].beginDate).format('MMM DD') : '';

  if (beginDate === '') {
    return ' ';
  }

  // module9-task2
  // нам нужно модифицировать отображение городов:
  // если кол-во разных городов = 1, то отобразить этот город.
  // если кол-во разных городов = 2, то отобразить их через " - ".
  // если кол-во разных городов = 3, то отобразить их через " - ".
  // если кол-во разных городов > 3, то отобразить их так: Город 1 - ... - Город 2
  const uniqueSortedTripPoints = Array.from(new Set(sortedTripPoints.map((tripPoint) => tripPoint.destination.name)).values());
  if (uniqueSortedTripPoints.length <= 3) {
    return `<div class="trip-info__main">
    <h1 class="trip-info__title">${uniqueSortedTripPoints.join('&nbsp;&mdash;&nbsp;')}</h1>
    <p class="trip-info__dates">${beginDate}&nbsp;&mdash;&nbsp;${getEndDateCorrectViewFormat(beginDate, sortedTripPoints)}</p>
  </div>`;
  } else {
    return `<div class="trip-info__main">
    <h1 class="trip-info__title">${departureTo} &mdash; ${' ... '} &mdash; ${arrivalFrom}</h1>
    <p class="trip-info__dates">${beginDate}&nbsp;&mdash;&nbsp;${getEndDateCorrectViewFormat(beginDate, sortedTripPoints)}</p>
  </div>`;
  }
};

export default class TripInfoView extends AbstractView {
  constructor(allTripPointsData) {
    super();
    this._allTripPointsData = allTripPointsData;
  }

  getTemplate() {
    return createTripInfoTemplate(this._allTripPointsData);
  }
}
