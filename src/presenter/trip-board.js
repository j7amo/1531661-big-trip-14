import TripBoardView from '../view/trip-board.js';
import SortView from '../view/sort.js';
import TripPointsListView from '../view/trip-points-list.js';
import NoTripPointsView from '../view/no-trip-points.js';
import { render, RenderPosition } from '../utils/render.js';
import TripPointPresenter from './trip-point.js';

// Общая концепция паттерна MVP, если я правильно понимаю, заключается в следующем:
// ============================
// МОДЕЛЬ - это данные (пока моки, потом придут с сервера). Эти данные мы передаём ПРЕЗЕНТЕРУ (напрямую с ПРЕДСТАВЛЕНИЕМ
// МОДЕЛЬ работать не может в этом паттерне), который является ДВУСТОРОННИМ посредником между МОДЕЛЬЮ и ПРЕДСТАВЛЕНИЕМ.
// ПРЕЗЕНТЕР передаёт дальше эти данные ПРЕДСТАВЛЕНИЮ, причём это не банальный проброс: данные могут декорироваться,
// а также может осуществляться выбор ПРЕДСТАВЛЕНИЯ для релевантного отображения данных.
// ПРЕДСТАВЛЕНИЕ - это отображение наших данных на странице. Зачастую ПРЕДСТАВЛЕНИЕ интерактивно - пользователь
// может с ним взаимодействовать (создавать, читать, обновлять(редактировать) и удалять - классический CRUD).
// Если в ПРЕДСТАВЛЕНИИ что-то меняется в результате действий пользователя, то нам нужно обновить МОДЕЛЬ (данные).
// И тут снова работает ПРЕЗЕНТЕР, который теперь "идёт" в обратную сторону (от ПРЕДСТАВЛЕНИЯ к МОДЕЛИ), обновляя данные.
// То есть получается двусторонняя связь между МОДЕЛЬЮ и ПРЕДСТАВЛЕНИЕМ через ПРЕЗЕНТЕР, который контролирует,
// ЧТО и КАК менять в этих компонентах.
// ============================
// Теперь объявим ПРЕЗЕНТЕР доски.
// Он будет
// 1. Брать данные из модели (что логично, так как данные должны пройти через него),
// 2. Создавать соответствующие представления для того, чтобы было куда передавать данные. По смыслу он обладает знаниями
// о данных модели, он их оценивает и выбирает какие именно представления создать и какие кому данные передавать.
// Эту логику отдать самим представлениям нельзя, так как они ничего не знают о данных модели (особенности паттерна)
// до момента создания своих экземпляров, и в этом случае непонятно какое именно представление нужно создавать.
// 3. Отрисовывать их на странице. Почему именно презентер будет этим заниматься? Ответ вытекает из предыдущего пункта:
// для того, чтобы что-то разместить на странице, нужно знать что именно размещать, а таким знанием в нашей схеме обладает
// именно презентер, значит, ему и заниматься отрисовкой.
// 4. Вешать обработчики в нужных местах представлений (это не касается карточек/форм редактирования точек маршрута,
// так как там свой презентер).
// В теории:
// обработчик мог бы сразу при создании представления навешиваться на его нужный элемент прямо в конструкторе (тогда нужно
// было бы в конструктор представления помимо данных передавать нужный обработчик). Но тогда непонятно, как потом такой
// обработчик удалить, если вся логика скрыта в конструкторе представления и отсутствует публичный интерфейс. Получается,
// что физически нет возможности написать соответствующую инструкцию removeEventListener('event', handler).
// Поэтому получается, что представление должно иметь публичный интерфейс для того, чтобы другие компоненты
// могли добавлять/удалять нужные нам обработчики. А раз мы пришли к выводу о том, что управление обработчиками должно
// быть снаружи представления, а мы знаем, что снаружи на представление воздействует как раз презентер, то, значит,
// ему и управлять добавлением / удалением обработчиков через публичный интерфейс представления.
// Что пишут в интернетах по поводу того, что именно презентер определяет, когда и какие обработчики навешивать на вьюхи:
// Как минимум у презентера и вьюх должны быть КОНТРАКТЫ(интерфейсы), которым жёстко следуют их конкретные классы, что
// позволяет обеспечить совместимость, независимость и взаимозаменяемость получающихся в результате компонентов.
// Такой подход позволяет ещё сильнее отделить представление от бизнес-логики.
// 1) Это позволяет в свою очередь менять вьюхи "на лету", используя при этом один и тот же презентер,
// следуя при этом контракту (интерфейсу) вьюхи (у вьюхи на замену должен быть такой же публичный интерфейс по идее).
// 2) В частности это делает возможным проводить тесты контроллера, "подсовывая" не только моки модели (данных),
// как это делаем мы, но и моки вьюх (но это не точно)
// ========================================
// И это только пока описана работа по "маршруту" МОДЕЛЬ - ПРЕЗЕНТЕР - ПРЕДСТАВЛЕНИЕ.
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
    // для того, чтобы очистить список точек маршрута нам надо удалить из разметки размещённые там вьюхи карточек и форм
    // а мы помним, что эти вьюхи завязаны на презентерах точки маршрута, в которых есть ссылки на них, следовательно
    // нам надо "грохнуть" эти ссылки, тогда сборщик мусора их "подметёт" и экземпляры вьюх перестанут существовать до
    // следующей инициализации презентеров точек маршрута, но не стоит забывать о том, что перед удалением вьюх надо
    // удалить сгенерированную ими разметку, то есть порядок такой:
    // 1) удаляем разметку
    // 2) удаляем вьюхи
    // 3) профит
    // А теперь если посмотреть на публичный интерфейс презентера точки маршрута, то там можно увидеть метод destroy,
    // который сделает всё то, что было написано выше.
    // Тогда нам остаётся только пройтись по всем презентерам точек маршрута и у каждого вызвать этот метод, но для этого
    // нам надо где-то собрать в одном месте все инициализированные презентеры точек маршрута. Сделать это можно прямо в
    // экземпляре презентера доски точек маршрута, так как по логике приложения мы именно в нём управляем отдельными
    // презентерами точек маршрута.
    // Заведём соответствующее свойство и будем хранить презентеры в объекте,
    // где ключ - id точки маршрута, значение - объект презентера. На этапе создания экземпляра презентера доски
    // это буде пустой объект, который мы будем "наполнять" в методе "_renderTripPoint"
    this._tripPointPresenters = {};
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
  _renderTripPoint(tripPoint, eventTypeToOffersMap, destinations) {
    const tripPointPresenter = new TripPointPresenter(this._tripPointsListComponent);
    tripPointPresenter.init(tripPoint, eventTypeToOffersMap, destinations);
    this._tripPointPresenters[tripPoint.id] = tripPointPresenter;
  }

  // Метод для рендеринга N-точек маршрута за раз
  _renderTripPoints(from, to) {
    this._tripPoints.slice(from, to).forEach((tripPoint) => this._renderTripPoint(tripPoint, this._eventTypeToOffersMap, this._destinations));
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

  // Метод для очистки списка точек маршрута на базе описанного в презентере метода для "полного" удаления вьюх точки
  _clearTripPointsList() {
    Object.values(this._tripPointPresenters).forEach((tripPointPresenter) => tripPointPresenter.destroy());
    // после того как вьюхи и соответствующую им разметку мы "грохнули", нужно также удалить ссылки на их презентеры
    this._tripPointPresenters = {};
  }
}
