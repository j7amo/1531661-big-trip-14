// в этом модуле опишем API взаимодействия с сервером
// заведём перечисление для типов используемых методов HTTP-запросов
const Method = {
  GET: 'GET',
  PUT: 'PUT',
};

// заведём перечисление для максимального и минимального значения статуса HTTP-запроса (это нужно для fetch, так как
// статусы 4хх и 5хх для него не ошибочны и нам нужно явно обрисовать "успешный" диапазон)
const SuccessHTTPStatusRange = {
  MIN: 200,
  MAX: 299,
};

// объявляем сам класс API
export default class Api {
  // endPoint - это общий URL, на который мы будем стучаться, предварительно "склеивая" его с локальными URL-"разделами"
  // authorization - это значение, которое мы будем передавать в специальном заголовке
  // Authorization для того, что сервер нас узнавал и мы могли работать именно с нашими данными
  constructor(endPoint, authorization) {
    this._endPoint = endPoint;
    this._authorization = authorization;
  }

  // далее в методах получения данных с сервера мы будем использовать приватный метод _load
  // объявим метод для получения точек маршрута с сервера
  getTripPoints() {
    return this._load({url: 'points'})
      .then(Api.toJSON);
  }
  // объявим метод для получения офферов с сервера
  getOffers() {
    return this._load({url: 'offers'})
      .then(Api.toJSON);
  }
  // объявим метод для получения направлений с сервера
  getDestinations() {
    return this._load({url: 'destinations'})
      .then(Api.toJSON);
  }

  // метод обновления точки маршрута на сервере на основании имеющихся в модели точек маршрута данных
  updateTripPoint(tripPoint) {
    return this._load({
      url: `points/${tripPoint.id}`,
      method: Method.PUT,
      body: JSON.stringify(tripPoint),
      headers: new Headers({'Content-Type': 'application/json'}),
    })
      .then(Api.toJSON);
  }

  // в приватном методе _load мы будем на вход подавать
  // - URL сервера,
  // - метод (по умолчанию будет GET, другие методы можно будет вызывать при их явной передаче в метод _load),
  // - тело запроса (по умолчанию null),
  // - заголовки(по умолчанию пустой экземпляр, в который мы чуть ниже в коде делаем добавление заголовков через append)
  _load({
    url,
    method = Method.GET,
    body = null,
    headers = new Headers(),
  }) {
    headers.append('Authorization', this._authorization);
    // метод _load по сути является конфигурирующим методом, так как принимает на вход параметры "настроек",
    // всю реальную работу по общению с сервером будет делать встроенный метод ЖабаСкрипта fetch.
    return fetch(
      // как мы помним, метод fetch ("забрать", "принести", "сходить и взять") первым аргументом принимает URL
      `${this._endPoint}/${url}`,
      // а далее опционально можно ему передать конфигурацию ( в нашем случае пробрасываем ему из _load'а метод запроса,
      // тело запроса и заголовки)
      {method, body, headers},
    )
      // в результате работы метода _load мы не просто возвращаем результат работы метода fetch (а это как мы помним - промис),
      // а промис, который будет получен после того, как отработают сценарии:
      // - THEN (в случае, если промис, полученный из fetch resolve'ится)
      // - CATCH (в случае, если промис, полученный из fetch reject'ится)
      .then(Api.checkStatus)
      .catch(Api.catchError);
  }

  // объявим статический метод, который будет анализировать объект ответа сервера с точки зрения статуса
  static checkStatus(response) {
    if (
      response.status < SuccessHTTPStatusRange.MIN ||
      response.status > SuccessHTTPStatusRange.MAX
    ) {
      throw new Error(`${response.status}: ${response.statusText}`);
    }

    return response;
  }

  // объявим статический метод, который будет из объекта ответа получать массив данных для дальнейшей работы с ним
  static toJSON(response) {
    return response.json();
  }

  // объявим статический метод, который будет пробрасывать дальше ошибку (в случае сценария CATCH)
  static catchError(err) {
    throw err;
  }
}
