// "общие" функции
const getRandomInt = (rangeStart = 0, rangeEnd = 1) => {

  if (rangeEnd <= rangeStart) {
    return rangeStart;
  }

  return Number(rangeStart) + Math.round(Math.random() * (rangeEnd - rangeStart));
};

const getRandomElement = (array) => {
  return array[getRandomInt(0, array.length - 1)];
};

const getFixedLengthArrayOfRandomElements = (array, elementsNumber) => {
  const randomElements = [];

  while(randomElements.length < elementsNumber) {
    const randomElement = getRandomElement(array);

    if (!randomElements.includes(randomElement)) {
      randomElements.push(randomElement);
    }
  }
  return randomElements;
};

// // добавим функцию, которая будет обновлять массив:
// // найдёт в массиве нужный элемент (по id) и заменит его на более свежую версию
// const updateItem = (items, update) => {
//   const index = items.findIndex((item) => item.id === update.id);
//
//   if (index === -1) {
//     return items;
//   }
//
//   return [
//     ...items.slice(0, index),
//     update,
//     ...items.slice(index + 1),
//   ];
// };

export {
  getRandomInt,
  getRandomElement,
  getFixedLengthArrayOfRandomElements
};
