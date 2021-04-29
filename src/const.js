const SortType = {
  DEFAULT: 'sort-by-date-up',
  SORT_BY_TIME_DOWN: 'sort-by-time-down',
  SORT_BY_PRICE_DOWN: 'sort-by-price-down',
};

// добавим перечисление для действий пользователя
const UserAction = {
  UPDATE_TRIP_POINT: 'UPDATE_TRIP_POINT',
  ADD_TRIP_POINT: 'ADD_TRIP_POINT',
  DELETE_TRIP_POINT: 'DELETE_TRIP_POINT',
};

// добавим перечисление для типа обновления данных
const UpdateType = {
  PATCH: 'PATCH',
  MINOR: 'MINOR',
  MAJOR: 'MAJOR',
};

export { SortType, UserAction, UpdateType };
