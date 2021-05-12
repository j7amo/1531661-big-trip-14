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

    this._handleMenuClick = this._handleMenuClick.bind(this);
  }

  getTemplate() {
    return createSiteMenuTemplate(this._activeMenu);
  }

  setMenuClickHandler(callback) {
    this._callback.menuClick = callback;
    this.getElement().querySelectorAll('.trip-tabs__btn').forEach((child) => child.addEventListener('click', this._handleMenuClick));
  }

  _handleMenuClick(evt) {
    evt.preventDefault();
    this._callback.menuClick(evt.target.dataset.menuType);
  }
}
