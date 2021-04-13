// заведём перечисление для констант, которые используются при отрисовке с помощью insertAdjacentHTML
const RenderPosition = {
  AFTERBEGIN: 'afterbegin',
  BEFOREEND: 'beforeend',
};

// опишем функцию рендеринга DOM-элемента
// эта функцию впоследствии станет основной функцией для рендеринга элементов на странице в принципе
const renderElement = (container, element, place) => {
  switch (place) {
    case RenderPosition.AFTERBEGIN:
      container.prepend(element);
      break;
    case RenderPosition.BEFOREEND:
      container.append(element);
      break;
  }
};

// перенесём из main.js метод для отрисовки элемента с помощью insertAdjacentHTML и переименуем в renderTemplate,
// так как мы отрисовываем именно шаблон
const renderTemplate = (container, template, place) => {
  container.insertAdjacentHTML(place, template);
};

// напишем функцию для создания DOM-элемента (это уже не просто разметка в виде строки, а именно DOM-объект)
// функция будет получать шаблон (разметку) и оборачивать его, например, в div (данный подход давался на лекциях)
// а в конечном счёте мы будем возвращать наружу ТОЛЬКО САМ элемент БЕЗ div-обёртки - это нужно для того, чтобы избежать
// "лишней" блочности div-а
const createNewElement = (template) => {
  const newElement = document.createElement('div');
  newElement.innerHTML = template;

  return newElement.firstChild;
};

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
    let eventTypesTemplate;
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

const getAvailableOffersMarkup = (eventTypeToOffersMap, currentEventType/*currentTripPoint*/) => {
  // const {
  //   offers: selectedOffers,
  //   type: currentType,
  // } = currentTripPoint;

  let availableOffersOptionsMarkup = '';
  const availableOffers = eventTypeToOffersMap.get(currentEventType).offers;
  for (let i = 0; i < availableOffers.length; i++) {
    const randomId = getRandomInt(0, Number.MAX_VALUE);
    //const checkboxChecked = selectedOffers.includes(availableOffers[i]) ? 'checked' : '';
    const offerTemplate = `<div class="event__offer-selector">
      <input class="event__offer-checkbox  visually-hidden" id="event-offer-${randomId}-1" type="checkbox" name="event-offer-${currentEventType}">
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

const initializeSelectedOffers = (tripPointId, allTripPointsData) => {
  const selectedOffers = allTripPointsData.get(tripPointId).offers;
  const availableOffers = document.querySelectorAll('.event__offer-selector');
  availableOffers.forEach((availableOffer) => {
    const availableOfferCheckbox = availableOffer.querySelector('input');
    const availableOfferTitle = availableOffer.querySelector('.event__offer-title').textContent;
    const availableOfferPrice = availableOffer.querySelector('.event__offer-price').textContent;
    for (let i = 0; i < selectedOffers.length; i++) {
      if (selectedOffers[i].title === availableOfferTitle && selectedOffers[i].price === Number(availableOfferPrice)) {
        availableOfferCheckbox.checked = true;
      }
    }
  });
};

const createTripPointListElement = (internalElementMarkup) => {
  return `<li class="trip-events__item">${internalElementMarkup}</li>`;
};

const removeAllChildNodes = (parentNode) => {
  while (parentNode.firstChild) {
    parentNode.removeChild(parentNode.lastChild);
  }
};

export {
  getRandomInt,
  getRandomElement,
  getFixedLengthArrayOfRandomElements,
  getEventTypesMarkup,
  getAvailableOffersMarkup,
  createTripPointListElement,
  removeAllChildNodes,
  initializeSelectedOffers,
  renderTemplate
};
