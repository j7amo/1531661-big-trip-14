import { replace, remove, render, RenderPosition} from '../utils/render.js';
import { UpdateType } from '../const.js';
import SortView from '../view/sort.js';

export default class SortPresenter {
  constructor(sortContainer, sortModel) {
    this._sortContainer = sortContainer;
    this._sortModel = sortModel;
    this._sortComponent = null;

    this._handleModelEvent = this._handleModelEvent.bind(this);
    this._handleActiveSortChange = this._handleActiveSortChange.bind(this);

    this._sortModel.addObserver(this._handleModelEvent);
  }

  init() {
    const prevSortComponent = this._sortComponent;
    this._sortComponent = new SortView(this._sortModel.getSort());
    this._sortComponent.setActiveSortChangeHandler(this._handleActiveSortChange);

    if (prevSortComponent === null) {
      render(this._sortContainer, this._sortComponent, RenderPosition.AFTERBEGIN);
      return;
    }

    replace(this._sortComponent, prevSortComponent);
    remove(prevSortComponent);
  }

  destroy() {
    remove(this._sortComponent);
  }

  _handleModelEvent() {
    this.init();
  }

  _handleActiveSortChange(activeSort) {
    if (this._sortModel.getSort() === activeSort) {
      return;
    }

    this._sortModel.setSort(UpdateType.MAJOR, activeSort);
  }
}
