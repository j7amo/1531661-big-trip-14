// опишем абстракцию хранилища (проектируем так, чтобы можно было использовать любое совместимое
// с точки зрения интерфейса хранилище), для этого вопсользуемся dependency injection и передадим зависимость (хранилище)
// в конструктор при создании экземпляра нашей абстракции хранилища
export default class Store {
  constructor(key, storage) {
    this._storage = storage;
    this._storeKey = key;
  }

  // опишем метод для получения данных из хранилища
  // для этого воспользуемся API объекта Storage(получим хранилище по ключу - getItem) и API JSON (распарсим JSON в JS-объект)
  // примечание: для того, чтобы в случае ошибки, например, отсутствия доступа к кэшу или ещё какой-то проблемы при попытке
  // считать закэшированные данные у нас приложение не "упало" будем возвращать пустой объект (вместо undefined)
  getItems() {
    try {
      return JSON.parse(this._storage.getItem(this._storeKey)) || {};
    } catch (err) {
      return {};
    }
  }

  // опишем метод для записи данных в хранилище, для этого также используем Storage API и его метод setItem
  // 1) ключом будет передаваемый в конструктор экземпляра Store ключ
  // 2) значением - JS-объект, преобразованный в JSON
  setItems(items) {
    this._storage.setItem(
      this._storeKey,
      JSON.stringify(items),
    );
  }

  // далее объявим одноимённый, НО свой метод setItem - это будет уже метод нашего класса Store (но работать будет на
  // Storage API)
  // на вход передаём ключ и значение
  setItem(key, value) {
    // достаём объект из хранилища
    const store = this.getItems();

    // записываем обратно в хранилище объект, предварительно добавив в него новую запись
    this._storage.setItem(
      this._storeKey,
      JSON.stringify(
        Object.assign({}, store, {
          [key]: value,
        }),
      ),
    );
  }

  // далее объявим метод, который позволит нам удалять из хранилища ненужные данные по ключу
  removeItem(key) {
    // достаём объект из хранилища
    const store = this.getItems();

    // удаляем из объекта свойство по ключу (соответственно удалится и значение)
    delete store[key];

    // записываем обратно в хранилище изменённые данные
    this._storage.setItem(
      this._storeKey,
      JSON.stringify(store),
    );
  }
}
