import Observer from '../utils/observer.js';
import { SortType } from '../const.js';

export default class SortModel extends Observer {
  constructor() {
    super();
    this._activeSort = SortType.DEFAULT;
  }

  getSort() {
    return this._activeSort;
  }

  setSort(updateType, sort, sortReset) {
    if (sortReset) {
      this._activeSort = SortType.DEFAULT;
      this._notify(updateType, this._activeSort);
    } else {
      this._activeSort = sort;
      this._notify(updateType, sort);
    }
  }
}
