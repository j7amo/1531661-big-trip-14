import { createNewElement } from '../utils/render.js';

// абстрактный родительский класс для всех ВЬЮХ
// вьюхи, судя по тому материалу, который был дан на первых 5 лайвах, будут "тупыми" и только будут уметь:
// 1) отрисовать себя(то есть дать утилитарному методу render готовый DOM-элемент = разметка с данными).
// 2) сообщить презентеру о пользовательском событии.
export default class Abstract {
  constructor() {
    if (new.target === Abstract) {
      throw new Error('Can\'t instantiate abstract class');
    }
    this._element = null;
    // добавляем новое свойство, в котором будем хранить переданные коллбэки
    // (видимо, для последующего удаления обработчиков)
    this._callback = {};
  }
  // получение разметки с подставленными данными
  getTemplate() {
    throw new Error('Abstract method not implemented: getTemplate');
  }
  // получение DOM-элемента на основе полученной ранее разметки
  getElement() {
    if (!this._element) {
      this._element = createNewElement(this.getTemplate());
    }

    return this._element;
  }

  removeElement() {
    this._element = null;
  }
  // в абстрактном классе не объявляем никаких методов по теме регистрации подписчиков, так как
  // в дочерних классах методы будут иметь разные названия
}
