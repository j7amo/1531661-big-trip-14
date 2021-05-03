import dayjs from 'dayjs';
import TripInfoView from './view/trip-info.js';
import TripCostView from './view/trip-cost.js';
import SiteMenuView from './view/site-menu';
import TripBoardPresenter from './presenter/trip-board.js';
import { generateDestinations, generateOffers, generateTripPoints } from './mock/trip-point-mock.js';
import { render, RenderPosition } from './utils/render.js';
import TripPointsModel from './model/trip-points';
import OffersModel from './model/offers';
import DestinationsModel from './model/destinations';
import FiltersModel from './model/filters.js';
import FiltersPresenter from './presenter/filters.js';
import SortModel from './model/sort.js';

const EVENT_COUNT = 10;

// находим DOM-элементы
const tripMainElement = document.querySelector('.trip-main');
const tripPointAddButton = tripMainElement.querySelector('.trip-main__event-add-btn');
const tripInfoElement = tripMainElement.querySelector('.trip-info');
const tripControlsNavigationElement = tripMainElement.querySelector('.trip-controls__navigation');
const filtersContainer = tripMainElement.querySelector('.trip-controls__filters');
const tripBoardContainer = document.querySelector('.page-main__container');

//генерим  моки
const destinations = generateDestinations();
const eventTypeToOffersMap = generateOffers();
const tripPointsMocks = generateTripPoints(EVENT_COUNT, destinations, eventTypeToOffersMap);
const prettyMocks = Array.from(tripPointsMocks.values()).sort((firstTripPoint, secondTripPoint) => dayjs(firstTripPoint.beginDate).diff(dayjs(secondTripPoint.beginDate)));

// создаём модели наших структур
const tripPointsModel = new TripPointsModel();
const offersModel = new OffersModel();
const destinationsModel = new DestinationsModel();
const filtersModel = new FiltersModel();
const sortModel = new SortModel();

// теперь у нас есть модели, но они пустые, поэтому воспользуемся их интерфейсами для инициализации данных
tripPointsModel.setTripPoints(prettyMocks);
offersModel.setOffers(eventTypeToOffersMap);
destinationsModel.setDestinations(destinations);

// отрисовываем представления
render(tripInfoElement, new TripInfoView(tripPointsMocks), RenderPosition.BEFOREEND);
render(tripInfoElement, new TripCostView(tripPointsMocks), RenderPosition.BEFOREEND);
render(tripControlsNavigationElement, new SiteMenuView(), RenderPosition.BEFOREEND);

// рендерим моки
const filtersPresenter = new FiltersPresenter(filtersContainer, filtersModel, sortModel);
filtersPresenter.init();
const tripBoardPresenter = new TripBoardPresenter(tripBoardContainer, filtersModel, sortModel, tripPointsModel, offersModel, destinationsModel);
tripBoardPresenter.init();

// подписываем обработчик
tripPointAddButton.addEventListener('click', (evt) => {
  evt.preventDefault();
  tripBoardPresenter.createTripPoint();
});
