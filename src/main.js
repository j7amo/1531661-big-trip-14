import dayjs from 'dayjs';
import TripBoardPresenter from './presenter/trip-board.js';
import { generateDestinations, generateOffers, generateTripPoints } from './mock/trip-point-mock.js';
import TripPointsModel from './model/trip-points';
import OffersModel from './model/offers';
import DestinationsModel from './model/destinations';
import FiltersModel from './model/filters.js';
import FiltersPresenter from './presenter/filters.js';
import SortModel from './model/sort.js';
import TripInfoPresenter from './presenter/trip-info.js';
import SiteMenuPresenter from './presenter/site-menu.js';
import MenuModel from './model/site-menu.js';
import StatisticsPresenter from './presenter/statistics.js';
import {MenuType} from "./const";

const EVENT_COUNT = 10;

// находим DOM-элементы
const tripMainElement = document.querySelector('.trip-main');
const tripPointAddButton = tripMainElement.querySelector('.trip-main__event-add-btn');
const tripInfoContainer = tripMainElement.querySelector('.trip-info');
const siteMenuContainer = tripMainElement.querySelector('.trip-controls__navigation');
const filtersContainer = tripMainElement.querySelector('.trip-controls__filters');
const mainContentContainer = document.querySelector('.page-main__container');

//генерим  моки
const destinations = generateDestinations();
const eventTypeToOffersMap = generateOffers();
const tripPointsMocks = generateTripPoints(EVENT_COUNT, destinations, eventTypeToOffersMap);
const prettyMocks = Array.from(tripPointsMocks.values()).sort((firstTripPoint, secondTripPoint) => dayjs(firstTripPoint.beginDate).diff(dayjs(secondTripPoint.beginDate)));

// создаём модели наших структур
const menuModel = new MenuModel();
const tripPointsModel = new TripPointsModel();
const offersModel = new OffersModel();
const destinationsModel = new DestinationsModel();
const filtersModel = new FiltersModel();
const sortModel = new SortModel();

// теперь у нас есть модели, но они пустые, поэтому воспользуемся их интерфейсами для инициализации данных
tripPointsModel.setTripPoints(prettyMocks);
offersModel.setOffers(eventTypeToOffersMap);
destinationsModel.setDestinations(destinations);

const switchTableStatsTabs = (currentTab) => {
  switch (currentTab) {
    case MenuType.TABLE:
      statisticsPresenter.destroy();
      tripBoardPresenter.init();
      break;
    case MenuType.STATS:
      tripBoardPresenter.destroy();
      statisticsPresenter.init();
      break;
  }
};

// рендерим моки
const tripInfoPresenter = new TripInfoPresenter(tripInfoContainer, tripPointsModel);
tripInfoPresenter.init();
const siteMenuPresenter = new SiteMenuPresenter(siteMenuContainer, menuModel, sortModel, switchTableStatsTabs);
siteMenuPresenter.init();
const filtersPresenter = new FiltersPresenter(filtersContainer, filtersModel, sortModel);
filtersPresenter.init();
const tripBoardPresenter = new TripBoardPresenter(mainContentContainer, filtersModel, sortModel, tripPointsModel, offersModel, destinationsModel);
tripBoardPresenter.init();
const statisticsPresenter = new StatisticsPresenter(mainContentContainer, tripPointsModel);
//statisticsPresenter.init();

// подписываем обработчик
tripPointAddButton.addEventListener('click', (evt) => {
  evt.preventDefault();
  tripBoardPresenter.createTripPoint();
});

