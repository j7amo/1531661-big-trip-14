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

const getEventTypesMarkup = (eventTypeToOffersMap, destinationsMap, currentTripPoint) => {
  let destinationOptionsMarkup = '';
  let eventTypeItemsMarkup = '';

  Array.from(eventTypeToOffersMap.keys()).forEach((type) => {
    let eventTypesTemplate = '';
    if (type === currentTripPoint.type) {
      eventTypesTemplate = `<div class="event__type-item">
      <input id="event-type-${type}-1" class="event__type-input  visually-hidden" type="radio" name="event-type" value="${type}" checked>
      <label class="event__type-label  event__type-label--${type}" for="event-type-${type}-1">${type}</label>
      </div>`;
    } else {
      eventTypesTemplate = `<div class="event__type-item">
      <input id="event-type-${type}-1" class="event__type-input  visually-hidden" type="radio" name="event-type" value="${type}">
      <label class="event__type-label  event__type-label--${type}" for="event-type-${type}-1">${type}</label>
      </div>`;
    }
    eventTypeItemsMarkup += eventTypesTemplate;
  });

  Array.from(destinationsMap.keys()).forEach((destination) => {
    const destinationsTemplate = `<option value="${destination}"></option>`;
    destinationOptionsMarkup += destinationsTemplate;
  });

  return {
    destinationOptionsMarkup,
    eventTypeItemsMarkup,
  };
};

const getAvailableOffersMarkup = (eventTypeToOffersMap, currentTripPoint) => {
  const {
    type: currentType,
  } = currentTripPoint;

  let availableOffersOptionsMarkup = '';
  const availableOffers = eventTypeToOffersMap.get(currentType).offers;
  for (let i = 0; i < availableOffers.length; i++) {
    const randomId = getRandomInt(0, Number.MAX_VALUE);
    const offerTemplate = `<div class="event__offer-selector">
      <input class="event__offer-checkbox  visually-hidden" id="event-offer-${randomId}-1" type="checkbox" name="event-offer-${currentType}">
      <label class="event__offer-label" for="event-offer-${randomId}-1">
        <span class="event__offer-title">${availableOffers[i].title}</span>
        &plus;&euro;&nbsp;
        <span class="event__offer-price">${availableOffers[i].price}</span>
      </label>
    </div>`;

    availableOffersOptionsMarkup += offerTemplate;
  }

  return availableOffersOptionsMarkup;
};

const createTripPointListElement = (internalElementMarkup) => {
  return `<li class="trip-events__item">${internalElementMarkup}</li>`;
};

export { getRandomInt, getRandomElement, getFixedLengthArrayOfRandomElements, getEventTypesMarkup, getAvailableOffersMarkup, createTripPointListElement };
