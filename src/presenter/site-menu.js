import { replace, remove, render, RenderPosition} from '../utils/render.js';
import { UpdateType, MenuType } from '../const.js';
import SiteMenuView from '../view/site-menu.js';

export default class SiteMenuPresenter {
  // в конструктор традиционно передаём контейнер
  // а также модель меню (в которой храним текущий выбранный пункт меню) и модель сортировки (чтобы её
  // сбрасывать в default при смене активного пункта меню)
  constructor(menuContainer, menuModel, sortModel, switchTableStatsTabs) {
    this._menuContainer = menuContainer;
    this._menuModel = menuModel;
    this._sortModel = sortModel;
    this._switchTableStatsTabs = switchTableStatsTabs;
    this._menuComponent = null;

    this._handleModelEvent = this._handleModelEvent.bind(this);
    this._handleMenuClick = this._handleMenuClick.bind(this);

    this._menuModel.addObserver(this._handleModelEvent);
  }

  init() {
    const prevMenuComponent = this._menuComponent;
    this._menuComponent = new SiteMenuView(this._menuModel.getMenu());
    this._menuComponent.setMenuClickHandler(this._handleMenuClick);

    if (prevMenuComponent === null) {
      render(this._menuContainer, this._menuComponent, RenderPosition.BEFOREEND);
      return;
    }

    replace(this._menuComponent, prevMenuComponent);
    remove(prevMenuComponent);
    console.log('разметка компонента МЕНЮ:');
    console.log(this._menuComponent.getTemplate());
  }

  _handleModelEvent() {
    this.init();
  }

  _handleMenuClick(activeMenu) {
    console.log('внутри _handleMenuClick презентера');
    if (this._menuModel.getMenu() === activeMenu) {
      console.log('внутри if так как выбранный пункт меню такой же как в модели');
      return;
    }
    this._switchTableStatsTabs(activeMenu);
    this._menuModel.setMenu(UpdateType.MAJOR, activeMenu);
    // по ТЗ сортировка при смене пунктов меню должна сбрасываться
    this._sortModel.setSort(UpdateType.MAJOR, null, true);
  }
}
