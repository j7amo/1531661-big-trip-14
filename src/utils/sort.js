import dayjs from 'dayjs';
import { SortType } from '../const.js';

const getWeightForNullDate = (dateA, dateB) => {
  if (dateA === null && dateB === null) {
    return 0;
  }

  if (dateA === null) {
    return 1;
  }

  if (dateB === null) {
    return -1;
  }

  return null;
};

const getWeightForNullPrice = (priceA, priceB) => {
  if (priceA === null && priceB === null) {
    return 0;
  }

  if (priceA === null) {
    return 1;
  }

  if (priceB === null) {
    return -1;
  }

  return null;
};

const getWeightForNullTime = (beginTimeA, endTimeA, beginTimeB, endTimeB) => {
  if ((beginTimeA === null || endTimeA === null) && (beginTimeB === null || endTimeB === null)) {
    return 0;
  }

  if (beginTimeA === null || endTimeA === null) {
    return 1;
  }

  if (beginTimeB === null || endTimeB === null) {
    return -1;
  }

  return null;
};

const sortByDateUp = (tripPointA, tripPointB) => {
  const weight = getWeightForNullDate(tripPointA.beginDate, tripPointB.beginDate);

  if (weight !== null) {
    return weight;
  }

  return dayjs(tripPointA.beginDate).diff(dayjs(tripPointB.beginDate));
};

const sortByPriceDown = (tripPointA, tripPointB) => {
  const weight = getWeightForNullPrice(tripPointA.price, tripPointB.price);

  if (weight !== null) {
    return weight;
  }

  return tripPointB.price - tripPointA.price;
};

const sortByTimeDown = (tripPointA, tripPointB) => {
  const weight = getWeightForNullTime(tripPointA.beginDate, tripPointA.endDate, tripPointB.beginDate, tripPointB.endDate);

  if (weight !== null) {
    return weight;
  }

  return dayjs(tripPointA.beginDate).diff(dayjs(tripPointA.endDate)) - dayjs(tripPointB.beginDate).diff(dayjs(tripPointB.endDate));
};

const sort = {
  [SortType.DEFAULT]: sortByDateUp,
  [SortType.SORT_BY_TIME_DOWN]: sortByTimeDown,
  [SortType.SORT_BY_PRICE_DOWN]: sortByPriceDown,
};

export { sort };
