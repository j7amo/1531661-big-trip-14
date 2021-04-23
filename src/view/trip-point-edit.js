import dayjs from 'dayjs';
import AbstractView from './abstract.js';
import {nanoid} from 'nanoid';

const createTripPointEditTemplate = (tripPoint, getEventTypesPickerMarkup, getDestinationOptionsMarkup, getAvailableOffersMarkup) => {
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
            ${getAvailableOffersMarkup()}
          </div>
        </section>

        <section class="event__section  event__section--destination">
          <h3 class="event__section-title  event__section-title--destination">Destination</h3>
          <p class="event__destination-description">${currentDestination.description}</p>
        </section>
      </section>
    </form>
  </li>`;
};

// по аналогии с site-menu.js производим "перевод на классы"
export default class TripPointEditFormView extends AbstractView {
  constructor(tripPoint, eventTypeToOffersMap, destinations) {
    super();
    // UPDATE: теперь мы не работаем напрямую с данными, а работаем с состоянием вьюхи, поэтому сразу при создании
    // её экземпляра делаем преобразование данных модели в данные состояния и дальше до завершения действий по изменению
    // состояния вьюхи работаем только с состоянием до тех пор пока не возникнет ситуация (сабмит формы), когда нужно
    // обновить пришедшие данные
    this._stateData = TripPointEditFormView.parseTripPointToStateData(tripPoint);
    this._eventTypeToOffersMap = eventTypeToOffersMap;
    this._destinations = destinations;

    this._handleFormSubmit = this._handleFormSubmit.bind(this);
    this._handleEditClick = this._handleEditClick.bind(this);
    this._getEventTypesPickerMarkup = this._getEventTypesPickerMarkup.bind(this);
    this._getDestinationOptionsMarkup = this._getDestinationOptionsMarkup.bind(this);
    this._getAvailableOffersMarkup = this._getAvailableOffersMarkup.bind(this);
    this._handlePriceInput = this._handlePriceInput.bind(this);

    this._setInnerHandlers();
  }

  getTemplate() {
    // UPDATE: так как мы начали работать с состоянием вьюхи, то теперь мы должны не просто передавать в метод генерации
    // разметки исходные данные, но и флаги состояния (для этого у нас появился специальный метод)
    return createTripPointEditTemplate(this._stateData, this._getEventTypesPickerMarkup, this._getDestinationOptionsMarkup, this._getAvailableOffersMarkup);
  }

  _handleFormSubmit(evt) {
    evt.preventDefault();
    // корректируем обработчик клика на submit формы: теперь, так как у нас коллбэк, который приходит сюда из презентера
    // точки маршрута принимает аргумент - точку маршрута, то и здесь мы её должны передать
    // UPDATE: так как мы начали работать с состоянием вьюхи, то теперь мы должны изменить пришедшие данные с учётом состояния
    // вьюхи - для этого у нас появился специальный метод
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
    this.updateState({
      price: evt.target.value,
    }, true);
  }

  // так как внутренних обработчиков будет > 1, то имеет смысл этот однотипный функционал запихнуть в один метод
  // это нам также пригодится в сценарии, когда нам нужно будет переподписывать обработчики после перерисовки компонентов
  _setInnerHandlers() {
    this.getElement().querySelector('.event__input--price').addEventListener('change', this._handlePriceInput);
  }

  // объявим метод, который будет восстанавливать обработчики (как внешние, так и внутренние) после перерисовки
  restoreHandlers() {
    // переподписываем внутренние
    this._setInnerHandlers();
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
    );
  }

  static parseStateDataToTripPoint(stateData) {
    stateData = Object.assign({}, stateData);

    // мы должны изучить состояние вьюхи и на основании этого состояния как-то изменить исходные данные
    return stateData;
  }

  // Научим наш компонент обновлять свою разметку
  // Для этого объявим метод updateElement, его задача удалить старый DOM элемент, вызвать генерацию нового
  // и заменить один на другой. Идея в том, что при генерации нового элемента будет снова зачитано свойство _data.
  // И если мы сперва обновим его, а потом шаблон, то в итоге получим элемент с новыми данными.
  updateElementMarkup() {
    const oldElement = this.getElement();
    const oldElementParent = oldElement.parentElement;
    this.removeElement();

    const newElement = this.getElement();

    oldElementParent.replaceChild(newElement, oldElement);

    this.restoreHandlers();
  }

  // Научим наш компонент обновлять своё состояние:
  // для этого объявим метод, в который будет передавать объект с обновлёнными свойствами (это может быть только часть
  // объекта, если обновилось, например, только одно свойство)
  updateState(update, localStateUpdate) {
    // делаем проверку на случай передачи пустого объекта (если пустой - ничего не обновляем)
    if (!update) {
      return;
    }

    // сначала обновляем состояние вьюхи (обновлённые данные в update)
    this._stateData = Object.assign(
      {},
      this._stateData,
      update,
    );

    // добавляем проверку на тот случай, когда у нас локальное обновление состояния вьюхи без полной перерисовки
    if (localStateUpdate) {
      return;
    }

    // и только если все проверки пройдены (то есть пришёл какой-то не пустой объект и флаг localStateUpdate = false)
    // затем полностью обновляем разметку вьюхи целиком
    this.updateElementMarkup();
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
  _getAvailableOffersMarkup() {
    let availableOffersOptionsMarkup = '';
    const selectedOffers = this._stateData.offers;
    const availableOffers = this._eventTypeToOffersMap.get(this._stateData.type).offers;
    for (let i = 0; i < availableOffers.length; i++) {
      const randomId = nanoid();
      const checkboxChecked = selectedOffers.includes(availableOffers[i]) ? 'checked' : '';
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
}
