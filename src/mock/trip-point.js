import { getRandomInt, getRandomElement, getFixedLengthArrayOfRandomElements } from '../util.js';
import { dayjs } from 'dayjs';

const DESCRIPTION_NUMBER_START = 1;
const DESCRIPTION_NUMBER_END = 5;
const OFFER_NUMBER_START = 1;
const OFFER_NUMBER_END = 5;
const MIN_PHOTO_NUMBER = 1;
const MAX_PHOTO_NUMBER = 1000000;
const MOCK_PHOTO_URL = 'http://picsum.photos/248/152?r=';
const MIN_PHOTOS_LENGTH = 1;
const MAX_PHOTOS_LENGTH = 5;
const PRICE_MIN = 10;
const PRICE_MAX = 1000;
const ID_MIN_NUMBER = 1;
const ID_MAX_NUMBER = 100;
const DATE_MIN_NUMBER = -7;
const DATE_CURRENT_NUMBER = 0;
const DATE_MAX_NUMBER = 7;

const tripPointTypes = [
  'taxi',
  'bus',
  'train',
  'ship',
  'transport',
  'drive',
  'flight',
  'check-in',
  'sightseeing',
  'restaurant',
];

const tripPointDestinations = [
  'Khimki',
  'Mitino',
  'Reutov',
  'Solnechnogorsk',
  'Klin',
  'Dzerzhinsky',
  'Dmitrov',
  'Mitischy',
  'Ramenskoye',
];

const tripPointAboutDescriptions = [
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
  'Cras aliquet varius magna, non porta ligula feugiat eget.',
  'Fusce tristique felis at fermentum pharetra.',
  'Aliquam id orci ut lectus varius viverra.',
  'Nullam nunc ex, convallis sed finibus eget, sollicitudin eget ante.',
  'Phasellus eros mauris, condimentum sed nibh vitae, sodales efficitur ipsum.',
  'Sed blandit, eros vel aliquam faucibus, purus ex euismod diam, eu luctus nunc ante ut dui.',
  'Sed sed nisi sed augue convallis suscipit in sed felis.',
  'Aliquam erat volutpat.',
  'Nunc fermentum tortor ac porta dapibus.',
  'In rutrum ac purus sit amet tempus.',
];

// генерируем фотки
const generateTripPointsPhotos = () => {
  return new Array(getRandomInt(MIN_PHOTOS_LENGTH, MAX_PHOTOS_LENGTH))
    .fill()
    .map(() => `${MOCK_PHOTO_URL}${getRandomInt(MIN_PHOTO_NUMBER, MAX_PHOTO_NUMBER)}`);
};

// функция, которая генерирует нужное количество пунктов назначения
const generateDestinations = (numberOfDestinations) => {
  const destinations = new Map();
  for (let i = 0; i < numberOfDestinations; i++) {
    const key = getRandomElement(tripPointDestinations);
    const description = getFixedLengthArrayOfRandomElements(tripPointAboutDescriptions, getRandomInt(DESCRIPTION_NUMBER_START, DESCRIPTION_NUMBER_END)).join('');
    const photos = generateTripPointsPhotos();
    if (destinations.has(key)) {
      continue;
    }
    destinations.set(
      key,
      {
        description: `${key}, ${description}`,
        name: `${key}`,
        pictures: photos.map((photo) => ({
          src: `${photo}`,
          description: `Photo of ${key}`,
        })),
      });
  }
  return destinations;
};

//функция, которая генерирует офферы
const generateOffers = () => {
  const offers = new Map();
  for (let i = 0; i < tripPointTypes.length; i++) {
    const key = tripPointTypes[i];
    offers.set(
      key,
      {
        type: `${key}`,
        offers: new Array(getRandomInt(OFFER_NUMBER_START, OFFER_NUMBER_END)).
          fill().
          map(() => ({
            title: getRandomElement(tripPointAboutDescriptions),
            price: getRandomInt(PRICE_MIN, PRICE_MAX),
          })),
      });
  }
  return offers;
};

// генерируем точки маршрута
export const generateTripPoints = (numberOfTripPoints) => {
  const tripPoints = new Map();
  const destinations = generateDestinations(tripPointDestinations.length);
  const offers = generateOffers();
  for (let i = 0; i < numberOfTripPoints; i++) {
    const id = getRandomInt(ID_MIN_NUMBER, ID_MAX_NUMBER);
    if (tripPoints.has(id)) {
      i--;
      continue;
    }
    tripPoints.set(
      id,
      {
        price: getRandomInt(PRICE_MIN, PRICE_MAX),
        beginDate: dayjs().add(getRandomInt(DATE_MIN_NUMBER, DATE_MAX_NUMBER), 'day').toDate(),
        endDate: dayjs(this.beginDate).add(getRandomInt(DATE_CURRENT_NUMBER, DATE_MAX_NUMBER), 'day').toDate(),
        destination: destinations.get(getRandomElement(tripPointDestinations)),
        id: `${id}`,
        isFavorite: Boolean(getRandomInt()),
        offers: offers.get(getRandomElement(tripPointTypes)),
        type: this.offers.type,
      });
  }
  return tripPoints;
};
