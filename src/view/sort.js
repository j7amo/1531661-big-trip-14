import AbstractView from './abstract.js';
import { SortType } from '../const.js';

// Добавим в разметку data-аттрибуты, чтобы при клике можно было определить по какой именно сортировке кликнул юзверь
// p.s. этот вариант локализации клика предлагается в демо-проекте. Так как любая задача как правило
// имеет несколько вариантов решений, то в этом конкретном случае клик можно локализовать, например, по классу.
const createSortTemplate = (currentSortType) => {
  return `<form class="trip-events__trip-sort  trip-sort" action="#" method="get">
    <div class="trip-sort__item  trip-sort__item--day">
      <input id="sort-day" class="trip-sort__input  visually-hidden" type="radio" name="trip-sort" value="sort-day" ${currentSortType === SortType.DEFAULT ? 'checked' : ''}>
      <label class="trip-sort__btn" data-sort-type="${SortType.DEFAULT}" for="sort-day">Day</label>
    </div>

    <div class="trip-sort__item  trip-sort__item--event">
      <input id="sort-event" class="trip-sort__input  visually-hidden" type="radio" name="trip-sort" value="sort-event" disabled>
      <label class="trip-sort__btn" for="sort-event">Event</label>
    </div>

    <div class="trip-sort__item  trip-sort__item--time">
      <input id="sort-time" class="trip-sort__input  visually-hidden" type="radio" name="trip-sort" value="sort-time" ${currentSortType === SortType.SORT_BY_TIME_DOWN ? 'checked' : ''}>
      <label class="trip-sort__btn" data-sort-type="${SortType.SORT_BY_TIME_DOWN}" for="sort-time">Time</label>
    </div>

    <div class="trip-sort__item  trip-sort__item--price">
      <input id="sort-price" class="trip-sort__input  visually-hidden" type="radio" name="trip-sort" value="sort-price" ${currentSortType === SortType.SORT_BY_PRICE_DOWN ? 'checked' : ''}>
      <label class="trip-sort__btn" data-sort-type="${SortType.SORT_BY_PRICE_DOWN}" for="sort-price">Price</label>
    </div>

    <div class="trip-sort__item  trip-sort__item--offer">
      <input id="sort-offer" class="trip-sort__input  visually-hidden" type="radio" name="trip-sort" value="sort-offer" disabled>
      <label class="trip-sort__btn" for="sort-offer">Offers</label>
    </div>
  </form>`;
};

export default class SortView extends AbstractView {
  // ранее мы явно не определяли конструктор в классе SortView - он неявно назначался классом-родителем AbstractView
  // теперь, так как нам надо в конструкторе засэтить дополнительные поля, то конструктор нуно явно объявить и
  // не забыть явно вызвать родительский-конструктор
  constructor(currentSortType) {
    super();

    this._currentSortType = currentSortType;
    this._handleSortTypeChange = this._handleSortTypeChange.bind(this);
  }

  getTemplate() {
    return createSortTemplate(this._currentSortType);
  }

  // далее по аналогии с организацией кода в других вьюхах объявим метод-обёртку для передаваемого снаружи(презентером)
  // коллбэка и метод, который позволяет подписать внешний коллбэк на событие клика по той или иной сортировке
  // p.s. Возможно нужно будет добавить проверку на клик именно нужного нам тэга, чтобы избежать срабатывания коллбэка
  // при клике по всему блоку сортировки, но это нужно ещё потестить - может и так будет работать нормально.
  _handleSortTypeChange(evt) {
    evt.preventDefault();
    // передаём во внешний коллбэк значение data-аттрибута того элемента, на котором произошло событие
    this._callback.sortTypeChange(evt.target.dataset.sortType);
  }

  setActiveSortChangeHandler(callback) {
    this._callback.sortTypeChange = callback;
    this.getElement().addEventListener('click', this._handleSortTypeChange);
  }
}
