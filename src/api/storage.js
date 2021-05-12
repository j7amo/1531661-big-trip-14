export default class Storage {
  constructor(key, storage) {
    this._storage = storage;
    this._storeKey = key;
  }

  getItems() {
    try {
      return JSON.parse(this._storage.getItem(this._storeKey)) || {};
    } catch (err) {
      return {};
    }
  }

  setItems(items) {
    this._storage.setItem(
      this._storeKey,
      JSON.stringify(items),
    );
  }

  setItem(key, value) {
    const storage = this.getItems();

    this._storage.setItem(
      this._storeKey,
      JSON.stringify(
        Object.assign({}, storage, {
          [key]: value,
        }),
      ),
    );
  }

  removeItem(key) {
    const storage = this.getItems();
    delete storage[key];

    this._storage.setItem(
      this._storeKey,
      JSON.stringify(storage),
    );
  }
}
