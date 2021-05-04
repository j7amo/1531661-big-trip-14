// заведём отдельную модель для фильтров
// здесь будем хранить, менять значение текущего фильтра и оповещать наблюдателей (какой-нибудь презентер)
import Observer from '../utils/observer.js';
import { MenuType } from '../const.js';

export default class MenuModel extends Observer {
  constructor() {
    super();
    this._activeMenu = MenuType.TABLE;
  }

  setMenu(updateType, activeMenu) {
    this._activeMenu = activeMenu;
    this._notify(updateType, activeMenu);
  }

  getMenu() {
    return this._activeMenu;
  }
}
