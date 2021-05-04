import AbstractView from './abstract.js';
import { MenuType } from '../const.js';

const createSiteMenuTemplate = (activeMenu) => {
  return `<nav class="trip-controls__trip-tabs  trip-tabs">
    <a class="trip-tabs__btn ${(activeMenu === MenuType.TABLE) ? 'trip-tabs__btn--active' : ''}" href="#" data-menu-type="${MenuType.TABLE}">Table</a>
    <a class="trip-tabs__btn ${(activeMenu === MenuType.STATS) ? 'trip-tabs__btn--active' : ''}" href="#" data-menu-type="${MenuType.STATS}">Stats</a>
  </nav>`;
};

export default class SiteMenuView extends AbstractView {
  constructor(activeMenu) {
    super();
    this._activeMenu = activeMenu;
    this._handleActiveMenuChange = this._handleActiveMenuChange.bind(this);
  }
  getTemplate() {
    return createSiteMenuTemplate(this._activeMenu);
  }

  _handleActiveMenuChange(evt) {
    evt.preventDefault();
    this._callback.menuChange(evt.target.dataset.menuType);
  }

  setActiveMenuChangeHandler(callback) {
    this._callback.menuChange = callback;
    this.getElement().addEventListener('click', this._handleActiveMenuChange);
  }
}
