import Observer from '../utils/observer.js';
import { MenuType } from '../const.js';

export default class MenuModel extends Observer {
  constructor() {
    super();
    this._activeMenu = MenuType.TABLE;
  }

  getMenu() {
    return this._activeMenu;
  }

  setMenu(updateType, activeMenu) {
    this._activeMenu = activeMenu;
    this._notify(updateType, activeMenu);
  }
}
