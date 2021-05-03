import dayjs from 'dayjs';
import AbstractView from './abstract.js';

const MINUTES_IN_DAY = 1440;
const MINUTES_IN_HOUR = 60;
const MAX_NUMBER_WITH_LEADING_ZERO = 9;

const createTripPointTemplate = (tripPointData) => {
  const {
    price,
    beginDate,
    endDate,
    destination,
    id,
    isFavorite,
    offers,
    type,
  } = tripPointData;

  const beginDateYearMonthDayFormatted = beginDate ? dayjs(beginDate).format('YYYY-MM-DD') : '';
  const beginDateMonthDayFormatted = beginDate ? dayjs(beginDate).format('MMM DD') : '';
  const beginFullDateWithTimeFormatted = beginDate ? dayjs(beginDate).format('YYYY-MM-DDTHH:mm') : '';
  const beginDateTimeFormatted = beginDate ? dayjs(beginDate).format('HH-mm') : '';
  const endFullDateWithTimeFormatted = endDate ? dayjs(endDate).format('YYYY-MM-DDTHH:mm') : '';
  const endDateTimeFormatted = endDate ? dayjs(endDate).format('HH-mm') : '';
  const eventDuration = (beginDate && endDate) ? dayjs(endDate).diff(dayjs(beginDate), 'minute') : '';

  let eventDurationFormatted;

  if (eventDuration) {
    if (eventDuration >= MINUTES_IN_DAY) {
      const fullDays = Math.floor(eventDuration / MINUTES_IN_DAY);
      const fullHours = Math.floor((eventDuration - fullDays * MINUTES_IN_DAY) / MINUTES_IN_HOUR);
      const fullMinutes = eventDuration - fullDays * MINUTES_IN_DAY - fullHours * MINUTES_IN_HOUR;
      const fullDaysFormatted = (fullDays > MAX_NUMBER_WITH_LEADING_ZERO) ? `${fullDays}` : `0${fullDays}`;
      const fullHoursFormatted = (fullHours > MAX_NUMBER_WITH_LEADING_ZERO) ? `${fullHours}` : `0${fullHours}`;
      const fullMinutesFormatted = (fullMinutes > MAX_NUMBER_WITH_LEADING_ZERO) ? `${fullMinutes}` : `0${fullMinutes}`;
      eventDurationFormatted = `${fullDaysFormatted}D ${fullHoursFormatted}H ${fullMinutesFormatted}M`;
    } else if (eventDuration < MINUTES_IN_DAY && eventDuration >= MINUTES_IN_HOUR) {
      const fullHours = Math.floor(eventDuration / MINUTES_IN_HOUR);
      const fullMinutes = eventDuration - fullHours * MINUTES_IN_HOUR;
      const fullHoursFormatted = (fullHours > MAX_NUMBER_WITH_LEADING_ZERO) ? `${fullHours}` : `0${fullHours}`;
      const fullMinutesFormatted = (fullMinutes > MAX_NUMBER_WITH_LEADING_ZERO) ? `${fullMinutes}` : `0${fullMinutes}`;
      eventDurationFormatted = `${fullHoursFormatted}H ${fullMinutesFormatted}M`;
    } else {
      const fullMinutes = eventDuration;
      const fullMinutesFormatted = (fullMinutes > MAX_NUMBER_WITH_LEADING_ZERO) ? `${fullMinutes}` : `0${fullMinutes}`;
      eventDurationFormatted = `${fullMinutesFormatted}M`;
    }
  }

  let listOfOffers = '';
  offers.forEach(({title, price}) => {
    const offerTemplate = `<li class="event__offer">
      <span class="event__offer-title">${title}</span>
      &plus;&euro;&nbsp;
      <span class="event__offer-price">${price}</span>
    </li>`;
    listOfOffers += offerTemplate;
  });

  const isFavoriteClass = isFavorite ? 'event__favorite-btn--active' : '';

  return `<li class="trip-events__item">
    <div class="event">
      <span class="event__id visually-hidden">${id}</span>
      <time class="event__date" datetime="${beginDateYearMonthDayFormatted}">${beginDateMonthDayFormatted}</time>
      <div class="event__type">
        <img class="event__type-icon" width="42" height="42" src="img/icons/${type}.png" alt="Event type icon">
      </div>
      <h3 class="event__title">${type} ${destination ? destination.name : ''}</h3>
      <div class="event__schedule">
        <p class="event__time">
          <time class="event__start-time" datetime="${beginFullDateWithTimeFormatted}">${beginDateTimeFormatted}</time>
          &mdash;
          <time class="event__end-time" datetime="${endFullDateWithTimeFormatted}">${endDateTimeFormatted}</time>
        </p>
        <p class="event__duration">${eventDurationFormatted ? eventDurationFormatted : ''}</p>
      </div>
      <p class="event__price">
        &euro;&nbsp;<span class="event__price-value">${price ? price : ''}</span>
      </p>
      <h4 class="visually-hidden">Offers:</h4>
      <ul class="event__selected-offers">${listOfOffers}</ul>
      <button class="event__favorite-btn ${isFavoriteClass}" type="button">
        <span class="visually-hidden">Add to favorite</span>
        <svg class="event__favorite-icon" width="28" height="28" viewBox="0 0 28 28">
          <path d="M14 21l-8.22899 4.3262 1.57159-9.1631L.685209 9.67376 9.8855 8.33688 14 0l4.1145 8.33688 9.2003 1.33688-6.6574 6.48934 1.5716 9.1631L14 21z"/>
        </svg>
      </button>
      <button class="event__rollup-btn" type="button">
        <span class="visually-hidden">Open event</span>
      </button>
    </div>
  </li>`;
};

// по аналогии с site-menu.js производим "перевод на классы"
export default class TripPointView extends AbstractView {
  constructor(tripPoint) {
    super();
    this._tripPoint = tripPoint;
    // 5) Так как декоратор _handleClick мы передаём в addEventListener и декоратор в своей внутренней логике
    // явно использует ключевое слово THIS (а мы помним, что в случае с addEventListener'ом THIS = DOM-элементу,
    // на котором произошло отслеживаемое событие), то когда _handleClick дойдёт до своей внутренней инструкции
    // this._callback.click(), то естественно у DOM-элемента не будет свойства _callback и метода click().
    // Зато они есть у экземпляра класса TripPointView! Значит, нам надо принудительно переназначить контекст this
    // для метода _handleClick. Сделать это можно при помощи встроенного в ЖабуСкрипт метода bind, который
    // должен быть вызван НА нужном методе и ему (bind'у) должен быть передан в качестве аргумента нужный контекст this.
    // В результате работы метода bind возвращается новая функция, которая "жёстко прибита" к нужному нам контексту this.
    // И нам надо эту функцию где-то сохранить, чтобы мы могли её использовать. Сохраняем в свойстве объекта.
    this._handleClick = this._handleClick.bind(this);
    this._handleFavoriteClick = this._handleFavoriteClick.bind(this);
  }

  getTemplate() {
    return createTripPointTemplate(this._tripPoint);
  }

  // 4) Данный приватный метод - это обёртка, которая по сути декорирует переданный коллбэк, добавляя ему
  // какую-то полезную логику (в данном случае preventDefault - то есть можно при передаче коллбэка
  // уже не писать отдельно строку evt.preventDefault() - это сделает за нас декоратор)
  _handleClick(evt) {
    evt.preventDefault();
    this._callback.click();
  }

  // это сеттер обработчика
  // 1) Для последующей отмены подписки подписчика (читай: "коллбэка") на событие CLICK нам нужно будет в removeEventListener
  // передать РОВНО ТЕ ЖЕ САМЫЕ аргументы, которые мы передавали при подписке в addEventListener. Речь идёт о:
  // - типе события (строковое значение, например, 'click');
  // - коллбэке / ссылки на коллбэк (если мы по какой-то причине не хотим отменять подписку на событие, то можно не
  // заморачиваться и просто передавать анонимный коллбэк, никуда при этом ссылку на него не сохраняя);
  // - доп.параметрах (на курсе не используем).
  // =================================
  // 2) Раз мы определились с тем, что мы планируем делать отписку, то нам нужно где-то хранить
  // ссылки на переданные коллбэки (их может быть сколько угодно). Так как событие, происходящее
  // на конкретном DOM-элементе, связано напрямую с этим самым элементом, а коллбэк, который слушает это событие,
  // связан напрямую с этим событием, то разумно было бы хранить такой коллбэк где-то в объекте, на основе которого мы
  // получаем этот самый DOM-элемент.
  // =================================
  // 3) Примечание: Здесь важно не путать DOM-элемент(элемент с конкретным тэгом в дереве) с, например,
  // объектом нашего класса TripPointView).Это не одно и то же. Сначала мы получаем объект(экземпляр класса),
  // а затем при помощи методов его класса получаем DOM-элемент.
  setEditClickHandler(callback) {
    this._callback.click = callback;
    this.getElement().querySelector('.event__rollup-btn').addEventListener('click', this._handleClick);
  }

  // теперь по аналогии с ранее объявленными методами (приватным _handleClick и публичным setEditClickHandler, которые
  // работаю "в паре") объявим методы для работы с событием клика по Favorite на вьюхе

  // метод, который мы используем для повышения уровня абстракции и уменьшения связанности кода
  // получается, что этот метод знает только о том, что ему при наступлении события надо сделать preventDefault
  // и вызвать переданный извне коллбэк, о котором он ничего не знает
  _handleFavoriteClick(evt) {
    evt.preventDefault();
    this._callback.favoriteClick();
  }

  // сеттер обработчика (подписываем передаваемый снаружи коллбэк на нужное нам событие на элементе вьюхи)
  setFavoriteClickHandler(callback) {
    this._callback.favoriteClick = callback;
    this.getElement().querySelector('.event__favorite-btn').addEventListener('click', this._handleFavoriteClick);
  }

  // static parseTripPointToStateData(tripPoint) {
  //   return Object.assign(
  //     {},
  //     tripPoint,
  //     {
  //       // будем подмешивать вложенный объект с состоянием
  //       state: {
  //         isFavorite: tripPoint.isFavorite,
  //       },
  //     },
  //   );
  // }
  //
  // static parseStateDataToTripPoint(stateData) {
  //   stateData = Object.assign({}, stateData);
  //
  //   // мы должны изучить состояние вьюхи и на основании этого состояния как-то изменить исходные данные
  //   // в нашем конкретном случае мы просто считываем значение флага в состоянии (что там накликал юзверь)
  //   // и передаём его в данные, которые потом уйдут в модель
  //   stateData.isFavorite = stateData.state.isFavorite;
  //
  //   // удаляем "подмешанные" свойства, так как их нет и не должно быть в данных модели
  //   delete stateData.state;
  //
  //   return stateData;
  // }
}
