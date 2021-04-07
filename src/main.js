import { createTripInfoView } from './view/trip-info.js';
import { createTripCostView } from './view/trip-cost.js';
import { createSiteMenuView } from './view/site-menu';
import { createFiltersView } from './view/filters.js';
import { createSortView } from './view/sort.js';
import { createTripPointsListView } from './view/trip-points-list.js';
import { createTripPointEditView } from './view/trip-point-edit.js';
import { generateDestinations, generateOffers, generateTripPoints } from './mock/trip-point-mock.js';
import { createTripPointView } from './view/trip-point.js';
import { getAvailableOffersMarkup, createTripPointListElement } from './util.js';

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

render(tripEventsList, createTripPointListElement(createTripPointEditView(Array.from(tripPointsMocks.values())[0], eventTypeToOffersMap, destinations)), 'beforeend');

// рендерим моки
const prettyMocks = Array.from(tripPointsMocks.entries());
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
