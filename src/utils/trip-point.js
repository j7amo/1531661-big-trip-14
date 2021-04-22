import dayjs from 'dayjs';
// на данном этапе (после 5-го лайва) пока непонятно какие функции/методы нам в итоге будут нужны для личных проектов,
// а какие специфичны только для демо-проекта, поэтому фигачим всё подряд по аналогии с демо-проектом, если что - лишнее уберём

// напишем специальные функции, которые будут рассматривать ОСОБЫЕ случаи, когда хотя бы одно
// из сравниваемых значений === null
// точки маршрута, у которых соответствующие значения НЕ заполнены, будут отправлены в конец списка
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

// теперь непосредственно сами функции сортировки
const sortByDateUp = (tripPointA, tripPointB) => {
  // сначала сделаем проверку на случаи с NULL'ом/ми
  const weight = getWeightForNullDate(tripPointA.beginDate, tripPointB.beginDate);
  // делаем проверку наступления особого случая (когда даты не заполнены), если это такой случай, то рассчитать разницу
  // между двумя датами мы не сможем, но так как функция сортировки по контракту обязана вернуть 0, <0 или >0, то
  // возвращаем вес
  if (weight !== null) {
    return weight;
  }

  // Если даты заполнены,то просто возвращаем разницу между датами (от этого значения будет зависеть сортировка)
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

export {
  sortByDateUp,
  sortByPriceDown,
  sortByTimeDown
};
