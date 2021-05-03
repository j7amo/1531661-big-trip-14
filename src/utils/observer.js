// в этом модуле создадим отдельный класс Observer, он нам понадобится для реализации паттерна "Наблюдатель"
// так как у нас несколько моделей и все они по идее должны реализовать этот паттерн, то чтобы не дублировать код
// будем наследовать от ЭТОГО класса
export default class Observer {
  constructor() {
    // в конструкторе объявим свойство, в котором будем хранить всех наблюдателей (подписчиков?)
    // хранить будем в массиве, так как это самый примитивный способ, в API есть удобные методы для перебора элементов
    // массива, добавления элемента в массив. Что касается удаления, то имхо оно в массивах реализовано через одно место,
    // но тоже возможно (привет, splice!)
    this._observers = [];
  }

  // теперь методы Наблюдателя:
  // 1) объявим метод для добавления наблюдателя (подписчика) в массив наблюдателей
  // это публичный метод, так как им будут пользоваться другие компоненты (очевидно, речь о презентере,
  // так как вьюхи напрямую не взаимодействуют с моделью в MVP)
  addObserver(observer) {
    this._observers.push(observer);
  }

  // 2) по аналогии объявим публичный метод для удаления наблюдателя
  // тут хочется обратить внимание на интересный подход к удалению элемента массива, предложенный Академией:
  // вместо splice используется filter, который возвращает НОВЫЙ массив элементов, для которых выполняется переданное условие
  removeObserver(observer) {
    this._observers = this._observers.filter((existingObserver) => existingObserver !== observer);
  }

  // 3) объявим ПРИВАТНЫЙ метод для оповещения всех подписанных наблюдателей
  // тут нужно дополнительно порассуждать:
  // - ПРИВАТНЫЙ потому, что этот метод снаружи никто не должен использовать, это чисто внутренняя логика Наблюдателя
  // - наблюдателЕЙ потому, что их м.б. > 1 (с одним событием модели м.б. связано > 1 коллбэка, которые и являются наблюдателями)
  // Что касается самого механизма оповещения наблюдателей (коллбэков), то речь идёт о вызове этих самых коллбэков
  // с аргументами метода _notify (видимо, для проброса этой информации дальше в презентер)
  _notify(event, payload) {
    // примечание: с аргументами метода _notify ещё предстоит разобраться - если с event ещё более-менее понятно,
    // то что такое payload - хз
    this._observers.forEach((existingObserver) => existingObserver(event, payload));
  }
}
