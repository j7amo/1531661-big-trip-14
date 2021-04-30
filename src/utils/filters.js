// вынесем функции фильтрации в отдельный утилитарный модуль
import { FilterType } from '../const.js';
import dayjs from 'dayjs';

const filter = {
  [FilterType.EVERYTHING]: (tripPoints) => tripPoints,
  [FilterType.FUTURE]: (tripPoints) => tripPoints.filter((tripPoint) => dayjs().diff(dayjs(tripPoint.endDate)) > 0
    || ((dayjs().diff(dayjs(tripPoint.beginDate)) > 0) && (dayjs().diff(dayjs(tripPoint.endDate)) < 0))),
  [FilterType.PAST]: (tripPoints) => tripPoints.filter((tripPoint) => dayjs().diff(dayjs(tripPoint.beginDate)) <= 0
    || ((dayjs().diff(dayjs(tripPoint.beginDate)) > 0) && (dayjs().diff(dayjs(tripPoint.endDate)) < 0))),
};

export { filter };
