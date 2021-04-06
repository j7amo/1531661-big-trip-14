import dayjs from 'dayjs';

const createTripInfoView = (allTripPointsData) => {
  const sortedTripPoints = allTripPointsData.slice().sort((firstPoint, secondPoint) => dayjs(firstPoint.beginDate).diff(dayjs(secondPoint.beginDate)));
  const departureTo = sortedTripPoints[0].destination.name;
  const middleTripPoint = sortedTripPoints[Math.floor(sortedTripPoints.length / 2)].destination.name;
  const arrivalFrom = sortedTripPoints[sortedTripPoints.length - 1].destination.name;
  const beginDate = dayjs(sortedTripPoints[0].beginDate).format('MMM DD');
  const endDate = dayjs(beginDate).month() === dayjs(sortedTripPoints[sortedTripPoints.length - 1].endDate).month()
    ? dayjs(sortedTripPoints[sortedTripPoints.length - 1].endDate).format('DD')
    : dayjs(sortedTripPoints[sortedTripPoints.length - 1].endDate).format('MMM DD');
  return `<div class="trip-info__main">
    <h1 class="trip-info__title">${departureTo} &mdash; ${middleTripPoint} &mdash; ${arrivalFrom}</h1>
    <p class="trip-info__dates">${beginDate}&nbsp;&mdash;&nbsp;${endDate}</p>
  </div>`;
};

export { createTripInfoView };
