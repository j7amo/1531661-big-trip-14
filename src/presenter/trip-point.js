import TripPointView from '../view/trip-point.js';
import TripPointEditFormView from '../view/trip-point-edit.js';
import {remove, render, RenderPosition, replace} from '../utils/render.js';

export default class TripPointPresenter {
  constructor(tripPointsListContainer) {
    this._tripPointsListContainer = tripPointsListContainer;
    this._tripPointCardComponent = null;
    this._tripPointEditFormComponent = null;
    this._handleCardEditClick = this._handleCardEditClick.bind(this);
    this._handleFormEditClick = this._handleFormEditClick.bind(this);
    this._handleFormSubmit = this._handleFormSubmit.bind(this);
    this._handleEscKeyDown = this._handleEscKeyDown.bind(this);
  }

  init(tripPoint, eventTypeToOffersMap, destinations) {
    this._tripPoint = tripPoint;
    // Так как в процессе работы приложения у нас на каждую точку маршрута инициализируется презентер точки маршрута(метод
    // _renderTripPoint в презентере доски точек маршрута), то чтобы не "городить" дополнительный
    // метод (что-нибудь типа reInit) для ПЕРЕинициализации презентера точки(например, когда нам надо отрисовать
    // заново ТУ ЖЕ точку маршрута, НО с новыми данными - например, пользователь ввёл новую стоимость в точке маршрута),
    // добавим в метод иниализации презентера точки маршрута возможность грамотного переиспользования этого метода,
    // для обновления ТОЙ ЖЕ САМОЙ вьюхи. В итоге мы сможем использовать метод init сколько угодно раз.

    // Мы могли бы завести какой-нибудь флаг для проверки того, что инициализация первая, но сделаем по аналогии с демо:
    // сделаем маленькую хитрость и добавим 2 строчки, которые позволят нам в будущем проверять был ли данный компонент
    // ранее проинициализирован или это его первая инициализация (в 2-ом случае будут null, которые сэтятся в конструкторе)
    this._prevTripPointCardComponent = this._tripPointCardComponent;
    this._prevTripPointEditFormComponent = this._tripPointEditFormComponent;

    this._tripPointCardComponent = new TripPointView(this._tripPoint);
    this._tripPointEditFormComponent = new TripPointEditFormView(this._tripPoint, eventTypeToOffersMap, destinations);
    this._tripPointCardComponent.setEditClickHandler(this._handleCardEditClick);
    this._tripPointEditFormComponent.setEditClickHandler(this._handleFormEditClick);
    this._tripPointEditFormComponent.setFormSubmitHandler(this._handleFormSubmit);

    // так как при первой инициализации нам не нужно ОБНОВЛЯТЬ вьюху, а нужно её впервые отрисовать (т.е. вызвать render),
    // то добавляем проверку на null двух ранее упомянутых строк
    if (this._prevTripPointCardComponent === null || this._prevTripPointEditFormComponent === null) {
      render(this._tripPointsListContainer, this._tripPointCardComponent, RenderPosition.BEFOREEND);
      return;
    }

    // если выяснилось, что данная карточка точки маршрута уже была инициализирована и нам нужно её обновить (ПЕРЕрисовать),
    // то идём другим путём: используем метод replace, которым мы уже точечно пользовались при замене вьюхи карточки точки
    // маршрута на вьюху формы редактирования точки маршрута и наоборот (при нажатии треугольной кнопки, например).
    // И нам ничего не мешает использовать этот же метод, но теперь мы будем менять:
    // - вьюху карточки на обновлённую вьюху карточки
    // - вьюху формы на обновлённую вьюху формы
    // В утилитарном методе replace у нас есть проверка на null: if (parent === null || newChild === null)
    // и если это условие выполняется, то наш скрипт упадёт, так как мы в этой проверке принудительно выбрасываем ошибку
    // Для того, чтобы избежать этой ситуации, можно перед проведением замены сделать ещё 2 проверки на предмет
    // наличия таких элементов в уже отрисованной разметке приложения
    if (this._tripPointsListContainer.getElement().contains(this._prevTripPointCardComponent.getElement())) {
      replace(this._tripPointCardComponent, this._prevTripPointCardComponent);
    }

    if (this._tripPointEditFormComponent.getElement().contains(this._prevTripPointEditFormComponent.getElement())) {
      replace(this._tripPointEditFormComponent, this._prevTripPointEditFormComponent);
    }

    // предыдущие версии компонентов удаляем
    remove(this._prevTripPointCardComponent);
    remove(this._prevTripPointEditFormComponent);
  }

  // добавим в публичный интерфейс метод на случай, если пользователь захочет удалить точку маршрута (такая
  // возможность есть в форме редактирования точки маршрута)
  destroy() {
    remove(this._tripPointCardComponent);
    remove(this._tripPointEditFormComponent);
  }

  _switchFromCardToForm() {
    replace(this._tripPointEditFormComponent, this._tripPointCardComponent);
    document.addEventListener('keydown', this._handleEscKeyDown);
  }

  _switchFromFormToCard() {
    replace(this._tripPointCardComponent, this._tripPointEditFormComponent);
    document.removeEventListener('keydown', this._handleEscKeyDown);
  }

  // обработчик события нажатия Escape, когда пункт маршрута в представлении формы редактирования
  _handleEscKeyDown(evt) {
    if (evt.key === 'Esc' || evt.key === 'Escape') {
      evt.preventDefault();
      this._switchFromFormToCard();
    }
  }

  // обработчик события click треугольной кнопки, когда пункт маршрута в обычном представлении
  _handleCardEditClick() {
    this._switchFromCardToForm();
  }

  // обработчик события click треугольной кнопки, когда пункт маршрута в представлении формы редактирования
  _handleFormEditClick() {
    this._switchFromFormToCard();
  }

  // обработчик события submit, когда пункт маршрута в представлении формы редактирования
  _handleFormSubmit() {
    this._switchFromFormToCard();
  }
}
