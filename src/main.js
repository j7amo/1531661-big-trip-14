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
import Storage from './api/Storage.js';
import Provider from './api/provider.js';

const AUTHORIZATION = 'Basic 0LPQvdC-0LnQvdGL0Lkg0LHQvtC80LY';
const END_POINT = 'https://14.ecmascript.pages.academy/big-trip';

const StoragePrefix = {
  TRIP_POINTS: 'bigtrip-points-localstorage',
  OFFERS: 'bigtrip-offers-localstorage',
  DESTINATIONS: 'bigtrip-destinations-localstorage',
};

const ModelIndex = {
  DESTINATIONS: 0,
  OFFERS: 1,
  TRIP_POINTS: 2,
};

const STORAGE_VER = 'v14';
const TRIP_POINTS_STORAGE_NAME = `${StoragePrefix.TRIP_POINTS}-${STORAGE_VER}`;
const OFFERS_STORAGE_NAME = `${StoragePrefix.OFFERS}-${STORAGE_VER}`;
const DESTINATIONS_STORAGE_NAME = `${StoragePrefix.DESTINATIONS}-${STORAGE_VER}`;

const tripMainElement = document.querySelector('.trip-main');
const tripPointAddButtonElement = tripMainElement.querySelector('.trip-main__event-add-btn');
const tripInfoElement = tripMainElement.querySelector('.trip-info');
const siteMenuElement = tripMainElement.querySelector('.trip-controls__navigation');
const filtersElement = tripMainElement.querySelector('.trip-controls__filters');
const mainContentElement = document.querySelector('.page-main__container');

const api = new Api(END_POINT, AUTHORIZATION);
const tripPointsStorage = new Storage(TRIP_POINTS_STORAGE_NAME, window.localStorage);
const offersStorage = new Storage(OFFERS_STORAGE_NAME, window.localStorage);
const destinationsStorage = new Storage(DESTINATIONS_STORAGE_NAME, window.localStorage);
const apiWithProvider = new Provider(api, tripPointsStorage, offersStorage, destinationsStorage);

const menuModel = new MenuModel();
const tripPointsModel = new TripPointsModel();
const offersModel = new OffersModel();
const destinationsModel = new DestinationsModel();
const filtersModel = new FiltersModel();
const sortModel = new SortModel();

const destinations = apiWithProvider.getDestinations();
const offers = apiWithProvider.getOffers();
const tripPoints = apiWithProvider.getTripPoints();

Promise.all([destinations, offers, tripPoints])
  .then((results) => {
    destinationsModel.setDestinations(results[ModelIndex.DESTINATIONS]);
    offersModel.setOffers(results[ModelIndex.OFFERS]);
    const sortedTripPoints = results[ModelIndex.TRIP_POINTS]
      .sort((firstTripPoint, secondTripPoint) => dayjs(firstTripPoint.beginDate).diff(dayjs(secondTripPoint.beginDate)));
    tripPointsModel.setTripPoints(UpdateType.INIT, sortedTripPoints);
  })
  .then(() => {
    const siteMenuPresenter = new SiteMenuPresenter(siteMenuElement, menuModel, sortModel, switchTableStatsTabs);
    siteMenuPresenter.init();
    const filtersPresenter = new FiltersPresenter(filtersElement, filtersModel, sortModel, tripPointsModel);
    filtersPresenter.init();
    tripPointAddButtonElement.addEventListener('click', (evt) => {
      evt.preventDefault();
      if (!isOnline()) {
        toast('You can\'t create new trip point while offline');
        return;
      }
      tripBoardPresenter.createTripPoint();
      tripPointAddButtonElement.disabled = true;
    });
  })
  .catch(() => alert('Возникла ошибка при загрузке данных с сервера. Попробуйте обновить страницу'));

const switchTableStatsTabs = (currentTab) => {
  switch (currentTab) {
    case MenuType.TABLE:
      statisticsPresenter.destroy();
      tripBoardPresenter.init();
      tripPointAddButtonElement.disabled = false;
      break;
    case MenuType.STATS:
      tripBoardPresenter.destroy();
      statisticsPresenter.init();
      tripPointAddButtonElement.disabled = true;
      break;
  }
};

const tripInfoPresenter = new TripInfoPresenter(tripInfoElement, tripPointsModel);
tripInfoPresenter.init();
const tripBoardPresenter = new TripBoardPresenter(mainContentElement, filtersModel, sortModel, tripPointsModel, offersModel, destinationsModel, apiWithProvider);
tripBoardPresenter.init();
const statisticsPresenter = new StatisticsPresenter(mainContentElement, tripPointsModel);

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
