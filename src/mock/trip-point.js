import { getRandomInt, getRandomElement, getFixedLengthArrayOfRandomElements } from '../util.js';

const DESCRIPTION_NUMBER_START = 1;
const DESCRIPTION_NUMBER_END = 5;
const MIN_PHOTO_NUMBER = 1;
const MAX_PHOTO_NUMBER = 1000000;
const MOCK_PHOTO_URL = 'http://picsum.photos/248/152?r=';
const MIN_PHOTOS_LENGTH = 1;
const MAX_PHOTOS_LENGTH = 5;

const tripPointTypes = [
  'Taxi',
  'Bus',
  'Train',
  'Ship',
  'Transport',
  'Drive',
  'Flight',
  'Check-in',
  'Sightseeing',
  'Restaurant',
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

const generateTripPointsPhotos = () => {
  return new Array(getRandomInt(MIN_PHOTOS_LENGTH, MAX_PHOTOS_LENGTH))
    .fill()
    .map(() => `${MOCK_PHOTO_URL}${getRandomInt(MIN_PHOTO_NUMBER, MAX_PHOTO_NUMBER)}`);
};

export const generateTripPoint = () => {
  return {
    type: getRandomElement(tripPointTypes),
    destination: getRandomElement(tripPointDestinations),
    extras: undefined,
    about: {
      description: getFixedLengthArrayOfRandomElements(tripPointAboutDescriptions, getRandomInt(DESCRIPTION_NUMBER_START, DESCRIPTION_NUMBER_END)),
      photos: generateTripPointsPhotos(),
    },
  };
};

