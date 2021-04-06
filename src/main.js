import { createTripInfoTemplate } from './view/trip-info.js';
import { createTripCostTemplate } from './view/trip-cost.js';
import { createSiteMenuTemplate } from './view/site-menu';
import { createFiltersTemplate } from './view/filters.js';
import { createSortTemplate } from './view/sort.js';
import { createTripPointsListTemplate } from './view/trip-points-list.js';
import { createTripPointEditionFormTemplate } from './view/trip-point-edit.js';
import { generateOffers, generateTripPoints } from './mock/trip-point-mock.js';
import { createTripPointTemplate } from './view/trip-point.js';
import { getAvailableOffersMarkup } from './util.js';

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
const eventTypeToOffersMap = generateOffers();
const tripPointsMocks = generateTripPoints(EVENT_COUNT, eventTypeToOffersMap);
const prettyMocks = Array.from(tripPointsMocks.values());

render(tripInfoElement, createTripInfoTemplate(prettyMocks), 'beforeend');
render(tripInfoElement, createTripCostTemplate(prettyMocks), 'beforeend');
render(tripControlsNavigationElement, createSiteMenuTemplate(), 'beforeend');
render(tripFiltersElement, createFiltersTemplate(), 'beforeend');
render(tripEventsElement, createSortTemplate(), 'beforeend');
render(tripEventsElement, createTripPointsListTemplate(), 'beforeend');

const tripEventsList = tripEventsElement.querySelector('.trip-events__list');

render(tripEventsList, createTripPointEditionFormTemplate(prettyMocks, prettyMocks[0], eventTypeToOffersMap), 'beforeend');

const eventTypeLabelElement = document.querySelector('label[for = "event-destination-1"]');
const eventsTypePicker = document.querySelector('.event__type-group');
const availableOffersContainer = document.querySelector('.event__available-offers');
eventsTypePicker.addEventListener('change', (evt) => {
  eventTypeLabelElement.textContent = evt.target.value;
  const currentEvent = prettyMocks.find((trip) => trip.type === evt.target.value);
  availableOffersContainer.innerHTML = getAvailableOffersMarkup(eventTypeToOffersMap, currentEvent);
});

Array.from(tripPointsMocks.values()).slice(1).forEach((tripPointData) => {
  render(tripEventsList, createTripPointTemplate(tripPointData), 'beforeend');
});
