// вьюха статистики
import AbstractSmartView from './smart-view.js';
import Chart from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { getDurationInMinutes, getDurationFormatted } from '../utils/trip-point.js';

const BASE_HEIGHT = 55;

// получим уникальные ярлыки (подписи, лейблы)
const getLabels = (tripPoints) => {
  const uniqueLabelsSet = new Set();
  // сначала пройдёмся по всем точкам маршрута, "возьмём" у них тип и добавим его в множество, которое позволяет хранить
  // только уникальные элементы (согласно спецификации)
  tripPoints.forEach((tripPoint) => uniqueLabelsSet.add(tripPoint.type.toUpperCase()));
  return Array.from(uniqueLabelsSet.values());
};

// получим сумму затрат (в ТЗ речь идёт только о тех цифрах, которые пользователь вводит в поле ввода цены, дополнительные
// офферы почему-то предлагается не учитывать)
const countSumByLabels = (tripPoints) => {
  // получаем уникальные ярлыки (типы)
  const uniqueLabels = getLabels(tripPoints);
  // сюда будем складывать суммы по типам
  const sumByLabels = [];
  // используем вложенный цикл и добавляем полученные суммы в массив сумм
  uniqueLabels.forEach((label) => {
    let sumByLabel = 0;
    tripPoints.forEach((tripPoint) => {
      if(tripPoint.type.toUpperCase() === label) {
        sumByLabel += tripPoint.price ? Number(tripPoint.price) : 0;
      }
    });
    sumByLabels.push(sumByLabel);
  });
  return sumByLabels;
};

// посчитаем количество точек маршрута каждого типа
const countTripPointsByType = (tripPoints) => {
  const uniqueLabels = getLabels(tripPoints);
  const tripPointsQuantityByLabels = [];
  uniqueLabels.forEach((label) => {
    let tripPointsQuantityByLabel = 0;
    tripPoints.forEach((tripPoint) => {
      if(tripPoint.type.toUpperCase() === label) {
        tripPointsQuantityByLabel += 1;
      }
    });
    tripPointsQuantityByLabels.push(tripPointsQuantityByLabel);
  });
  return tripPointsQuantityByLabels;
};

// посчитаем общую продолжительность по каждому типу
const countTimeSpendByType = (tripPoints) => {
  const uniqueLabels = getLabels(tripPoints);
  const timeSpendByLabels = [];
  uniqueLabels.forEach((label) => {
    let timeSpendByLabel = 0;
    tripPoints.forEach((tripPoint) => {
      if(tripPoint.type.toUpperCase() === label) {
        timeSpendByLabel += getDurationInMinutes(tripPoint);
      }
    });
    timeSpendByLabels.push(timeSpendByLabel);
  });
  return timeSpendByLabels;
};

const createMoneyChart = (moneyCtx, tripPoints) => {
  return new Chart(moneyCtx, {
    plugins: [ChartDataLabels],
    type: 'horizontalBar',
    data: {
      labels: [...getLabels(tripPoints)],
      datasets: [{
        data: [...countSumByLabels(tripPoints)],
        backgroundColor: '#ffffff',
        hoverBackgroundColor: '#ffffff',
        anchor: 'start',
      }],
    },
    options: {
      plugins: {
        datalabels: {
          font: {
            size: 13,
          },
          color: '#000000',
          anchor: 'end',
          align: 'start',
          formatter: (val) => `€ ${val}`,
        },
      },
      title: {
        display: true,
        text: 'MONEY',
        fontColor: '#000000',
        fontSize: 23,
        position: 'left',
      },
      scales: {
        yAxes: [{
          ticks: {
            fontColor: '#000000',
            padding: 5,
            fontSize: 13,
          },
          gridLines: {
            display: false,
            drawBorder: false,
          },
          barThickness: 44,
        }],
        xAxes: [{
          ticks: {
            display: false,
            beginAtZero: true,
          },
          gridLines: {
            display: false,
            drawBorder: false,
          },
          minBarLength: 50,
        }],
      },
      legend: {
        display: false,
      },
      tooltips: {
        enabled: false,
      },
    },
  });
};

const createTypeChart = (typeCtx, tripPoints) => {
  return new Chart(typeCtx, {
    plugins: [ChartDataLabels],
    type: 'horizontalBar',
    data: {
      labels: [...getLabels(tripPoints)],
      datasets: [{
        data: [...countTripPointsByType(tripPoints)],
        backgroundColor: '#ffffff',
        hoverBackgroundColor: '#ffffff',
        anchor: 'start',
      }],
    },
    options: {
      plugins: {
        datalabels: {
          font: {
            size: 13,
          },
          color: '#000000',
          anchor: 'end',
          align: 'start',
          formatter: (val) => `${val}x`,
        },
      },
      title: {
        display: true,
        text: 'TYPE',
        fontColor: '#000000',
        fontSize: 23,
        position: 'left',
      },
      scales: {
        yAxes: [{
          ticks: {
            fontColor: '#000000',
            padding: 5,
            fontSize: 13,
          },
          gridLines: {
            display: false,
            drawBorder: false,
          },
          barThickness: 44,
        }],
        xAxes: [{
          ticks: {
            display: false,
            beginAtZero: true,
          },
          gridLines: {
            display: false,
            drawBorder: false,
          },
          minBarLength: 50,
        }],
      },
      legend: {
        display: false,
      },
      tooltips: {
        enabled: false,
      },
    },
  });
};
const createTimeChart = (timeCtx, tripPoints) => {
  return new Chart(timeCtx, {
    plugins: [ChartDataLabels],
    type: 'horizontalBar',
    data: {
      labels: [...getLabels(tripPoints)],
      datasets: [{
        data: [...countTimeSpendByType(tripPoints)],
        backgroundColor: '#ffffff',
        hoverBackgroundColor: '#ffffff',
        anchor: 'start',
      }],
    },
    options: {
      plugins: {
        datalabels: {
          font: {
            size: 13,
          },
          color: '#000000',
          anchor: 'end',
          align: 'start',
          formatter: (val) => `${getDurationFormatted(val)}`,
        },
      },
      title: {
        display: true,
        text: 'TIME-SPEND',
        fontColor: '#000000',
        fontSize: 23,
        position: 'left',
      },
      scales: {
        yAxes: [{
          ticks: {
            fontColor: '#000000',
            padding: 5,
            fontSize: 13,
          },
          gridLines: {
            display: false,
            drawBorder: false,
          },
          barThickness: 44,
        }],
        xAxes: [{
          ticks: {
            display: false,
            beginAtZero: true,
          },
          gridLines: {
            display: false,
            drawBorder: false,
          },
          minBarLength: 50,
        }],
      },
      legend: {
        display: false,
      },
      tooltips: {
        enabled: false,
      },
    },
  });
};

const createStatisticsTemplate = (tripPoints) => {
  const labelCount = getLabels(tripPoints).length;
  let height;
  if (labelCount <= 1) {
    height = 2 * BASE_HEIGHT * labelCount;
  } else if (labelCount > 1 && labelCount <= 5) {
    height = 1.5 * BASE_HEIGHT * labelCount;
  } else if (labelCount > 5) {
    height = BASE_HEIGHT * labelCount;
  }

  return `<section class="statistics">
    <h2 class="visually-hidden">Trip statistics</h2>

    <div class="statistics__item statistics__item--money">
      <canvas class="statistics__chart  statistics__chart--money" width="900" height="${height}"></canvas>
    </div>

    <div class="statistics__item statistics__item--transport">
      <canvas class="statistics__chart  statistics__chart--transport" width="900" height="${height}"></canvas>
    </div>

    <div class="statistics__item statistics__item--time-spend">
      <canvas class="statistics__chart  statistics__chart--time" width="900" height="${height}"></canvas>
    </div>
  </section>`;
};

export default class StatisticsView extends AbstractSmartView {
  constructor(tripPoints) {
    super();
    this._tripPoints = tripPoints;
    this._moneyChart = null;
    this._typeChart = null;
    this._timeChart = null;
    this._setCharts();
  }

  getTemplate() {
    return createStatisticsTemplate(this._tripPoints);
  }

  _setCharts() {
    if (this._moneyChart !== null || this._typeChart !== null || this._timeChart !== null) {
      this._moneyChart = null;
      this._typeChart = null;
      this._timeChart = null;
    }

    const moneyCtx = this.getElement().querySelector('.statistics__chart--money');
    const typeCtx = this.getElement().querySelector('.statistics__chart--transport');
    const timeCtx = this.getElement().querySelector('.statistics__chart--time');

    this._moneyChart = createMoneyChart(moneyCtx, this._tripPoints);
    this._typeChart = createTypeChart(typeCtx, this._tripPoints);
    this._timeChart = createTimeChart(timeCtx, this._tripPoints);
  }
}
