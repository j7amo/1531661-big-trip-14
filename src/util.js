const isPositiveNumber = (number) => !isNaN(number) && number >= 0;

const getRandomInt = (rangeStart = 0, rangeEnd = 0) => {
  if (!isPositiveNumber(rangeStart) || !isPositiveNumber(rangeEnd)) {
    return 0;
  }

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

export { getRandomInt, getRandomElement, getFixedLengthArrayOfRandomElements };
