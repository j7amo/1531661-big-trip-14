import dayjs from 'dayjs';
import { FilterType } from '../const.js';
import AbstractView from './abstract.js';

const createFiltersTemplate = (activeFilter, tripPoints) => {
  const currentDate = dayjs();
  const hasPastTripPoints = tripPoints.some((tripPoint) => dayjs(tripPoint.endDate).diff(currentDate) < 0);
  const hasFutureTripPoints = tripPoints.some((tripPoint) => dayjs(tripPoint.beginDate).diff(currentDate) > 0);

  return `<form class="trip-filters" action="#" method="get">
    <div class="trip-filters__filter">
      <input id="filter-everything" class="trip-filters__filter-input  visually-hidden" type="radio" name="trip-filter" value="everything" ${activeFilter === FilterType.EVERYTHING ? 'checked' : ''}>
      <label class="trip-filters__filter-label" for="filter-everything">Everything</label>
    </div>

    <div class="trip-filters__filter">
      <input id="filter-future" class="trip-filters__filter-input  visually-hidden" type="radio" name="trip-filter" value="future" ${activeFilter === FilterType.FUTURE ? 'checked' : ''} ${hasFutureTripPoints ? '' : 'disabled'}>
      <label class="trip-filters__filter-label" for="filter-future">Future</label>
    </div>

    <div class="trip-filters__filter">
      <input id="filter-past" class="trip-filters__filter-input  visually-hidden" type="radio" name="trip-filter" value="past" ${activeFilter === FilterType.PAST ? 'checked' : ''} ${hasPastTripPoints ? '' : 'disabled'}>
      <label class="trip-filters__filter-label" for="filter-past">Past</label>
    </div>

    <button class="visually-hidden" type="submit">Accept filter</button>
  </form>`;
};

export default class FiltersView extends AbstractView {
  constructor(activeFilter, tripPoints) {
    super();
    this._activeFilter = activeFilter;
    this._tripPoints = tripPoints;

    this._activeFilterChangeHandler = this._activeFilterChangeHandler.bind(this);
  }

  getTemplate() {
    return createFiltersTemplate(this._activeFilter, this._tripPoints);
  }

  setActiveFilterChangeHandler(callback) {
    this._callback.activeFilterChange =  callback;
    this.getElement().addEventListener('change', this._activeFilterChangeHandler);
  }

  _activeFilterChangeHandler(evt) {
    evt.preventDefault();
    this._callback.activeFilterChange(evt.target.value);
  }
}
