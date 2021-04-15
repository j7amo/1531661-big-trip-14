import dayjs from 'dayjs';
import TripInfoView from './view/trip-info.js';
import TripCostView from './view/trip-cost.js';
import SiteMenuView from './view/site-menu';
import FiltersView from './view/filters.js';
import SortView from './view/sort.js';
import TripPointsListView from './view/trip-points-list.js';
//import NoTripPointsView from './view/no-trip-points.js';
import TripPointEditFormView from './view/trip-point-edit.js';
//import TripPointAddFormView from './view/trip-point-add.js';
import { generateDestinations, generateOffers, generateTripPoints } from './mock/trip-point-mock.js';
import TripPointView from './view/trip-point.js';
import {
  //getAvailableOffersMarkup,
  //removeAllChildNodes,
  //initializeSelectedOffers,
  renderElement,
  RenderPosition
} from './utils/render.js';

const EVENT_COUNT = 10;

const tripMainElement = document.querySelector('.trip-main');
const tripInfoElement = tripMainElement.querySelector('.trip-info');
const tripControlsNavigationElement = tripMainElement.querySelector('.trip-controls__navigation');
const tripFiltersElement = tripMainElement.querySelector('.trip-controls__filters');
const tripEventsElement = document.querySelector('.trip-events');

//генерим моки
const destinations = generateDestinations();
const eventTypeToOffersMap = generateOffers();
const tripPointsMocks = generateTripPoints(EVENT_COUNT, destinations, eventTypeToOffersMap);

renderElement(tripInfoElement, new TripInfoView(tripPointsMocks).getElement(), RenderPosition.BEFOREEND);
renderElement(tripInfoElement, new TripCostView(tripPointsMocks).getElement(), RenderPosition.BEFOREEND);
renderElement(tripControlsNavigationElement, new SiteMenuView().getElement(), RenderPosition.BEFOREEND);
renderElement(tripFiltersElement, new FiltersView().getElement(), RenderPosition.BEFOREEND);
renderElement(tripEventsElement, new SortView().getElement(), RenderPosition.BEFOREEND);
renderElement(tripEventsElement, new TripPointsListView().getElement(), RenderPosition.BEFOREEND);

const tripEventsList = tripEventsElement.querySelector('.trip-events__list');

// напишем функцию (по аналогии с демонстрационным проектом), которая будет рендерить точку маршрута (по аналогии
// с рендерингом задачи из списка задач)
// здесь мы сразу создадим 2 представления точки маршрута:
// - обычная карточка
// - форма редактирования
// Напишем внутренние функции по смене одного представления на другое, Повесим нужные обработчики (вот тут не совсем понял,
// каким образом локальная константа tripPointEditForm осталась доступной после завершения работы функции renderTripPoint,
// единственное предположение - замыкание)
const renderTripPoint = (tripPointsList, id, tripPoint) => {
  const tripPointCard = new TripPointView(id, tripPoint);
  const tripPointEditForm = new TripPointEditFormView(tripPoint, eventTypeToOffersMap, destinations);

  const switchFromCardToForm = () => {
    tripPointsList.replaceChild(tripPointEditForm.getElement(), tripPointCard.getElement());
  };

  const switchFromFormToCard = () => {
    tripPointsList.replaceChild(tripPointCard.getElement(), tripPointEditForm.getElement());
  };

  // подпишемся на нажатие Escape, когда пункт маршрута в представлении формы редактирования
  const onEscKeyDown = (evt) => {
    if (evt.key === 'Esc' || evt.key === 'Escape') {
      evt.preventDefault();
      switchFromFormToCard();
      document.addEventListener('keydown', onEscKeyDown);
    }
  };

  // подпишемся на click треугольной кнопки, когда пункт маршрута в обычном представлении
  tripPointCard.setEditClickHandler(() => {
    switchFromCardToForm();
    document.addEventListener('keydown', onEscKeyDown);
  });

  // подпишемся на click треугольной кнопки, когда пункт маршрута в представлении формы редактирования
  tripPointEditForm.setEditClickHandler(() => {
    switchFromFormToCard();
    document.removeEventListener('keydown', onEscKeyDown);
  });

  // подпишемся на событие submit, когда пункт маршрута в представлении формы редактирования
  tripPointEditForm.setFormSubmitHandler(() => {
    switchFromFormToCard();
    document.removeEventListener('keydown', onEscKeyDown);
  });

  renderElement(tripPointsList, tripPointCard.getElement(), RenderPosition.BEFOREEND);
};

// рендерим моки
const prettyMocks = Array.from(tripPointsMocks.entries()).sort(([,firstTripPoint], [,secondTripPoint]) => dayjs(firstTripPoint.beginDate).diff(dayjs(secondTripPoint.beginDate)));
prettyMocks.forEach(([id, tripPoint]) => renderTripPoint(tripEventsList, id, tripPoint));

// рендерим заглушку для проверки
//renderElement(tripEventsList, new NoTripPointsView().getElement(), RenderPosition.BEFOREEND);

/*// свяжем взаимодействие чекбоксов-опций с общей стоимостью поездки
const setSelectedOffersToTripPriceDependency = () => {
  const availableOffers = document.querySelectorAll('.event__offer-selector');
  const tripPrice = document.querySelector('.event__input--price');
  availableOffers.forEach((availableOffer) => {
    const availableOfferCheckbox = availableOffer.querySelector('input');
    const availableOfferPrice = availableOffer.querySelector('.event__offer-price').textContent;
    availableOfferCheckbox.addEventListener('change', () => {
      if (availableOfferCheckbox.checked) {
        tripPrice.value = Number(tripPrice.value) + Number(availableOfferPrice);
      } else {
        tripPrice.value = Number(tripPrice.value) - Number(availableOfferPrice);
      }
    });
  });
};*/

/*// оживим кнопки открытия / скрытия формы редактирования события
// в основе моей идеи следующее: отследить в каком контейнере произошло событие, найти скрытый <span> с id точки поездки,
// а дальше использовать этот id для передачи нужных данных в функции рендеринга
const initializeRollUpButton = (rollUpButton) => {
  rollUpButton.addEventListener('click', (evt) => {
    const eventContainer = evt.target.parentNode;
    if (eventContainer.nodeName.toLowerCase() === 'div') {
      const alreadyOpenedForm = document.querySelector('form[class="event event--edit"]');
      if (alreadyOpenedForm) {
        const eventId = Number(alreadyOpenedForm.querySelector('.event__edit-id').textContent);
        const eventListElementContainer = alreadyOpenedForm.parentNode;
        eventListElementContainer.removeChild(alreadyOpenedForm);
        renderElement(eventListElementContainer, new TripPointView(eventId, tripPointsMocks.get(eventId)).getElement(), RenderPosition.BEFOREEND);
        initializeRollUpButton(eventListElementContainer.querySelector('.event__rollup-btn'));
      }
      const eventId = Number(eventContainer.querySelector('.event__id').textContent);
      const eventListElementContainer = eventContainer.parentNode;
      eventListElementContainer.removeChild(eventContainer);
      renderElement(eventListElementContainer, new TripPointEditFormView(tripPointsMocks.get(eventId), eventTypeToOffersMap, destinations).getElement(), RenderPosition.BEFOREEND);
      initializeSelectedOffers(eventId, tripPointsMocks);
      //setSelectedOffersToTripPriceDependency();
      initializeEventTypePicker(eventId);
      initializeRollUpButton(eventListElementContainer.querySelector('.event__rollup-btn'));
    } else if (eventContainer.nodeName.toLowerCase() === 'header') {
      const eventEditionFormContainer = eventContainer.parentNode;
      const eventId = Number(eventEditionFormContainer.querySelector('.event__edit-id').textContent);
      const eventListElementContainer = eventEditionFormContainer.parentNode;
      eventListElementContainer.removeChild(eventEditionFormContainer);
      renderElement(eventListElementContainer, new TripPointView(eventId, tripPointsMocks.get(eventId)), RenderPosition.BEFOREEND);
      initializeRollUpButton(eventListElementContainer.querySelector('.event__rollup-btn'));
    }
  });
};*/

/*const initializeRollUpButtons = () => {
  const eventRollUpButtons = document.querySelectorAll('.event__rollup-btn');
  eventRollUpButtons.forEach((button) => {
    initializeRollUpButton(button);
  });
};*/


//setSelectedOffersToTripPriceDependency();
//initializeSelectedOffers(prettyMocks[0][1].id, tripPointsMocks);
// for (let i = 1; i < prettyMocks.length; i++) {
//   const [id, tripPointData] = prettyMocks[i];
//   renderElement(tripEventsList, new TripPointView(id, tripPointData).getElement(), RenderPosition.BEFOREEND);
// }
//initializeRollUpButtons();

/*// оживим выбор типа события
const initializeEventTypePicker = (eventIdToEdit) => {
  const eventTypeLabelElement = document.querySelector('label[for = "event-destination-1"]');
  const eventsTypePicker = document.querySelector('.event__type-group');
  const availableOffersContainer = document.querySelector('.event__available-offers');

  eventsTypePicker.addEventListener('change', (evt) => {
    eventTypeLabelElement.textContent = evt.target.value;
    const currentEvent = eventTypeToOffersMap.get(evt.target.value);
    availableOffersContainer.innerHTML = getAvailableOffersMarkup(eventTypeToOffersMap, currentEvent.type);
    initializeSelectedOffers(eventIdToEdit, tripPointsMocks);
    //setSelectedOffersToTripPriceDependency();
  });
};*/

/*// вынесем в отдельную функцию повторный рендеринг событий
const rerenderEventsList = (tripPointsToRender) => {
  removeAllChildNodes(tripEventsList);
  if (tripPointsToRender.length > 0) {
    renderElement(tripEventsList, new TripPointEditFormView(tripPointsToRender[0][1], eventTypeToOffersMap, destinations).getElement(), RenderPosition.BEFOREEND);
    initializeSelectedOffers(tripPointsToRender[0][1].id, tripPointsMocks);
    //setSelectedOffersToTripPriceDependency();
    initializeEventTypePicker(tripPointsToRender[0][1].id);
  }
  for (let i = 1; i < tripPointsToRender.length; i++) {
    const [id, tripPointData] = tripPointsToRender[i];
    renderElement(tripEventsList, new TripPointView(id, tripPointData).getElement(), RenderPosition.BEFOREEND);
  }
  //initializeRollUpButtons();
};*/

// initializeEventTypePicker(prettyMocks[0][1].id);

/*// оживим фильтры (пока в main.js)
const tripFilters = document.querySelectorAll('.trip-filters input');
tripFilters.forEach((filter) => {
  filter.addEventListener('change', (evt) => {
    const buttonSelected = evt.target;
    let filteredTripPoints;
    if (buttonSelected.value === 'everything') {
      rerenderEventsList(prettyMocks);
      return;
    } else if (buttonSelected.value === 'past') {
      filteredTripPoints = prettyMocks.filter(([,tripPoint]) => dayjs().diff(dayjs(tripPoint.endDate)) > 0
        || (dayjs().diff(dayjs(tripPoint.beginDate)) > 0) && (dayjs().diff(dayjs(tripPoint.endDate)) < 0));
    } else if (buttonSelected.value === 'future') {
      filteredTripPoints = prettyMocks.filter(([,tripPoint]) => dayjs().diff(dayjs(tripPoint.beginDate)) <= 0
        || (dayjs().diff(dayjs(tripPoint.beginDate)) > 0) && (dayjs().diff(dayjs(tripPoint.endDate)) < 0));
    }

    rerenderEventsList(filteredTripPoints);
    initializeEventTypePicker(filteredTripPoints[0][1].id);
  });
});*/

/*// оживим сортировку (пока в main.js)
const tripSortByDayControl = document.querySelector('.trip-sort__item--day input');
const tripSortByPriceControl = document.querySelector('.trip-sort__item--price input');
const tripSortByDurationControl = document.querySelector('.trip-sort__item--time input');

tripSortByDayControl.addEventListener('change', () => {
  const sortedTripPoints = prettyMocks.sort(([,firstTripPoint], [,secondTripPoint]) => dayjs(firstTripPoint.beginDate).diff(dayjs(secondTripPoint.beginDate)));
  rerenderEventsList(sortedTripPoints);
  initializeEventTypePicker(sortedTripPoints[0][1]);
});

tripSortByPriceControl.addEventListener('change', () => {
  const sortedTripPoints = prettyMocks.sort(([,firstTripPoint], [,secondTripPoint]) => secondTripPoint.price - firstTripPoint.price);
  rerenderEventsList(sortedTripPoints);
  initializeEventTypePicker(sortedTripPoints[0][1]);
});

tripSortByDurationControl.addEventListener('change', () => {
  const sortedTripPoints = prettyMocks.sort(([,firstTripPoint], [,secondTripPoint]) => dayjs(firstTripPoint.beginDate).diff(dayjs(firstTripPoint.endDate)) - dayjs(secondTripPoint.beginDate).diff(dayjs(secondTripPoint.endDate)));
  rerenderEventsList(sortedTripPoints);
  initializeEventTypePicker(sortedTripPoints[0][1]);
});*/

// // оживим кнопку добавления новой точки маршрута
// const newEventButton = document.querySelector('.trip-main__event-add-btn');
// newEventButton.addEventListener('click', () => {
//   createTripPointCreationFormTemplate();
// });
