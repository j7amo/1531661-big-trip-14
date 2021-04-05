import { createTripInfoTemplate } from './view/trip-info.js';
import { createTripCostTemplate } from './view/trip-cost.js';
import { createSiteMenuTemplate } from './view/site-menu';
import { createFiltersTemplate } from './view/filters.js';
import { createSortTemplate } from './view/sort.js';
import { createTripPointsListTemplate } from './view/trip-points-list.js';
import { createTripPointCreationFormTemplate } from './view/trip-point-add.js';
import { createTripPointEditionFormTemplate } from './view/trip-point-edit.js';
import { generateTripPoints } from './mock/trip-point-mock.js';
import { createTripPointTemplate } from './view/trip-point.js';

const render = (container, template, place) => {
  container.insertAdjacentHTML(place, template);
};

const EVENT_COUNT = 10;

const tripMainElement = document.querySelector('.trip-main');
const tripInfoElement = tripMainElement.querySelector('.trip-info');
const tripControlsNavigationElement = tripMainElement.querySelector('.trip-controls__navigation');
const tripFiltersElement = tripMainElement.querySelector('.trip-controls__filters');
const tripEventsElement = document.querySelector('.trip-events');

render(tripInfoElement, createTripInfoTemplate(), 'beforeend');
render(tripInfoElement, createTripCostTemplate(), 'beforeend');
render(tripControlsNavigationElement, createSiteMenuTemplate(), 'beforeend');
render(tripFiltersElement, createFiltersTemplate(), 'beforeend');
render(tripEventsElement, createSortTemplate(), 'beforeend');
render(tripEventsElement, createTripPointsListTemplate(), 'beforeend');

const tripEventsList = tripEventsElement.querySelector('.trip-events__list');

//генерим моки
const tripPointsMocks = generateTripPoints(EVENT_COUNT);
render(tripEventsList, createTripPointEditionFormTemplate(Array.from(tripPointsMocks.values()), Array.from(tripPointsMocks.values())[0]), 'beforeend');
render(tripEventsList, createTripPointCreationFormTemplate(), 'beforeend');

Array.from(tripPointsMocks.values()).forEach((tripPointData) => {
  render(tripEventsList, createTripPointTemplate(tripPointData), 'beforeend');
});
