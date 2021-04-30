import { replace, remove, render, RenderPosition} from '../utils/render.js';
import { UpdateType } from '../const.js';
import FiltersView from '../view/filters.js';

export default class FiltersPresenter {
  constructor(filtersContainer, filtersModel) {
    this._filtersContainer = filtersContainer;
    this._filtersModel = filtersModel;
    this._filtersComponent = null;

    this._handleModelEvent = this._handleModelEvent.bind(this);
    this._handleActiveFilterChange = this._handleActiveFilterChange.bind(this);

    this._filtersModel.addObserver(this._handleModelEvent);
  }

  init() {
    const prevFiltersComponent = this._filtersComponent;
    this._filtersComponent = new FiltersView(this._filtersModel.getFilter());
    this._filtersComponent.setActiveFilterChangeHandler(this._handleActiveFilterChange);

    if (prevFiltersComponent === null) {
      render(this._filtersContainer, this._filtersComponent, RenderPosition.BEFOREEND);
      return;
    }

    replace(this._filtersComponent, prevFiltersComponent);
    remove(prevFiltersComponent);
  }

  _handleModelEvent() {
    this.init();
  }

  _handleActiveFilterChange(activeFilter) {
    if (this._filtersModel.getFilter() === activeFilter) {
      return;
    }

    this._filtersModel.setFilter(UpdateType.MAJOR, activeFilter);
  }
}
