import dayjs from 'dayjs';

const MINUTES_IN_DAY = 1440;
const MINUTES_IN_HOUR = 60;
const MAX_NUMBER_WITH_LEADING_ZERO = 9;

const getDurationInMinutes = (tripPoint) => {
  const { beginDate, endDate } = tripPoint;

  return (beginDate && endDate) ? dayjs(endDate).diff(dayjs(beginDate), 'minute') : '';
};

const getDurationFormatted = (durationInMinutes) => {
  let eventDurationFormatted;

  if (durationInMinutes) {
    if (durationInMinutes >= MINUTES_IN_DAY) {
      const fullDays = Math.floor(durationInMinutes / MINUTES_IN_DAY);
      const fullHours = Math.floor((durationInMinutes - fullDays * MINUTES_IN_DAY) / MINUTES_IN_HOUR);
      const fullMinutes = durationInMinutes - fullDays * MINUTES_IN_DAY - fullHours * MINUTES_IN_HOUR;
      const fullDaysFormatted = (fullDays > MAX_NUMBER_WITH_LEADING_ZERO) ? `${fullDays}` : `0${fullDays}`;
      const fullHoursFormatted = (fullHours > MAX_NUMBER_WITH_LEADING_ZERO) ? `${fullHours}` : `0${fullHours}`;
      const fullMinutesFormatted = (fullMinutes > MAX_NUMBER_WITH_LEADING_ZERO) ? `${fullMinutes}` : `0${fullMinutes}`;
      eventDurationFormatted = `${fullDaysFormatted}D ${fullHoursFormatted}H ${fullMinutesFormatted}M`;
    } else if (durationInMinutes < MINUTES_IN_DAY && durationInMinutes >= MINUTES_IN_HOUR) {
      const fullHours = Math.floor(durationInMinutes / MINUTES_IN_HOUR);
      const fullMinutes = durationInMinutes - fullHours * MINUTES_IN_HOUR;
      const fullHoursFormatted = (fullHours > MAX_NUMBER_WITH_LEADING_ZERO) ? `${fullHours}` : `0${fullHours}`;
      const fullMinutesFormatted = (fullMinutes > MAX_NUMBER_WITH_LEADING_ZERO) ? `${fullMinutes}` : `0${fullMinutes}`;
      eventDurationFormatted = `${fullHoursFormatted}H ${fullMinutesFormatted}M`;
    } else {
      const fullMinutes = durationInMinutes;
      const fullMinutesFormatted = (fullMinutes > MAX_NUMBER_WITH_LEADING_ZERO) ? `${fullMinutes}` : `0${fullMinutes}`;
      eventDurationFormatted = `${fullMinutesFormatted}M`;
    }
  }

  return eventDurationFormatted;
};

export { getDurationInMinutes, getDurationFormatted };
