import { replace, remove, render, RenderPosition} from '../utils/render.js';
import { UpdateType } from '../const.js';
import SiteMenuView from '../view/site-menu.js';

export default class SiteMenuPresenter {
  // в конструктор традиционно передаём контейнер
  // а также модель меню (в которой храним текущий выбранный пункт меню) и модель сортировки (чтобы её
  // сбрасывать в default при смене активного пункта меню)
  constructor(menuContainer, menuModel, sortModel) {
    this._menuContainer = menuContainer;
    this._menuModel = menuModel;
    this._sortModel = sortModel;
    this._menuComponent = null;

    this._handleModelEvent = this._handleModelEvent.bind(this);
    this._handleActiveMenuChange = this._handleActiveMenuChange.bind(this);

    this._menuModel.addObserver(this._handleModelEvent);
  }

  init() {
    const prevMenuComponent = this._menuComponent;
    this._menuComponent = new SiteMenuView(this._menuModel.getMenu());
    this._menuComponent.setActiveMenuChangeHandler(this._handleActiveMenuChange);

    if (prevMenuComponent === null) {
      render(this._menuContainer, this._menuComponent, RenderPosition.BEFOREEND);
      return;
    }

    replace(this._menuComponent, prevMenuComponent);
    remove(prevMenuComponent);
  }

  _handleModelEvent() {
    this.init();
  }

  _handleActiveMenuChange(activeMenu) {
    if (this._menuModel.getMenu() === activeMenu) {
      return;
    }
    // по ТЗ сортировка при смене пунктов меню должна сбрасываться
    this._sortModel.setSort(UpdateType.MAJOR, null, true);
  }
}