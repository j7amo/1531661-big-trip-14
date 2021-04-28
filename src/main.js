import dayjs from 'dayjs';
import TripInfoView from './view/trip-info.js';
import TripCostView from './view/trip-cost.js';
import SiteMenuView from './view/site-menu';
import FiltersView from './view/filters.js';
import TripBoardPresenter from './presenter/trip-board.js';
import { generateDestinations, generateOffers, generateTripPoints } from './mock/trip-point-mock.js';
import { render, RenderPosition } from './utils/render.js';
import TripPointsModel from './model/trip-points';
import OffersModel from './model/offers';
import DestinationsModel from './model/destinations';

const EVENT_COUNT = 10;

// находим DOM-элементы
const tripMainElement = document.querySelector('.trip-main');
const tripInfoElement = tripMainElement.querySelector('.trip-info');
const tripControlsNavigationElement = tripMainElement.querySelector('.trip-controls__navigation');
const tripFiltersElement = tripMainElement.querySelector('.trip-controls__filters');
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

// теперь у нас есть модели, но они пустые, поэтому воспользуемся их интерфейсами для инициализации данных
tripPointsModel.setTripPoints(prettyMocks);
offersModel.setOffers(eventTypeToOffersMap);
destinationsModel.setDestinations(destinations);

// отрисовываем представления
render(tripInfoElement, new TripInfoView(tripPointsMocks), RenderPosition.BEFOREEND);
render(tripInfoElement, new TripCostView(tripPointsMocks), RenderPosition.BEFOREEND);
render(tripControlsNavigationElement, new SiteMenuView(), RenderPosition.BEFOREEND);
render(tripFiltersElement, new FiltersView(), RenderPosition.BEFOREEND);

// рендерим моки
const tripBoardPresenter = new TripBoardPresenter(tripBoardContainer, tripPointsModel, offersModel, destinationsModel);
tripBoardPresenter.init(prettyMocks, eventTypeToOffersMap, destinations);
