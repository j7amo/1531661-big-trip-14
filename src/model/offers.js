import Observer from '../utils/observer';

export default class OffersModel extends Observer {
  constructor() {
    super();
    this._offers = {};
  }

  getOffers() {
    return this._offers;
  }

  setOffers(offers) {
    this._offers = new Map(offers);
  }

  static adaptToClient (offers) {
    return new Map(offers.map((offer) => [offer.type, offer]));
  }

  static adaptToServer (offers) {
    return Array.from(offers.values());
  }
}
