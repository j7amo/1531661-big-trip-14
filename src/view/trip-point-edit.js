import dayjs from 'dayjs';
import AbstractSmartView from './smart-view.js';
import { nanoid } from 'nanoid';
import flatpickr from 'flatpickr';
import '../../node_modules/flatpickr/dist/flatpickr.min.css';

const createTripPointEditTemplate = (tripPoint, getEventTypesPickerMarkup, getDestinationOptionsMarkup, initAvailableOffersMarkup, getDestinationDescriptionMarkup) => {
  const {
    price: currentPrice,
    beginDate: currentBeginDate,
    endDate: currentEndDate,
    destination: currentDestination,
    id: currentId,
    type: currentType,
  } = tripPoint;

  const beginDateWithTimeFormatted = dayjs(currentBeginDate).format('DD/MM/YY HH:mm');
  const endDateWithTimeFormatted = dayjs(currentEndDate).format('DD/MM/YY HH:mm');

  return `<li class="trip-events__item">
    <form class="event event--edit" action="#" method="post">
      <span class="event__edit-id visually-hidden">${currentId}</span>
      <header class="event__header">
        <div class="event__type-wrapper">
          <label class="event__type  event__type-btn" for="event-type-edit-toggle-1">
            <span class="visually-hidden">Choose event type</span>
            <img class="event__type-icon" width="17" height="17" src="img/icons/${currentType}.png" alt="Event type icon">
          </label>
          <input class="event__type-toggle  visually-hidden" id="event-type-edit-toggle-1" type="checkbox">

          <div class="event__type-list">
            <fieldset class="event__type-group">
              <legend class="visually-hidden">Event type</legend>
              ${getEventTypesPickerMarkup()}
            </fieldset>
          </div>
        </div>

        <div class="event__field-group  event__field-group--destination">
          <label class="event__label  event__type-output" for="event-destination-1">
            ${currentType}
          </label>
          <input class="event__input  event__input--destination" id="event-destination-1" type="text" name="event-destination" value="${currentDestination.name}" list="destination-list-1">
          <datalist id="destination-list-1">
            ${getDestinationOptionsMarkup()}
          </datalist>
        </div>

        <div class="event__field-group  event__field-group--time">
          <label class="visually-hidden" for="event-start-time-1">From</label>
          <input class="event__input  event__input--time" id="event-start-time-1" type="text" name="event-start-time" value="${beginDateWithTimeFormatted}">
          &mdash;
          <label class="visually-hidden" for="event-end-time-1">To</label>
          <input class="event__input  event__input--time" id="event-end-time-1" type="text" name="event-end-time" value="${endDateWithTimeFormatted}">
        </div>

        <div class="event__field-group  event__field-group--price">
          <label class="event__label" for="event-price-1">
            <span class="visually-hidden">Price</span>
            &euro;
          </label>
          <input class="event__input  event__input--price" id="event-price-1" type="text" name="event-price" value="${currentPrice}">
        </div>

        <button class="event__save-btn  btn  btn--blue" type="submit">Save</button>
        <button class="event__reset-btn" type="reset">Delete</button>
        <button class="event__rollup-btn" type="button">
          <span class="visually-hidden">Open event</span>
        </button>
      </header>
      <section class="event__details">
        <section class="event__section  event__section--offers">
          <h3 class="event__section-title  event__section-title--offers">Offers</h3>

          <div class="event__available-offers">
            ${initAvailableOffersMarkup()}
          </div>
        </section>
        ${getDestinationDescriptionMarkup(currentDestination.name)}
      </section>
    </form>
  </li>`;
};

// по аналогии с site-menu.js производим "перевод на классы"
export default class TripPointEditFormView extends AbstractSmartView {
  constructor(tripPoint, eventTypeToOffersMap, destinations) {
    super();
    // UPDATE: теперь мы не работаем напрямую с данными, а работаем с состоянием вьюхи, поэтому сразу при создании
    // её экземпляра делаем преобразование данных модели в данные состояния и дальше до завершения действий по изменению
    // состояния вьюхи работаем только с состоянием до тех пор пока не возникнет ситуация (сабмит формы), когда нужно
    // обновить пришедшие данные
    this._stateData = TripPointEditFormView.parseTripPointToStateData(tripPoint);
    this._eventTypeToOffersMap = eventTypeToOffersMap;
    this._destinations = destinations;
    // заводим поле под flatpickr (в конструкторе присваиваем ему null, чтобы он обнулялся при повторном рендеринге всей формы)
    this._beginDatePicker = null;
    this._endDatePicker = null;

    this._handleFormSubmit = this._handleFormSubmit.bind(this);
    this._handleEditClick = this._handleEditClick.bind(this);
    this._getEventTypesPickerMarkup = this._getEventTypesPickerMarkup.bind(this);
    this._getDestinationOptionsMarkup = this._getDestinationOptionsMarkup.bind(this);
    this._getDestinationDescriptionMarkup = this._getDestinationDescriptionMarkup.bind(this);
    this._initAvailableOffersMarkup = this._initAvailableOffersMarkup.bind(this);
    this._handlePriceInput = this._handlePriceInput.bind(this);
    this._handleBeginDateChange = this._handleBeginDateChange.bind(this);
    this._handleEndDateChange = this._handleEndDateChange.bind(this);
    this._handleEventTypeChange = this._handleEventTypeChange.bind(this);
    this._handleEventOffersToggle = this._handleEventOffersToggle.bind(this);
    this._handleDestinationChange = this._handleDestinationChange.bind(this);

    // не забываем, что при создании нового экземпляра вьюхи мы должны "развесить" внутренние обработчики
    this._setInnerHandlers();
    // а после подключения в проект datePicker'а (flatpickr в нашем случае) не забываем также инициализировать и его
    this._initDatePickers();
  }

  getTemplate() {
    // UPDATE: так как мы начали работать с состоянием вьюхи, то теперь мы должны не просто передавать в метод генерации
    // разметки исходные данные, но и флаги состояния (для этого у нас появился специальный метод)
    return createTripPointEditTemplate(this._stateData, this._getEventTypesPickerMarkup, this._getDestinationOptionsMarkup, this._initAvailableOffersMarkup, this._getDestinationDescriptionMarkup);
  }

  // объявим специальный метод, который будет инициализировать datePicker (важно понимать, что мы в любой момент
  // можем отказаться от flatpickr и выбрать какой-нибудь другой datePicker, поэтому надо достаточно абстрактно назвать
  // наш метод)
  _initDatePickers() {
    // так как datePicker'ы при своей инициализации создают много всяких элементов со своей разметкой / стилями / поведением,
    // нам нужно перед каждой такой инициализацией проверять на предмет того, есть ли уже инициализированный datePicker
    // и если есть, то грохать его и всё, что он сгенерировал (непонятно, правда, почему нельзя использовать уже
    // инициализированный datePicker, но делаю как в демо-проекте Академии)
    if (this._beginDatePicker) {
      this._beginDatePicker.destroy();
      this._beginDatePicker = null;
    }

    if (this._endDatePicker) {
      this._endDatePicker.destroy();
      this._endDatePicker = null;
    }

    // теперь сама инициализация datePicker'ов
    this._beginDatePicker = flatpickr(
      // согласно API flatpickr первым аргументом мы передаём DOM-элемент, на который мы планируем его "прикрутить"
      this.getElement().querySelector('input[id = "event-start-time-1"]'),
      // вторым аргументом передаём объект с настройками самого flatpickr
      {
        // количество одновременно выбираемых дат в одном пикере
        mode: 'single',
        // "разрешаем" выбор и отображение времени
        enableTime: true,
        // Формат даты, который нам нужен: 25/12/2019 16:00
        dateFormat: 'd/m/y H:i',
        // формат timePicker'а
        time_24hr: true,
        // задаём дефолтные данные (то, что должно считаться из данных)
        defaultDate: this._stateData.beginDate,
        // подписываем на событие onChange flatpickr обработчик, который будет заниматься обновлением даты в состоянии
        onChange: this._handleBeginDateChange,
      },
    );

    this._endDatePicker = flatpickr(
      // согласно API flatpickr первым аргументом мы передаём DOM-элемент, на который мы планируем его "прикрутить"
      this.getElement().querySelector('input[id = "event-end-time-1"]'),
      // вторым аргументом передаём объект с настройками самого flatpickr
      {
        // количество одновременно выбираемых дат в одном пикере
        mode: 'single',
        // "разрешаем" выбор и отображение времени
        enableTime: true,
        // Формат даты, который нам нужен: 25/12/2019 16:00
        dateFormat: 'd/m/y H:i',
        // формат timePicker'а
        time_24hr: true,
        // задаём дефолтные данные (то, что должно считаться из данных)
        defaultDate: this._stateData.endDate,
        // подписываем на событие onChange flatpickr обработчик, который будет заниматься обновлением даты в состоянии
        onChange: this._handleEndDateChange,
      },
    );
  }

  // объявим обработчик ввода начальной даты в точке маршрута
  // так как теперь событие перехватывает сам flatpickr, то мы эту логику (evt.preventDefault) убираем из нашего
  // обработчика, но в результате работы flatpickr создаётся по-видимому некий массив с данными и если строго следовать
  // демо-проекту Академии, то мы нашему обработчику этот массив передаём в качестве аргумента и через деструктуризацию
  // "выдёргиваем" из этого массива нужные нам данные - ДАТУ
  _handleBeginDateChange([userDate]) {
    // при изменении начальной даты НЕ надо полностью перерисовывать вьюху, так как
    // начальная дата в рамках формы редактирования ни на что не влияет, поэтому передаём флаг localStateUpdate = true
    this.updateState({
      beginDate: userDate,
    }, true);
  }

  // объявим обработчик ввода конечной даты в точке маршрута
  _handleEndDateChange([userDate]) {
    // при изменении конечной даты НЕ надо полностью перерисовывать вьюху, так как
    // конечная дата в рамках формы редактирования ни на что не влияет, поэтому передаём флаг localStateUpdate = true
    this.updateState({
      endDate: userDate,
    }, true);
  }

  _handleFormSubmit(evt) {
    evt.preventDefault();
    // корректируем обработчик клика на submit формы: теперь, так как у нас коллбэк, который приходит сюда из презентера
    // точки маршрута принимает аргумент - точку маршрута, то и здесь мы её должны передать
    // UPDATE: так как мы начали работать с состоянием вьюхи, то теперь мы должны изменить пришедшие данные с учётом состояния
    // вьюхи - для этого у нас появился специальный метод
    //this.updateElementMarkup();
    this._callback.formSubmit(TripPointEditFormView.parseStateDataToTripPoint(this._stateData));
  }

  _handleEditClick(evt) {
    evt.preventDefault();
    this._callback.click();
  }

  // добавим ещё внутренних обработчиков, которые будут заниматься тем, что будут обрабатывать события, сгенерированные
  // пользователем на вьюхе, которые изменяют состояние вьюхи, но при этом могут быть в любой момент отменены, если
  // пользователь их не засабмитит

  // объявим обработчик ввода стоимости точки маршрута
  _handlePriceInput(evt) {
    evt.preventDefault();
    // при изменении цены НЕ надо полностью перерисовывать вьюху, так как
    // цена в рамках формы редактирования ни на что не влияет, поэтому передаём флаг localStateUpdate = true
    this.updateState({
      price: evt.target.value,
    }, true);
  }

  // объявим обработчик смены типа события (тут механизм будет другой, так как нам только надо отрисовать доступные
  // предложения для нового типа события, обновлять состояние вьюхи смысла наверное нет, так как пользователю
  // ещё нужно будет осуществить новый выбор опций)
  _handleEventTypeChange(evt) {
    evt.preventDefault();
    // обновляем разметку
    // производим замену блока со старыми офферами на блок с новыми офферами
    // const newElement = createNewElement(this._getAvailableOffersMarkup(evt.target.value));
    // const oldElement = this.getElement().querySelector('.event__available-offers');
    // replace(newElement, oldElement);
    // // производим скрытие выпадающего списка, в котором происходит выбор типа точки маршрута
    // document.querySelector('.event__type-toggle').checked = false;
    // обновляем состояние вьюхи (должен поменяться тип события)
    const update = {
      // согласно ТЗ при смене типа события предыдущие выбранные опции НЕ сохраняются
      // это можно реализовать путём записи пустого массива поверх исходного
      offers: [],
      type: evt.target.value,
    };
    // при изменении типа события НАДО полностью перерисовывать вьюху, так как в рамках формы редактирования
    // в этот момент происходит сразу несколько вещей:
    // 1) меняется картинка типа события
    // 2) меняется название типа события в текстовом поле
    // 3) меняется блок с доступными офферами
    // Поэтому проще передать флаг localStateUpdate = false, чтобы сразу обновить всё это
    this.updateState(update, false);
  }

  // объявим обработчик выбора дополнительных опций (речь идёт как о выборе, так и об отмене уже выбранных опций)
  // так как здесь нам предстоит менять массив, то при каждой смене состояния чекбокса:
  // 1) получим обновлённый массив
  // 2) произведём замену старого массива на новый с помощью updateState
  _handleEventOffersToggle(evt) {
    evt.preventDefault();
    // найдём чекбокс, который генерирует событие
    const offerCheckbox = evt.target;
    // так как в данных офферы - массив объектов со свойствами title и price
    // то соответственно нужно помнить об этом при ДОБАВЛЕНИИ в список выбранных офферов новых предложений
    // при удалении это не так важно - особой разницы, что удалять из массива нет
    // для того, чтобы сформировать объект для добавления в массив, нам надо распарсить из его разметки title и price
    // так как вся связка "чекбокс - лейбл - спаны", которая описывает один оффер, лежит каждая в своём контейнере,
    // то мы можем найти этот контейнер через чекбокс и в нём уже искать нужные для формирования объекта оффера спаны
    // почему предлагается такой вариант: неизвестно как там в данных с сервера будут обстоять дела с id, возможно не
    // стоит к нему привязываться - пусть лучше будет чуть более топорный, но точно работающий способ
    const container = offerCheckbox.parentElement;
    // получаем нужные для формирования объекта оффера значения
    const offerTitle = container.querySelector('.event__offer-title').textContent;
    const offerPrice = Number(container.querySelector('.event__offer-price').textContent);
    if (offerCheckbox.checked === false) {
      // находим под каким индексом в массиве нужный нам для удаления оффер
      const indexToRemove = this._stateData.offers.findIndex(({ title, price }) => (title === offerTitle && price === offerPrice));
      // здесь мы берём исходный массив и в нём производим удаление нужного оффера
      // p.s. метод splice вовзращает удалённый элемент и мутирует при этом исходный массив
      this._stateData.offers.splice(indexToRemove, 1);
      this.updateState({
        offers: this._stateData.offers,
      }, true);
    } else {
      // формируем объект для добавления в массив выбранных офферов
      const offerToAdd = {
        title: offerTitle,
        price: offerPrice,
      };
      // здесь мы берём исходный массив и в нём производим добавление нужного оффера
      // p.s. очередной прикол из мира массивов: метод push возвращает новую длину массива
      this._stateData.offers.push(offerToAdd);
      this.updateState({
        offers: this._stateData.offers,
      }, true);
    }
  }

  // объявим обработчик смены направления
  _handleDestinationChange(evt) {
    evt.preventDefault();
    // обновляем разметку:
    // const newElement = createNewElement(this._getDestinationDescriptionMarkup(evt.target.value));
    // const oldElement = this.getElement().querySelector('.event__section--destination');
    // replace(newElement, oldElement);
    // при изменении направления НЕ надо полностью перерисовывать вьюху, так как
    // направление в рамках формы редактирования влияет только на блок DESTINATION, а для получения этой разметки у нас
    // отдельный метод, поэтому передаём флаг localStateUpdate = true
    this.updateState({
      destination: this._destinations.get(evt.target.value),
    }, false);
  }

  // так как внутренних обработчиков будет > 1, то имеет смысл этот однотипный функционал запихнуть в один метод
  // это нам также пригодится в сценарии, когда нам нужно будет переподписывать обработчики после перерисовки компонентов
  _setInnerHandlers() {
    this.getElement().querySelector('.event__input--price').addEventListener('change', this._handlePriceInput);
    this.getElement().querySelector('.event__type-group').addEventListener('change', this._handleEventTypeChange);
    this.getElement().querySelector('.event__field-group--destination').addEventListener('change', this._handleDestinationChange);
    // так как при смене типа события было принято решение делать полную перерисовку, а после её наступления мы
    // вызываем метод restoreHandlers, который в свою очередь вызывает _setInnerHandlers, можно в методе _setInnerHandlers
    // осуществить подписку _handleEventOffersToggle на чекбоксы дополнительных офферов
    const availableOffers = this.getElement().querySelectorAll('.event__offer-checkbox');
    availableOffers.forEach((offer) => offer.addEventListener('change', this._handleEventOffersToggle));
  }

  // объявим метод, который будет восстанавливать обработчики (как внешние, так и внутренние) после перерисовки
  restoreHandlers() {
    // переподписываем внутренние
    this._setInnerHandlers();
    // делаем повторную инициализацию datePicker'а
    this._initDatePickers();
    // переподписываем внешние
    this.setFormSubmitHandler(this._callback.formSubmit);
    this.setEditClickHandler(this._callback.click);
  }

  setFormSubmitHandler(callback) {
    this._callback.formSubmit = callback;
    this.getElement().querySelector('.event--edit').addEventListener('submit', this._handleFormSubmit);
  }

  setEditClickHandler(callback) {
    this._callback.click = callback;
    this.getElement().querySelector('.event__rollup-btn').addEventListener('click', this._handleEditClick);
  }

  // Начинаем работать С СОСТОЯНИЕМ ВЬЮХ. Состояние вьюхи, если я правильно понял, это некие
  // промежуточные данные(которые складываются из данных модели + примешиваемых данных самого состояния),
  // которые ещё не были отправлены (возможно они вообще не будут отправлены,потому что пользователь может вообще
  // отменить ввод данных) по маршруту "Вьюха - Презентер - Модель",но отобразить их пользователю мы УЖЕ должны.
  // И получается тогда, что состояние вьюхи переходит в состояние модели только, если сабмитим форму.
  // Тогда из написанного выше следует то, что нам нужны методы, которые будут
  // - "подмешивать" (если надо) пришедшим во вьюху данным модели некие данные, которые меняют вьюху "здесь и сейчас"
  // без отправки данных на условный сервер (в модель)
  // - убирать (если надо / если что-то было подмешано) подмешиваемые данные, если таковые НЕ должны попасть
  // в данные модели и оставлять их, если они нужны в модели.
  // Академия предлагает сделать эти методы статическими.
  // p.s. в демо-проекте здесь дополнительно "подмешиваются" флаги, от значения которых зависит,
  // то как выглядит вьюха (своеобразные модификаторы, которые меняют отдельные элементы вьюхи)
  // в нашем случае есть только флаг isFavorite и он по условию ТЗ никак не влияет на то,
  // как выглядит/ведёт себя вьюха формы редактирования, поэтому мы ничего не "подмешиваем", а по сути просто копируем.
  static parseTripPointToStateData(tripPoint) {
    return Object.assign(
      {},
      tripPoint,
      {
        // так как Object.assign не предлагает функционал глубокого копирования, то если у нас в объекте имеются другие
        // вложенные объекты, нам нужно позаботиться о том, чтобы в состояние ТАКЖЕ ПОПАЛИ ИХ КОПИИ!
        offers: tripPoint.offers.slice(),
      },
    );
  }

  static parseStateDataToTripPoint(stateData) {
    stateData = Object.assign({}, stateData);

    // мы должны изучить состояние вьюхи и на основании этого состояния как-то изменить исходные данные
    return stateData;
  }

  // объявим метод для сброса состояния вьюхи на случай, если пользователь не хочет сохранять то, что он ввёл
  reset(tripPoint) {
    // для этого у нас есть метод updateState, которому мы передаём совместимый объект и на выходе получаем новое
    // состояние и нам ничего не мешает в уже изменённое в результате действий пользователя состояние вьюхи "залить"
    // первоначальное состояние вьюхи, по сути произвести сброс изменений
    this.updateState(
      TripPointEditFormView.parseTripPointToStateData(tripPoint),
      false,
    );
  }

  // объявим всякие разные внутренние методы, которые будем использовать в логике работы самой вьюхи:

  // объявим метод, который будет получать из словаря (тип точки маршрута - список доступных опций/предложений) разметку
  // для пикера типа точки маршрута, также под капотом он будет сразу выбирать нужную радио-кнопку
  _getEventTypesPickerMarkup() {
    let eventTypeItemsMarkup = '';

    Array.from(this._eventTypeToOffersMap.keys()).forEach((type) => {
      let eventTypesTemplate;
      if (type === this._stateData.type) {
        eventTypesTemplate = `<div class="event__type-item">
      <input id="event-type-${type}-1" class="event__type-input  visually-hidden" type="radio" name="event-type" value="${type}" checked>
      <label class="event__type-label  event__type-label--${type}" for="event-type-${type}-1">${type}</label>
      </div>`;
      } else {
        eventTypesTemplate = `<div class="event__type-item">
      <input id="event-type-${type}-1" class="event__type-input  visually-hidden" type="radio" name="event-type" value="${type}">
      <label class="event__type-label  event__type-label--${type}" for="event-type-${type}-1">${type}</label>
      </div>`;
      }
      eventTypeItemsMarkup += eventTypesTemplate;
    });

    return eventTypeItemsMarkup;
  }

  // объявим метод, который будет получать из словаря (направление - описание направления) разметку
  // для выпадающего списка доступных направлений
  _getDestinationOptionsMarkup() {
    let destinationOptionsMarkup = '';

    Array.from(this._destinations.keys()).forEach((destination) => {
      const destinationsTemplate = `<option value="${destination}"></option>`;
      destinationOptionsMarkup += destinationsTemplate;
    });

    return destinationOptionsMarkup;
  }

  // объявим метод, который будет получать из словаря (тип точки маршрута - список доступных опций/предложений) разметку
  // для отображения доступных для данного типа точки маршрута предложений
  // небольшой нюанс: сразу же проверим какие предложения в пришедших данных уже были выбраны и выберем соотв.чекбоксы
  _initAvailableOffersMarkup() {
    let availableOffersOptionsMarkup = '';
    const selectedOffers = this._stateData.offers;
    const availableOffers = this._eventTypeToOffersMap.get(this._stateData.type).offers;
    for (let i = 0; i < availableOffers.length; i++) {
      const randomId = nanoid();
      const isAvailableOfferSelected = selectedOffers.some((selectedOffer) => (availableOffers[i].title === selectedOffer.title && availableOffers[i].price === selectedOffer.price));
      const checkboxChecked = isAvailableOfferSelected ? 'checked' : '';
      const offerTemplate = `<div class="event__offer-selector">
      <input class="event__offer-checkbox  visually-hidden" id="event-offer-${randomId}-1" type="checkbox" name="event-offer-${this._stateData.type}" ${checkboxChecked}>
      <label class="event__offer-label" for="event-offer-${randomId}-1">
        <span class="event__offer-title">${availableOffers[i].title}</span>
        &plus;&euro;&nbsp;
        <span class="event__offer-price">${availableOffers[i].price}</span>
      </label>
    </div>`;

      availableOffersOptionsMarkup += offerTemplate;
    }
    return availableOffersOptionsMarkup;
  }

  // Надо реализовать получение разметки доступных предложений и отрисовку этой самой разметки по клику
  // на соответствующие радио-кнопки. Это должно происходить с привязкой к чему-то, что гарантированно
  // позволит идентифицировать текущую радио-кнопку. По идее это её value, так как value в радио-кнопках уникален.
  // Тогда при смене радио-кнопки считываем через evt.target.value значение и используем его в качестве ключа,
  // по которому ищем в мапе this._eventTypeToOffersMap доступные для данного типа (ключа) офферы
  // этот приватный метод как раз будет отрисовывать доступные офферы
  // _getAvailableOffersMarkup(eventType) {
  //   let availableOffersOptionsMarkup = '<div class="event__available-offers">';
  //   const availableOffers = this._eventTypeToOffersMap.get(eventType).offers;
  //   for (let i = 0; i < availableOffers.length; i++) {
  //     const randomId = nanoid();
  //     const offerTemplate = `<div class="event__offer-selector">
  //     <input class="event__offer-checkbox  visually-hidden" id="event-offer-${randomId}-1" type="checkbox" name="event-offer-${this._stateData.type}">
  //     <label class="event__offer-label" for="event-offer-${randomId}-1">
  //       <span class="event__offer-title">${availableOffers[i].title}</span>
  //       &plus;&euro;&nbsp;
  //       <span class="event__offer-price">${availableOffers[i].price}</span>
  //     </label>
  //   </div>`;
  //
  //     availableOffersOptionsMarkup += offerTemplate;
  //   }
  //
  //   availableOffersOptionsMarkup += '</div>';
  //
  //   return availableOffersOptionsMarkup;
  // }

  // объявим метод, который будет возвращать разметку раздела Destination
  // эту разметку по аналогии с разметкой доступных офферов будет использовать обработчик смены направления точки маршрута,
  // а также метод, который возвращает общую разметку данной вьюхи (формы редактирования)
  _getDestinationDescriptionMarkup(destinationName) {
    const newDestination = this._destinations.get(destinationName);
    let eventPhotosMarkup = '';
    for (let i = 0; i < newDestination.pictures.length; i++) {
      const src = newDestination.pictures[i].src;
      const alt = newDestination.pictures[i].description;
      eventPhotosMarkup += `<img class="event__photo" src="${src}" alt="${alt}">`;
    }

    return `<section class="event__section  event__section--destination">
          <h3 class="event__section-title  event__section-title--destination">Destination</h3>
          <p class="event__destination-description">${newDestination.description}</p>
          <div class="event__photos-container">
            <div class="event__photos-tape">
              ${eventPhotosMarkup}
            </div>
          </div>
        </section>`;
  }
}
