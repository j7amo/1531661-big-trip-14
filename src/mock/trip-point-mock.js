import { getRandomInt, getRandomElement, getFixedLengthArrayOfRandomElements } from '../utils/common.js';
import dayjs from 'dayjs';
import nanoid from 'nanoid';

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
const DATE_MIN_NUMBER = -7;
const DATE_CURRENT_NUMBER = 0;
const DATE_MAX_NUMBER = 7;
const MINUTES_MIN_NUMBER = 30;
const MINUTES_MAX_NUMBER = 300;

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
  'Moscow',
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
const generateDestinations = () => {
  const destinations = new Map();
  for (let i = 0; i < tripPointDestinations.length; i++) {
    const key = tripPointDestinations[i];
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
const generateTripPoints = (numberOfTripPoints, destinations, eventTypeToOffersMap) => {
  const tripPoints = new Map();
  //const uniqueIds = new Set();
  for (let i = 0; i < numberOfTripPoints; i++) {
    const id = nanoid();
    // let id = i + 1;
    // while (uniqueIds.has(id)) {
    //   id += 1;
    // }
    // uniqueIds.add(id);
    const beginDate = dayjs().add(getRandomInt(DATE_MIN_NUMBER, DATE_MAX_NUMBER), 'day').toDate();
    const endDate = dayjs(beginDate).add(getRandomInt(DATE_CURRENT_NUMBER, DATE_MAX_NUMBER), 'day').add(getRandomInt(MINUTES_MIN_NUMBER, MINUTES_MAX_NUMBER),'minute').toDate();
    const type = tripPointTypes[i];
    // if (tripPoints.has(id)) {
    //   i--;
    //   continue;
    // }
    const allOffers = eventTypeToOffersMap.get(type).offers;
    const selectedOffers = getFixedLengthArrayOfRandomElements(allOffers, getRandomInt(0, allOffers.length));
    const basePrice = getRandomInt(PRICE_MIN, PRICE_MAX);
    let selectedOffersPrice = 0;
    selectedOffers.forEach((offer) => {
      selectedOffersPrice += Number(offer.price);
    });

    tripPoints.set(
      id,
      {
        price: Number(basePrice) + Number(selectedOffersPrice),
        beginDate: beginDate,
        endDate: endDate,
        destination: destinations.get(tripPointDestinations[i]),
        id: id,
        isFavorite: Boolean(getRandomInt()),
        offers: selectedOffers,
        type: type,
      });
  }
  return tripPoints;
};

export { generateDestinations, generateOffers, generateTripPoints };
