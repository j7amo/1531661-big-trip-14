import AbstractView from './abstract.js';

const createLoadingTemplate = () => {
  return `<li class="trip-events__item">
    <p class="trip-events__msg">
    Loading...
    </p>
  </li>`;
};

export default class LoadingView extends AbstractView {
  getTemplate() {
    return createLoadingTemplate();
  }
}
