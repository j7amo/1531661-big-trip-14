import TripPointView from '../view/trip-point.js';
import TripPointEditFormView from '../view/trip-point-edit.js';
import {remove, render, RenderPosition, replace} from '../utils/render.js';

// заведём перечисление режимов точек маршрута
const Mode = {
  DEFAULT: 'DEFAULT',
  EDITING: 'EDITING',
};

export default class TripPointPresenter {
  // модифицируем конструктор презентера точки маршрута так, чтобы он принимал тот самый переданный из презентера
  // доски метод, который обновляет данные (модель), а также метод, который позволяет грамотно разрешить ситуацию с
  // одновременным открытием ТОЛЬКО ОДНОЙ формы редактирования точки маршрута
  // мы это делаем для того, чтобы пробросить этот функционал через все "слои" (презентеры, вьюхи)
  constructor(tripPointsListContainer, changeData, changeMode) {
    this._tripPointsListContainer = tripPointsListContainer;
    this._changeData = changeData;
    this._changeMode = changeMode;
    this._tripPointCardComponent = null;
    this._tripPointEditFormComponent = null;
    // объявляем свойство, которое будет хранить режим, в котором сейчас находится презентер точки маршрута
    // и как следствие то, какая вьюха сейчас отображается
    this._mode = Mode.DEFAULT;
    this._handleFavoritesClick = this._handleFavoritesClick.bind(this);
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
    this._tripPointCardComponent.setFavoriteClickHandler(this._handleFavoritesClick);

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
    // UPDATE: так как у нас появился теперь режим отображения точки маршрута и мы его для каждого презентера храним
    // в свойстве, то теперь можно убрать проверку this._tripPointsListContainer.getElement().contains(this._prevTripPointCardComponent.getElement())
    // и заменить её на проверку того, какой режим сейчас у точки маршрута, что будет равноценно присутствию соответствующей
    // режиму разметки
    if (this._mode === Mode.DEFAULT) {
      replace(this._tripPointCardComponent, this._prevTripPointCardComponent);
    }

    if (this._mode === Mode.EDITING) {
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

  // добавим в публичный интерфейс метод, который будет сбрасывать(менять) режим редактирования в обычный
  resetView() {
    if (this._mode === Mode.EDITING) {
      this._switchFromFormToCard();
    }
  }

  _switchFromCardToForm() {
    replace(this._tripPointEditFormComponent, this._tripPointCardComponent);
    document.addEventListener('keydown', this._handleEscKeyDown);
    // ВНИМАНИЕ! Ключевой момент! при вызове в презентере точки маршрута метода _switchFromCardToForm
    // у нас в презентере доски должен отработать метод _handleModeChange, в котором описана логика вызова метода
    // resetView для всех презентеров точки маршрута. Это нужно для принудительного сброса всех вьюх
    // в "режим чтения" при каждом наступлении события нажатия кнопки редактирования точки маршрута,
    // что позволит как раз избежать возникновения ситуации с более чем одной открытой формой редактирования точки
    this._changeMode();
    // теперь при смене одного отображения на другое не забываем также переключить соответствующий флагв нужный "режим"
    this._mode = Mode.EDITING;
  }

  _switchFromFormToCard() {
    replace(this._tripPointCardComponent, this._tripPointEditFormComponent);
    document.removeEventListener('keydown', this._handleEscKeyDown);
    // теперь при смене одного отображения на другое не забываем также переключить соответствующий флагв нужный "режим"
    this._mode = Mode.DEFAULT;
  }

  // обработчик события нажатия кнопки-звёздочки (Favorites)
  // тут требуются пояснения: когда пользователь во вьюхе нажмёт на Favorites, он спровоцирует изменение данных -
  // - изменение значения свойства isFavorite в объекте точки маршрута, а так как за изменение данных модели и передачу
  // изменённых данных обратно во вьюху у нас отвечает метод changeData (это в презентере точки маршрута, в презентере
  // доски - приватный _handleTripPointChange) и мы знаем, что он принимает на вход изменённый объект, то нам надо
  // в обработчике клика по Favorites получить изменённый объект и передать его этому методу (changeData)
  _handleFavoritesClick() {
    this._changeData(
    // здесь по аналогии с демо-проектом мы будем пользоваться методом Object.assign, который позволяет создать новый
    // объект и скопировать туда все перечисляемые свойства источников копирования (других объектов)
    // на лекции говорилось про мутабельность / иммутабельность, но без подробностей
      Object.assign(
        {},
        this._tripPoint,
        // здесь маленькая хитрость: в качестве 2-го источника для копирования свойств мы указываем некий придуманный
        // нами объект, в котором значение свойства(флага) isFavorite меняется на противоположное тому, которое было
        // установлено в модели (данных, моках) до клика на Favorites
        {
          isFavorite: !this._tripPoint.isFavorite,
        },
      ),
    );
  }

  // обработчик события нажатия Escape, когда пункт маршрута в представлении формы редактирования
  _handleEscKeyDown(evt) {
    if (evt.key === 'Esc' || evt.key === 'Escape') {
      evt.preventDefault();
      // делаем сброс состояния вьюхи с помощью передачи изначальных данных в написанный нами метод reset
      this._tripPointEditFormComponent.reset(this._tripPoint);
      this._switchFromFormToCard();
    }
  }

  // обработчик события click треугольной кнопки, когда пункт маршрута в обычном представлении
  _handleCardEditClick() {
    this._switchFromCardToForm();
  }

  // обработчик события click треугольной кнопки, когда пункт маршрута в представлении формы редактирования
  _handleFormEditClick() {
    this._tripPointEditFormComponent.reset(this._tripPoint);
    this._switchFromFormToCard();
  }

  // обработчик события submit, когда пункт маршрута в представлении формы редактирования
  _handleFormSubmit(tripPoint) {
    // теперь при submit'е формы мы также обновляем данные (предполагается, что пользователь, раз он был в форме
    // редактирования и нажал submit, то он что-то поменял, значит, данные надо обновить
    this._changeData(tripPoint);
    this._switchFromFormToCard();
  }
}
