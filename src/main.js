import { createTripInfoView } from './view/trip-info.js';
import { createTripCostView } from './view/trip-cost.js';
import { createSiteMenuView } from './view/site-menu';
import { createFiltersView } from './view/filters.js';
import { createSortView } from './view/sort.js';
import { createTripPointsListView } from './view/trip-points-list.js';
import { createTripPointEditView } from './view/trip-point-edit.js';
import { generateDestinations, generateOffers, generateTripPoints } from './mock/trip-point-mock.js';
import { createTripPointView } from './view/trip-point.js';
import { getAvailableOffersMarkup, createTripPointListElement, removeAllChildNodes } from './util.js';
import dayjs from 'dayjs';

const render = (container, template, place) => {
  container.insertAdjacentHTML(place, template);
};

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

render(tripInfoElement, createTripInfoView(tripPointsMocks), 'beforeend');
render(tripInfoElement, createTripCostView(tripPointsMocks), 'beforeend');
render(tripControlsNavigationElement, createSiteMenuView(), 'beforeend');
render(tripFiltersElement, createFiltersView(), 'beforeend');
render(tripEventsElement, createSortView(), 'beforeend');
render(tripEventsElement, createTripPointsListView(), 'beforeend');

const tripEventsList = tripEventsElement.querySelector('.trip-events__list');


// рендерим моки
const prettyMocks = Array.from(tripPointsMocks.entries()).sort(([,firstTripPoint], [,secondTripPoint]) => dayjs(firstTripPoint.beginDate).diff(dayjs(secondTripPoint.beginDate)));
render(tripEventsList, createTripPointListElement(createTripPointEditView(prettyMocks[0][1], eventTypeToOffersMap, destinations)), 'beforeend');
for (let i = 1; i < prettyMocks.length; i++) {
  const [id, tripPointData] = prettyMocks[i];
  render(tripEventsList, createTripPointListElement(createTripPointView(id, tripPointData)), 'beforeend');
}

const eventTypeLabelElement = document.querySelector('label[for = "event-destination-1"]');
const eventsTypePicker = document.querySelector('.event__type-group');
const availableOffersContainer = document.querySelector('.event__available-offers');

eventsTypePicker.addEventListener('change', (evt) => {
  eventTypeLabelElement.textContent = evt.target.value;
  const currentEvent = eventTypeToOffersMap.get(evt.target.value);
  availableOffersContainer.innerHTML = getAvailableOffersMarkup(eventTypeToOffersMap, currentEvent);
});

const rerenderEventsList = (tripPointsToRender) => {
  removeAllChildNodes(tripEventsList);
  if (tripPointsToRender.length > 0) {
    render(tripEventsList, createTripPointListElement(createTripPointEditView(tripPointsToRender[0][1], eventTypeToOffersMap, destinations)), 'beforeend');
  }
  for (let i = 1; i < tripPointsToRender.length; i++) {
    const [id, tripPointData] = tripPointsToRender[i];
    render(tripEventsList, createTripPointListElement(createTripPointView(id, tripPointData)), 'beforeend');
  }
};

// оживим фильтры (пока в main.js)
const tripFilters = document.querySelectorAll('.trip-filters input');
tripFilters.forEach((filter) => {
  filter.addEventListener('change', (evt) => {
    const buttonSelected = evt.target;
    let filteredTripPoints;
    if (buttonSelected.value === 'everything') {
      removeAllChildNodes(tripEventsList);
      render(tripEventsList, createTripPointListElement(createTripPointEditView(Array.from(tripPointsMocks.values())[0], eventTypeToOffersMap, destinations)), 'beforeend');
      for (let i = 1; i < prettyMocks.length; i++) {
        const [id, tripPointData] = prettyMocks[i];
        render(tripEventsList, createTripPointListElement(createTripPointView(id, tripPointData)), 'beforeend');
      }
      return;
    } else if (buttonSelected.value === 'past') {
      filteredTripPoints = prettyMocks.filter(([,tripPoint]) => dayjs().diff(dayjs(tripPoint.endDate)) > 0
        || (dayjs().diff(dayjs(tripPoint.beginDate)) > 0) && (dayjs().diff(dayjs(tripPoint.endDate)) < 0));
    } else if (buttonSelected.value === 'future') {
      filteredTripPoints = prettyMocks.filter(([,tripPoint]) => dayjs().diff(dayjs(tripPoint.beginDate)) <= 0
        || (dayjs().diff(dayjs(tripPoint.beginDate)) > 0) && (dayjs().diff(dayjs(tripPoint.endDate)) < 0));
    }

    rerenderEventsList(filteredTripPoints);
  });
});

// оживим сортировку (пока в main.js)
const tripSortByDayControl = document.querySelector('.trip-sort__item--day input');
const tripSortByPriceControl = document.querySelector('.trip-sort__item--price input');
const tripSortByDurationControl = document.querySelector('.trip-sort__item--time input');

tripSortByDayControl.addEventListener('change', () => {
  const sortedTripPoints = prettyMocks.sort(([,firstTripPoint], [,secondTripPoint]) => dayjs(firstTripPoint.beginDate).diff(dayjs(secondTripPoint.beginDate)));
  rerenderEventsList(sortedTripPoints);
});

tripSortByPriceControl.addEventListener('change', () => {
  const sortedTripPoints = prettyMocks.sort(([,firstTripPoint], [,secondTripPoint]) => secondTripPoint.price - firstTripPoint.price);
  rerenderEventsList(sortedTripPoints);
});

tripSortByDurationControl.addEventListener('change', () => {
  const sortedTripPoints = prettyMocks.sort(([,firstTripPoint], [,secondTripPoint]) => dayjs(firstTripPoint.beginDate).diff(dayjs(firstTripPoint.endDate)) - dayjs(secondTripPoint.beginDate).diff(dayjs(secondTripPoint.endDate)));
  rerenderEventsList(sortedTripPoints);
});

// const eventRollUpButtons = document.querySelectorAll('.event__rollup-btn');
//
// eventRollUpButtons.forEach((button) => {
//   button.addEventListener('click', (evt) => {
//     const eventContainer = evt.target.parentNode;
//     console.log(eventContainer.nodeName);
//     if (eventContainer.nodeName.toLowerCase() === 'div') {
//       //const eventId = eventContainer.querySelector('.event__id').textContent;
//       const eventListElementContainer = eventContainer.parentNode;
//       eventListElementContainer.removeChild(eventContainer);
//       render(eventListElementContainer, createTripPointEditView(prettyMocks, prettyMocks[0], eventTypeToOffersMap),'beforeend');
//     } else if (eventContainer.nodeName.toLowerCase() === 'header') {
//       const eventEditionFormContainer = eventContainer.parentNode;
//       const eventListElementContainer = eventEditionFormContainer.parentNode;
//       eventListElementContainer.removeChild(eventEditionFormContainer);
//       render(eventListElementContainer, createTripPointEditView(prettyMocks, prettyMocks[0], eventTypeToOffersMap),'beforeend');
//     }
//   });
// });
