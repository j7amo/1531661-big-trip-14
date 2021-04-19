import TripBoardView from '../view/trip-board.js';
import SortView from '../view/sort.js';
import TripPointsListView from '../view/trip-points-list.js';
import NoTripPointsView from '../view/no-trip-points.js';
import TripPointView from '../view/trip-point.js';
import TripPointEditFormView from '../view/trip-point-edit.js';
import {render, RenderPosition, replace} from '../utils/render.js';

// Общая концепция паттерна MVP, если я правильно понимаю, заключается в следующем:
// ============================
// МОДЕЛЬ - это данные (пока моки, потом придут с сервера). Эти данные мы передаём ПРЕЗЕНТЕРУ (напрямую с ПРЕДСТАВЛЕНИЕМ
// МОДЕЛЬ работать не может в этом паттерне), который является ДВУСТОРОННИМ посредником между МОДЕЛЬЮ и ПРЕДСТАВЛЕНИЕМ.
// ПРЕЗЕНТЕР передаёт дальше эти данные ПРЕДСТАВЛЕНИЮ, причём это не банальный проброс: данные могут декорироваться,
// а также может осуществляться выбор ПРЕДСТАВЛЕНИЯ для релевантного отображения данных.
// ПРЕДСТАВЛЕНИЕ - это отображение наших данных на странице. Зачастую ПРЕДСТАВЛЕНИЕ интерактивно - пользователь
// может с ним взаимодействовать (создавать, получать, обновлять(редактировать) и удалять - классический CRUD).
// Если в ПРЕДСТАВЛЕНИИ что-то меняется в результате действий пользователя, то нам нужно обновить МОДЕЛЬ (данные).
// И тут снова работает ПРЕЗЕНТЕР, который теперь "идёт" в обратную сторону (от ПРЕДСТАВЛЕНИЯ к МОДЕЛИ), обновляя данные.
// То есть получается двусторонняя связь между МОДЕЛЬЮ и ПРЕДСТАВЛЕНИЕМ через ПРЕЗЕНТЕР, который контролирует,
// ЧТО и КАК менять в этих компонентах.
// ============================
// Теперь объявим ПРЕЗЕНТЕР доски.
// Он будет
// - брать данные из модели,
// - создавать соответствующие представления,
// - рендерить их на странице,
// - вешать обработчики в нужных местах представлений.
// И это только пока описана работа по маршруту МОДЕЛЬ - ПРЕЗЕНТЕР - ПРЕДСТАВЛЕНИЕ.
// По сути речь идёт о реализации бизнес-логики нашего приложения.
const EVENT_COUNT = 10;

export default class TripBoardPresenter {
  // конструктор будет получать контейнер, в который будем рендерить саму доску и точки маршрута
  constructor(tripBoardContainer) {
    this._tripBoardContainer = tripBoardContainer;
    // при создании экземпляра доски будем сразу создавать view-компоненты для отрисовки:
    // - самой доски;
    // - сортировки;
    // - списка, в который будем помещать точки маршрута;
    // - заглушки, которая будет отображаться на случай отсутствия точек маршрута в принципе.
    // p.s. Что касается ПРЕДСТАВЛЕНИЯ самой поездки, то это оно будет отдельным,
    // так как это самостоятельная единица со своей логикой
    this._tripBoardComponent = new TripBoardView();
    this._sortComponent = new SortView();
    this._tripPointsListComponent = new TripPointsListView();
    this._noTripPointsComponent = new NoTripPointsView();
  }

  // далее объявим методы презентера
  // Метод для инициализации (начала работы) модуля,
  init(tripPoints, eventTypeToOffersMap, destinations) {
    // 1) скопируем исходные данные, которые могут быть изменены (хорошая практика) и присвоим их соотв. свойству
    this._tripPoints = tripPoints.slice();
    // 2) остальные данные, которые нужны нам для нашей логики (в данном случае речь идёт о словаре и массиве)
    // также присвоим соотв.свойствам, но копировать не будем, так как это неизменяемые данные
    this._eventTypeToOffersMap = eventTypeToOffersMap;
    this._destinations = destinations;
    // 3) отрисуем на странице контейнеры (общий и список поездок)
    render(this._tripBoardContainer, this._tripBoardComponent, RenderPosition.BEFOREEND);
    render(this._tripBoardComponent, this._tripPointsListComponent, RenderPosition.BEFOREEND);
    // 4) отрисуем полезные данные (сортировку и сами точки маршрута) - это инкапсулировано в методе _renderTripBoard
    this._renderTripBoard();
  }

  // метод для отрисовки списка точек маршрута
  _renderTripPointsList() {
    this._renderTripPoints(0, Math.min(this._tripPoints.length, EVENT_COUNT));
  }

  // Метод для рендеринга сортировки
  _renderSort() {
    render(this._tripBoardComponent, this._sortComponent, RenderPosition.AFTERBEGIN);
  }

  // напишем функцию (по аналогии с демонстрационным проектом), которая будет рендерить точку маршрута (по аналогии
  // с рендерингом задачи из списка задач)
  // здесь мы сразу создадим 2 представления точки маршрута:
  // - обычная карточка
  // - форма редактирования
  // Напишем внутренние функции по смене одного представления на другое, Повесим нужные обработчики (вот тут не совсем понял,
  // каким образом локальная константа tripPointEditForm осталась доступной после завершения работы функции renderTripPoint,
  // единственное предположение - замыкание)
  _renderTripPoint(tripPoint) {
    const tripPointCardComponent = new TripPointView(tripPoint);
    const tripPointEditFormComponent = new TripPointEditFormView(tripPoint, this._eventTypeToOffersMap, this._destinations);

    const switchFromCardToForm = () => {
      replace(tripPointEditFormComponent, tripPointCardComponent);
    };

    const switchFromFormToCard = () => {
      replace(tripPointCardComponent, tripPointEditFormComponent);
    };

    // подпишемся на нажатие Escape, когда пункт маршрута в представлении формы редактирования
    const onEscKeyDown = (evt) => {
      if (evt.key === 'Esc' || evt.key === 'Escape') {
        evt.preventDefault();
        switchFromFormToCard();
        document.addEventListener('keydown', onEscKeyDown);
      }
    };

    // подпишемся на click треугольной кнопки, когда пункт маршрута в обычном представлении
    tripPointCardComponent.setEditClickHandler(() => {
      switchFromCardToForm();
      document.addEventListener('keydown', onEscKeyDown);
    });

    // подпишемся на click треугольной кнопки, когда пункт маршрута в представлении формы редактирования
    tripPointEditFormComponent.setEditClickHandler(() => {
      switchFromFormToCard();
      document.removeEventListener('keydown', onEscKeyDown);
    });

    // подпишемся на событие submit, когда пункт маршрута в представлении формы редактирования
    tripPointEditFormComponent.setFormSubmitHandler(() => {
      switchFromFormToCard();
      document.removeEventListener('keydown', onEscKeyDown);
    });

    render(this._tripPointsListComponent, tripPointCardComponent, RenderPosition.BEFOREEND);
  }

  // Метод для рендеринга N-точек маршрута за раз
  _renderTripPoints(from, to) {
    this._tripPoints.slice(from, to).forEach((tripPoint) => this._renderTripPoint(tripPoint));
  }

  // Метод для рендеринга заглушки
  _renderNoTripPoints() {
    render(this._tripPointsListComponent, this._noTripPointsComponent, RenderPosition.AFTERBEGIN);
  }

  // Метод для отрисовки "полезной" части доски - сортировки - точек маршрута
  _renderTripBoard() {
    // отрисуем заглушку на случай, если у нас пока нет ни одной точки маршрута (в ТЗ вроде бы ничего не сказано, надо
    // ли рисовать эту заглушку в случае, когда после применения того или иного фильтра в списке ничего не отображается)
    if (this._tripPoints.length === 0) {
      this._renderNoTripPoints();
      return;
    }

    // отрисуем сортировку
    this._renderSort();

    // отрисуем точки маршрута
    this._renderTripPointsList();
  }
}
