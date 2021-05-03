import AbstractSmartView from './smart-view.js';
import { nanoid } from 'nanoid';
import flatpickr from 'flatpickr';
import '../../node_modules/flatpickr/dist/flatpickr.min.css';

// заведём константу для datePicker'а
const DateType = {
  BEGIN_DATE: 'BEGIN_DATE',
  END_DATE: 'END_DATE',
};

// в этом классе опишем всю ОБЩУЮ логику форм (у нас их 2: редактирования и создания точки маршрута)
// хронологически ДО создания этого класса был создан класс TripPointEditFormView, но теперь когда появилась
// необходимость в добавлении новой точки маршрута через форму добавления (которая имеет много общего с формой
// редактирования), приходится выстраивать иерархию классов
export default class AbstractForm extends AbstractSmartView {
  // напишем общий метод для инициализации datePicker'а
  // этот метод будет принимать на вход аргументы, которые определят:
  // 1) какой пикер инициализировать (для начальной даты / для конечной даты)
  // 2) на какой DOM-элемент его вешать
  // 3) какой коллбэк подписывать на его событие onChange
  _initDatePicker(dateType, elementForPickerAdd, defaultDate, onChangeCallback) {
    // так как datePicker'ы при своей инициализации создают много всяких элементов со своей разметкой / стилями / поведением,
    // нам нужно перед каждой такой инициализацией проверять на предмет того, есть ли уже инициализированный datePicker
    // и если есть, то грохать его и всё, что он сгенерировал (непонятно, правда, почему нельзя использовать уже
    // инициализированный datePicker, но делаю как в демо-проекте Академии)
    let datePicker;

    switch (dateType) {
      case DateType.BEGIN_DATE:
        datePicker = '_beginDatePicker';
        break;
      case DateType.END_DATE:
        datePicker = '_endDatePicker';
        break;
    }

    if (this[datePicker]) {
      this[datePicker].destroy();
      this[datePicker] = null;
    }

    // теперь сама инициализация datePicker'ов
    this[datePicker] = flatpickr(
      // согласно API flatpickr первым аргументом мы передаём DOM-элемент, на который мы планируем его "прикрутить"
      elementForPickerAdd,
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
        defaultDate: defaultDate,
        // подписываем на событие onChange обработчик, который будет заниматься обновлением даты в состоянии
        onChange: onChangeCallback,
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

  // объявим метод, который подпишем на клик по полю ввода даты
  // данный метод будет инициализировать соответствующий полю datePicker
  _handleBeginDateClick(evt) {
    evt.preventDefault();
    evt.target.removeEventListener('click', this._handleBeginDateClick);
    this._initDatePicker(DateType.BEGIN_DATE, evt.target, this._stateData.beginDate, this._handleBeginDateChange);
    this._beginDatePicker.open();
  }

  // объявим метод, который подпишем на клик по полю ввода даты
  // данный метод будет инициализировать соответствующий полю datePicker
  _handleEndDateClick(evt) {
    evt.preventDefault();
    evt.target.removeEventListener('click', this._handleEndDateClick);
    this._initDatePicker(DateType.END_DATE, evt.target, this._stateData.endDate, this._handleEndDateChange);
    this._endDatePicker.open();
  }

  // объявим методы, который будет "сносить" datePicker'ы
  _destroyBeginDatePicker() {
    if (this._beginDatePicker) {
      this._beginDatePicker.destroy();
      this._beginDatePicker = null;
    }
  }

  _destroyEndDatePicker() {
    if (this._endDatePicker) {
      this._endDatePicker.destroy();
      this._endDatePicker = null;
    }
  }

  _handleFormSubmit(evt) {
    evt.preventDefault();
    // корректируем обработчик клика на submit формы: теперь, так как у нас коллбэк, который приходит сюда из презентера
    // точки маршрута принимает аргумент - точку маршрута, то и здесь мы её должны передать
    // UPDATE: так как мы начали работать с состоянием вьюхи, то теперь мы должны изменить пришедшие данные с учётом состояния
    // вьюхи - для этого у нас появился специальный метод
    this._callback.formSubmit(AbstractForm.parseStateDataToTripPoint(this._stateData));
    this._destroyBeginDatePicker();
    this._destroyEndDatePicker();
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
      const indexToRemove = this._stateData.offers.findIndex(({
        title,
        price,
      }) => (title === offerTitle && price === offerPrice));
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
    // для того, чтобы инициализировать flatpickr исключительно по запросу пользователя (таким запросом считаем клик по дате)
    // нам надо подписать на событие этого самого клика обработчик, который будет инициализировать flatpickr
    this.getElement().querySelector('input[id = "event-start-time-1"]').addEventListener('click', this._handleBeginDateClick);
    this.getElement().querySelector('input[id = "event-end-time-1"]').addEventListener('click', this._handleEndDateClick);
  }

  setFormSubmitHandler(callback) {
    this._callback.formSubmit = callback;
    this.getElement().querySelector('.event--edit').addEventListener('submit', this._handleFormSubmit);
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
    return Object.assign({}, stateData);
  }

  // объявим метод для сброса состояния вьюхи на случай, если пользователь не хочет сохранять то, что он ввёл
  reset(tripPoint) {
    // для этого у нас есть метод updateState, которому мы передаём совместимый объект и на выходе получаем новое
    // состояние и нам ничего не мешает в уже изменённое в результате действий пользователя состояние вьюхи "залить"
    // первоначальное состояние вьюхи, по сути произвести сброс изменений
    this.updateState(
      AbstractForm.parseTripPointToStateData(tripPoint),
      false,
    );
    this._destroyBeginDatePicker();
    this._destroyEndDatePicker();
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
