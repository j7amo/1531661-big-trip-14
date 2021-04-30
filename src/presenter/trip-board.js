import TripBoardView from '../view/trip-board.js';
import SortView from '../view/sort.js';
import TripPointsListView from '../view/trip-points-list.js';
import NoTripPointsView from '../view/no-trip-points.js';
import {remove, render, RenderPosition} from '../utils/render.js';
import { SortType, UserAction, UpdateType } from '../const.js';
import { sortByDateUp, sortByPriceDown, sortByTimeDown } from '../utils/trip-point.js';
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

export default class TripBoardPresenter {
  // конструктор будет получать контейнер, в который будем рендерить саму доску и точки маршрута
  constructor(tripBoardContainer, tripPointsModel, offersModel, destinationsModel) {
    this._tripBoardContainer = tripBoardContainer;
    // при создании экземпляра доски будем сразу создавать view-компоненты для отрисовки:
    // - самой доски;
    // - сортировки;
    // - списка, в который будем помещать точки маршрута;
    // - заглушки, которая будет отображаться на случай отсутствия точек маршрута в принципе.
    // p.s. Что касается ПРЕДСТАВЛЕНИЯ самой поездки, то это оно будет отдельным,
    // так как это самостоятельная единица со своей логикой
    this._sortComponent = null;
    this._tripBoardComponent = new TripBoardView();
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
    // добавим свойство с текущим типом сортировки
    this._currentSortType = SortType.DEFAULT;
    // добавим свойства, в которых будем хранить ссылки на модели нужных нам структур данных
    this._tripPointsModel = tripPointsModel;
    this._offersModel = offersModel;
    this._destinationsModel = destinationsModel;
    // "прибиваем" обработчики действий пользователя на вьюхе
    this._handleViewAction = this._handleViewAction.bind(this);
    //  и событий модели
    this._handleModelEvent = this._handleModelEvent.bind(this);

    this._handleModeChange = this._handleModeChange.bind(this);
    this._handleSortTypeChange = this._handleSortTypeChange.bind(this);

    // используем интерфейс моделей и подписываем обработчики действий моделей на их события
    this._tripPointsModel.addObserver(this._handleModelEvent);
    this._offersModel.addObserver(this._handleModelEvent);
    this._destinationsModel.addObserver(this._handleModelEvent);
  }

  // далее объявим методы презентера
  // Метод для инициализации (начала работы) модуля,
  init() {
    render(this._tripBoardContainer, this._tripBoardComponent, RenderPosition.BEFOREEND);
    render(this._tripBoardComponent, this._tripPointsListComponent, RenderPosition.BEFOREEND);
    this._renderTripBoard();
  }

  // добавим обёртки-геттеры для получения данных из моделей (данные теперь мы НЕ храним в презентерах! Это функция Модели!)
  // также по примеру Академии расширим функционал метода _getTripPoints: пусть он возвращает нам не просто данные в случайном
  // порядке, а в том порядке, который нужен. Для этого дополнительно будем сразу в этом методе сортировать.
  _getTripPoints() {
    switch(this._currentSortType) {
      case SortType.DEFAULT:
        return this._tripPointsModel.getTripPoints().slice().sort(sortByDateUp);
      case SortType.SORT_BY_PRICE_DOWN:
        return this._tripPointsModel.getTripPoints().slice().sort(sortByPriceDown);
      case SortType.SORT_BY_TIME_DOWN:
        return this._tripPointsModel.getTripPoints().slice().sort(sortByTimeDown);
    }
    // а этот return на случай, если мы хотим получить вообще НЕотсортированные данные
    return this._tripPointsModel.getTripPoints();
  }

  _getOffers() {
    return this._offersModel.getOffers();
  }

  _getDestinations() {
    return this._destinationsModel.getDestinations();
  }

  // объявим метод обработки события ЛЮБОГО изменения(типа события, направления, дат, цены, доп.предложений) точки маршрута
  // Это и есть ИЗМЕНЕНИЕ ДАННЫХ в ответ на действия ПОЛЬЗОВАТЕЛЯ.
  // _handleTripPointChange(updatedTripPoint) {
  //   this._tripPointPresenters[updatedTripPoint.id].init(updatedTripPoint/*, this._eventTypeToOffersMap, this._destinations*/);
  // }

  // заменим метод _handleTripPointChange на обработчик ЛЮБОГО пользовательского действия (пока непонятно как это возможно,
  // слишком абстрактно звучит...)
  // Что касается параметров метода, то они такие:
  // actionType - действие пользователя, нужно чтобы понять, какой метод модели вызвать
  // updateType - тип изменений, нужно чтобы понять, что после нужно обновить
  // update - обновленные данные для передачи в модель
  _handleViewAction(actionType, updateType, update) {
    // делаем вилку вызовов методов модели в зависимости от действий пользователя (у нас их всего 3)
    switch(actionType) {
      case UserAction.UPDATE_TRIP_POINT:
        this._tripPointsModel.updateTripPoint(updateType, update);
        break;
      case UserAction.ADD_TRIP_POINT:
        this._tripPointsModel.addTripPoint(updateType, update);
        break;
      case UserAction.DELETE_TRIP_POINT:
        this._tripPointsModel.deleteTripPoint(updateType, update);
        break;
    }
  }

  // и по аналогии с методом _handleViewAction объявим метод _handleModelEvent, который будет обрабатывать события
  // модели, но параметры будут отличаться:
  // updateType - тип изменений
  // data - обновленные данные для передачи во вьюхи
  _handleModelEvent(updateType, data) {
    // здесь также делаем вилку, но теперь уже это вилка вызовов презентера в зависимости от событий модели
    // (у нас их всего 3)
    switch(updateType) {
      case UpdateType.PATCH:
        // в данной ветке мы будем делать самое мелкое обновление, а именно обновление какой-то одной точки маршрута
        // по ID из данных модели находим соответствующий презентер точки маршрута и вызываем у него метод init с новыми
        // данными (под капотом метод всё, что нужно обновит)
        this._tripPointPresenters[data.id].init(data);
        break;
      case UpdateType.MINOR:
        // в данной ветке мы будем делать минорное (более крупное чем PATCH) обновление,
        // а именно обновление всего списка точек маршрута
        this._clearTripBoard();
        this._renderTripBoard();
        break;
      case UpdateType.MAJOR:
        // в данной ветке мы будем делать самое большое мажорное обновление,
        // а именно обновление всей доски точек маршрута (то есть список точек + сортировка)
        this._clearTripBoard({ resetSortType: true });
        this._renderTripBoard();
        break;
    }
  }

  // объявим метод очистки доски точек маршрута
  // он будет уметь не только очищать список точек маршрута (это нужно перед перерисовкой списка), но и при необходимости
  // сбрасывать в default сортировку
  // в параметре метода есть хитрость: по умолчанию мы передаём в него пустой объект, через деструктуризацию достаём оттуда
  // свойство resetSortType (которое по умолчанию undefined, потому что его в принципе нет в пустом объекте)
  // и тут же по умолчанию присваиваем ему значение false, а если при вызове этого метода мы туда явно передадим объект,
  // в котором будет resetSortType со значением true, то именно это значение и будет в итоге у этого свойства
  _clearTripBoard({ resetSortType = false} = {}) {
    Object
      // получаем все презентеры точек маршрута
      .values(this._tripPointPresenters)
      // у каждого дёргаем метод destroy для полного удаления компонента
      .forEach((tripPointPresenter) => tripPointPresenter.destroy());
    // перезаписываем объект, в котором хранились презентеры точек маршрута пустым объектом
    this._tripPointPresenters = {};

    // удаляем сортировку и заглушку на случай отсутствия точек маршрута в нашем списке
    remove(this._sortComponent);
    remove(this._noTripPointsComponent);

    // делаем проверку флага resetSortType и если надо сбрасываем сортировку
    if (resetSortType) {
      this._currentSortType = SortType.DEFAULT;
    }
  }

  // объявим метод для обработки изменения режима (просмотр/редактирование точки маршрута)
  // логика в том, что этот метод должен вызываться тогда, когда мы хотим перейти в режим редактирования точки маршрута
  // его задача: переключить все вьюхи в режим чтения (карточки точки маршрута), что позволит нам избежать ситуации,
  // когда у нас уже открыта какая-то точка маршрута в режиме редактирования и мы входим в режим редактироания на другой
  // точке маршрута и у нас одновременно получается > 1 формы редактирования, чего по условиям в ТЗ быть НЕ должно
  _handleModeChange() {
    Object.values(this._tripPointPresenters).forEach((tripPointPresenter) => tripPointPresenter.resetView());
  }

  // объявим метод для обработки события смены сортировки списка точек маршрута
  // метод должен быть приватным, так как мы будем передавать его в качестве коллбэка для подписки на клик во вьюхе сортировки
  _handleSortTypeChange(sortType) {
    // сделаем проверку на случай, если у нас текущая сортировка соответствует выбираемой пользователем
    // и в этом случае НЕ будем ничего делать - зачем нам лишняя перерисовка?
    if (this._currentSortType === sortType) {
      return;
    }

    // теперь при наступлении события выбора сортировки пользователем в случае, если сортировка отличается от текущей
    // 1) присваиваем новое значение сортировки соответствующему свойству презентера (это значение понадобится при получении
    // данных о точках маршрута из их модели)
    this._currentSortType = sortType;
    // 2) производим очистку списка точек маршрута
    this._clearTripBoard({resetSortType: true});
    // 3) отрисовываем по-новой список точек маршрута
    this._renderTripBoard();
    // p.s. В каких-то случаях оптимальнее было бы переставлять DOM-элементы,
    // но в нашем случае со слов авторов курса проще всё грохнуть и тупо перерисовать (думаю, что если бы списки
    // были огромные, то вряд ли это было бы оптимальным решением).
  }

  // Метод для рендеринга сортировки
  _renderSort() {
    // добавляем логику, которая позволит нам гарантировать, что у нас на момент создания компонента сортировки
    // этого самого компонента нет
    if (this._sortComponent !== null) {
      this._sortComponent = null;
    }

    this._sortComponent = new SortView(this._currentSortType);
    // воспользуемся публичным интерфейсом вьюхи сортировки и подпишем коллбэк,
    // в котором будет вся логика сортировки,на клик
    this._sortComponent.setSortTypeChangeHandler(this._handleSortTypeChange);
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
    // при создании экземпляра презентера точки маршрута будем передавать ему в конструктор метод для обновления данных
    // и метод для обработки изменения режима просмотра/редактирования
    // возможно здесь идёт речь о внедрении зависимости (dependency injection), но это не точно...
    const tripPointPresenter = new TripPointPresenter(this._tripPointsListComponent, this._handleViewAction, this._handleModeChange);
    tripPointPresenter.init(tripPoint, eventTypeToOffersMap, destinations);
    this._tripPointPresenters[tripPoint.id] = tripPointPresenter;
  }


  // Метод для рендеринга заглушки
  _renderNoTripPoints() {
    render(this._tripPointsListComponent, this._noTripPointsComponent, RenderPosition.AFTERBEGIN);
  }

  // Метод для отрисовки "полезной" части доски - сортировки - точек маршрута
  _renderTripBoard() {
    const tripPoints = this._getTripPoints();
    const eventOffers = this._getOffers();
    const destinations = this._getDestinations();
    // отрисуем заглушку на случай, если у нас пока нет ни одной точки маршрута (в ТЗ вроде бы ничего не сказано, надо
    // ли рисовать эту заглушку в случае, когда после применения того или иного фильтра в списке ничего не отображается)
    if (tripPoints.length === 0) {
      this._renderNoTripPoints();
      return;
    }

    // отрисуем сортировку
    this._renderSort();

    // отрисуем точки маршрута
    tripPoints.forEach((tripPoint) => this._renderTripPoint(tripPoint, eventOffers, destinations));
  }
}
