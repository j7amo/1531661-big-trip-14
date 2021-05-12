import dayjs from 'dayjs';
import TripBoardPresenter from './presenter/trip-board.js';
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
import { MenuType, UpdateType } from './const.js';
import Api from './api/api.js';
import { isOnline } from './utils/common.js';
import { toast } from './utils/toast.js';
import Store from './api/store.js';
import Provider from './api/provider.js';

// объявим константы, которые нужны для создания экземпляра класса Api
const AUTHORIZATION = 'Basic 0JDRgNC-0LzQsNGC0L3QsNGP0JHQvtC80LbQuNGF0LA2NjY';
const END_POINT = 'https://14.ecmascript.pages.academy/big-trip';

const TRIP_POINTS_STORAGE_PREFIX = 'bigtrip-points-localstorage';
const OFFERS_STORAGE_PREFIX = 'bigtrip-offers-localstorage';
const DESTINATIONS_STORAGE_PREFIX = 'bigtrip-destinations-localstorage';
const STORAGE_VER = 'v14';
const TRIP_POINTS_STORAGE_NAME = `${TRIP_POINTS_STORAGE_PREFIX}-${STORAGE_VER}`;
const OFFERS_STORAGE_NAME = `${OFFERS_STORAGE_PREFIX}-${STORAGE_VER}`;
const DESTINATIONS_STORAGE_NAME = `${DESTINATIONS_STORAGE_PREFIX}-${STORAGE_VER}`;

// находим DOM-элементы
const tripMainElement = document.querySelector('.trip-main');
const tripPointAddButton = tripMainElement.querySelector('.trip-main__event-add-btn');
const tripInfoContainer = tripMainElement.querySelector('.trip-info');
const siteMenuContainer = tripMainElement.querySelector('.trip-controls__navigation');
const filtersContainer = tripMainElement.querySelector('.trip-controls__filters');
const mainContentContainer = document.querySelector('.page-main__container');

// ВНИМАНИЕ! Экземпляр класса Api мы будем создавать прямо в точке входа и далее с ним работать.
// На лайве было сказано, что такое использование класса API для работы с сервером - НЕ канон.
// По-нормальному от этого класса должны наследоваться классы моделей и уже на их экзеплярах
// «дёргаться» нужные «сетевые» методы.
const api = new Api(END_POINT, AUTHORIZATION);
const tripPointsStorage = new Store(TRIP_POINTS_STORAGE_NAME, window.localStorage);
const offersStorage = new Store(OFFERS_STORAGE_NAME, window.localStorage);
const destinationsStorage = new Store(DESTINATIONS_STORAGE_NAME, window.localStorage);
const apiWithProvider = new Provider(api, tripPointsStorage, offersStorage, destinationsStorage);

// создаём модели наших структур
const menuModel = new MenuModel();
const tripPointsModel = new TripPointsModel();
const offersModel = new OffersModel();
const destinationsModel = new DestinationsModel();
const filtersModel = new FiltersModel();
const sortModel = new SortModel();

// получаем данные с сервера и записываем их в модели
const destinations = apiWithProvider.getDestinations();
const offers = apiWithProvider.getOffers();
const tripPoints = apiWithProvider.getTripPoints();

Promise.all([destinations, offers, tripPoints])
  .then((results) => {
    destinationsModel.setDestinations(results[0]);
    offersModel.setOffers(results[1]);
    const sortedTripPoints = results[2]
      .sort((firstTripPoint, secondTripPoint) => dayjs(firstTripPoint.beginDate).diff(dayjs(secondTripPoint.beginDate)));
    tripPointsModel.setTripPoints(UpdateType.INIT, sortedTripPoints);
  })
  .then(() => {
    // сделаем как в демо-проекте: не будем отрисовывать контролы пока не получим все данные с сервера
    const siteMenuPresenter = new SiteMenuPresenter(siteMenuContainer, menuModel, sortModel, switchTableStatsTabs);
    siteMenuPresenter.init();
    const filtersPresenter = new FiltersPresenter(filtersContainer, filtersModel, sortModel, tripPointsModel);
    filtersPresenter.init();
    // подписываем обработчик клика по кнопке добавления новой точки маршрута
    tripPointAddButton.addEventListener('click', (evt) => {
      evt.preventDefault();
      if (!isOnline()) {
        toast('You can\'t create new trip point while offline');
        return;
      }
      tripBoardPresenter.createTripPoint();
      tripPointAddButton.disabled = true;
    });
  })
  .catch(() => alert('Возникла ошибка при загрузке данных с сервера. Попробуйте обновить страницу'));

const switchTableStatsTabs = (currentTab) => {
  switch (currentTab) {
    case MenuType.TABLE:
      statisticsPresenter.destroy();
      tripBoardPresenter.init();
      tripPointAddButton.disabled = false;
      break;
    case MenuType.STATS:
      tripBoardPresenter.destroy();
      statisticsPresenter.init();
      tripPointAddButton.disabled = true;
      break;
  }
};

const tripInfoPresenter = new TripInfoPresenter(tripInfoContainer, tripPointsModel);
tripInfoPresenter.init();
const tripBoardPresenter = new TripBoardPresenter(mainContentContainer, filtersModel, sortModel, tripPointsModel, offersModel, destinationsModel, apiWithProvider);
tripBoardPresenter.init();
const statisticsPresenter = new StatisticsPresenter(mainContentContainer, tripPointsModel);

// подпишем на загрузку страницы коллбэк регистрации нашего SW
window.addEventListener('load', () => {
  navigator.serviceWorker.register('/sw.js');
});

window.addEventListener('online', () => {
  document.title = document.title.replace(' [offline]', '');
  apiWithProvider.sync();
});

window.addEventListener('offline', () => {
  document.title += ' [offline]';
});
