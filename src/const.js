const SortType = {
  DEFAULT: 'sort-by-date-up',
  SORT_BY_TIME_DOWN: 'sort-by-time-down',
  SORT_BY_PRICE_DOWN: 'sort-by-price-down',
};

const UserAction = {
  UPDATE_TRIP_POINT: 'UPDATE_TRIP_POINT',
  ADD_TRIP_POINT: 'ADD_TRIP_POINT',
  DELETE_TRIP_POINT: 'DELETE_TRIP_POINT',
};

const UpdateType = {
  PATCH: 'PATCH',
  MINOR: 'MINOR',
  MAJOR: 'MAJOR',
  INIT: 'INIT',
};

const FilterType = {
  EVERYTHING: 'everything',
  FUTURE: 'future',
  PAST: 'past',
};

const MenuType = {
  TABLE: 'table',
  STATS: 'stats',
};

export { SortType, UserAction, UpdateType, FilterType, MenuType };
