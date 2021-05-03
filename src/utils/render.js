// функции, связанные с рендерингом
import Abstract from '../view/abstract.js';
// заведём перечисление для констант, которые используются при отрисовке с помощью insertAdjacentHTML
const RenderPosition = {
  AFTERBEGIN: 'afterbegin',
  BEFOREEND: 'beforeend',
};

// изменим функцию renderElement
// Основные нововведения:
// 1) теперь называется render
// 2) теперь ей всё равно, что придёт в качестве аргументов: DOM-элементы или экземпляры класса-представления (речь
// конечно же о первых двух аргументах)
const render = (container, child, place) => {
  if (container instanceof Abstract) {
    container = container.getElement();
  }

  if (child instanceof Abstract) {
    child = child.getElement();
  }

  switch (place) {
    case RenderPosition.AFTERBEGIN:
      container.prepend(child);
      break;
    case RenderPosition.BEFOREEND:
      container.append(child);
      break;
  }
};

// по аналогии (частичной) с методом render заведём метод replace, который будет обёрткой надо встроенным в ЖабаСкрипт
// методом replaceChild. Делаем мы это за тем, чтобы:
// 1) точка входа (main.js) стала ещё чище и кода в ней стало ещё меньше.
// 2) мы могли бы опять же использовать метод как с DOM-элементами, так и с экземплярами класса-представления
// Примечание: сохраним порядок аргументов метода-обёртки (декоратора) таким же как и у оригинального системного метода,
// чтобы потребители данного кода, знакомые с оригинальным методом, не путались в порядке передачи аргументов
const replace = (newChild, oldChild) => {
  if (newChild instanceof Abstract) {
    newChild = newChild.getElement();
  }

  if (oldChild instanceof Abstract) {
    oldChild = oldChild.getElement();
  }

  const parent = oldChild.parentElement;

  if (parent === null || newChild === null) {
    throw new Error('Can\'t replace nonexistent elements');
  }

  parent.replaceChild(newChild, oldChild);
};

// также заведём метод remove, который будет полностью (и DOM-элемент, и связанный с ним экземпляр класса) удалять компоненты
const remove = (component) => {
  // сделаем проверку на случай, если попытаемся удалить компонент, который null
  if (component === null) {
    return;
  }

  if (!(component instanceof Abstract)) {
    throw new Error('Can only remove components!');
  }
  // здесь возникает путаница с неймингом: со стороны может показаться, что мы рекурсивно вызываем только что объявленный
  // метод remove, но интерпретатор понимает, что мы вызываем метод на узле (node) и определяет,
  // что речь идёт о встроенном методе
  component.getElement().remove();
  component.removeElement();
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

const removeAllChildNodes = (parentNode) => {
  while (parentNode.firstChild) {
    parentNode.removeChild(parentNode.lastChild);
  }
};

// const getEventTypesPickerMarkup = (eventTypeToOffersMap, currentTripPoint) => {
//   let eventTypeItemsMarkup = '';
//
//   Array.from(eventTypeToOffersMap.keys()).forEach((type) => {
//     let eventTypesTemplate;
//     if (type === currentTripPoint.type) {
//       eventTypesTemplate = `<div class="event__type-item">
//       <input id="event-type-${type}-1" class="event__type-input  visually-hidden" type="radio" name="event-type" value="${type}" checked>
//       <label class="event__type-label  event__type-label--${type}" for="event-type-${type}-1">${type}</label>
//       </div>`;
//     } else {
//       eventTypesTemplate = `<div class="event__type-item">
//       <input id="event-type-${type}-1" class="event__type-input  visually-hidden" type="radio" name="event-type" value="${type}">
//       <label class="event__type-label  event__type-label--${type}" for="event-type-${type}-1">${type}</label>
//       </div>`;
//     }
//     eventTypeItemsMarkup += eventTypesTemplate;
//   });
//
//   return eventTypeItemsMarkup;
// };

// const getDestinationOptionsMarkup = (destinationsMap) => {
//   let destinationOptionsMarkup = '';
//
//   Array.from(destinationsMap.keys()).forEach((destination) => {
//     const destinationsTemplate = `<option value="${destination}"></option>`;
//     destinationOptionsMarkup += destinationsTemplate;
//   });
//
//   return destinationOptionsMarkup;
// };

// const getAvailableOffersMarkup = (eventTypeToOffersMap, currentEventType/*currentTripPoint*/) => {
//   // const {
//   //   offers: selectedOffers,
//   //   type: currentType,
//   // } = currentTripPoint;
//
//   let availableOffersOptionsMarkup = '';
//   const availableOffers = eventTypeToOffersMap.get(currentEventType).offers;
//   for (let i = 0; i < availableOffers.length; i++) {
//     const randomId = nanoid();
//     //const checkboxChecked = selectedOffers.includes(availableOffers[i]) ? 'checked' : '';
//     const offerTemplate = `<div class="event__offer-selector">
//       <input class="event__offer-checkbox  visually-hidden" id="event-offer-${randomId}-1" type="checkbox" name="event-offer-${currentEventType}">
//       <label class="event__offer-label" for="event-offer-${randomId}-1">
//         <span class="event__offer-title">${availableOffers[i].title}</span>
//         &plus;&euro;&nbsp;
//         <span class="event__offer-price">${availableOffers[i].price}</span>
//       </label>
//     </div>`;
//
//     availableOffersOptionsMarkup += offerTemplate;
//   }
//
//   return availableOffersOptionsMarkup;
// };

// const initializeSelectedOffers = (tripPointId, allTripPointsData) => {
//   const selectedOffers = allTripPointsData.get(tripPointId).offers;
//   const availableOffers = document.querySelectorAll('.event__offer-selector');
//   availableOffers.forEach((availableOffer) => {
//     const availableOfferCheckbox = availableOffer.querySelector('input');
//     const availableOfferTitle = availableOffer.querySelector('.event__offer-title').textContent;
//     const availableOfferPrice = availableOffer.querySelector('.event__offer-price').textContent;
//     for (let i = 0; i < selectedOffers.length; i++) {
//       if (selectedOffers[i].title === availableOfferTitle && selectedOffers[i].price === Number(availableOfferPrice)) {
//         availableOfferCheckbox.checked = true;
//       }
//     }
//   });
// };

export {
  removeAllChildNodes,
  createNewElement,
  render,
  replace,
  remove,
  RenderPosition
};
