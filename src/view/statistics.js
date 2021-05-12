import AbstractSmartView from './smart-view.js';
import Chart from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { getDurationInMinutes, getDurationFormatted } from '../utils/trip-point.js';

const BASE_HEIGHT = 55;

const ChartType = {
  HORIZONTAL_BAR: 'horizontalBar',
};

const ChartBackgroundColor = {
  WHITE: '#ffffff',
};

const ChartHoverBackgroundColor = {
  WHITE: '#ffffff',
};

const DATA_LABEL_FONT_SIZE = 13;
const DATASETS_ANCHOR = 'start';
const DATA_LABEL_COLOR = '#000000';
const DATA_LABEL_ANCHOR = 'end';
const DATA_LABEL_ALIGN = 'start';

const ChartTitle = {
  MONEY: 'MONEY',
  TYPE: 'TYPE',
  TIME_SPEND: 'TIME-SPEND',
};

const CHART_TITLE_FONT_COLOR = '#000000';
const CHART_TITLE_FONT_SIZE = 23;
const CHART_TITLE_POSITION = 'left';
const CHART_SCALES_FONT_COLOR = '#000000';
const CHART_SCALES_PADDING = 5;
const CHART_SCALES_FONT_SIZE = 13;
const CHART_SCALES_BAR_THICKNESS = 44;
const CHART_SCALES_MIN_BAR_LENGTH = 50;
const MIN_LABELS_COUNT = 1;
const AVERAGE_LABELS_COUNT = 5;
const MIN_LABELS_COUNT_SIZE_MULTIPLIER = 2;
const AVERAGE_LABELS_COUNT_SIZE_MULTIPLIER = 1.5;

const getLabels = (tripPoints) => {
  const uniqueLabels = new Set();
  tripPoints.forEach((tripPoint) => uniqueLabels.add(tripPoint.type.toUpperCase()));
  return Array.from(uniqueLabels.values());
};

const countSumByLabels = (tripPoints) => {
  const uniqueLabels = getLabels(tripPoints);
  const sumsByLabels = [];

  uniqueLabels.forEach((label) => {
    let sumByLabel = 0;
    tripPoints.forEach((tripPoint) => {
      if(tripPoint.type.toUpperCase() === label) {
        sumByLabel += tripPoint.price ? Number(tripPoint.price) : 0;
      }
    });
    sumsByLabels.push(sumByLabel);
  });

  return sumsByLabels;
};

const countTripPointsByType = (tripPoints) => {
  const uniqueLabels = getLabels(tripPoints);
  const tripPointsQuantitiesByLabels = [];

  uniqueLabels.forEach((label) => {
    let tripPointsQuantityByLabel = 0;
    tripPoints.forEach((tripPoint) => {
      if(tripPoint.type.toUpperCase() === label) {
        tripPointsQuantityByLabel += 1;
      }
    });
    tripPointsQuantitiesByLabels.push(tripPointsQuantityByLabel);
  });

  return tripPointsQuantitiesByLabels;
};

const countTimeSpendByType = (tripPoints) => {
  const uniqueLabels = getLabels(tripPoints);
  const timesSpendByLabels = [];

  uniqueLabels.forEach((label) => {
    let timeSpendByLabel = 0;
    tripPoints.forEach((tripPoint) => {
      if(tripPoint.type.toUpperCase() === label) {
        timeSpendByLabel += getDurationInMinutes(tripPoint);
      }
    });
    timesSpendByLabels.push(timeSpendByLabel);
  });

  return timesSpendByLabels;
};

const createMoneyChart = (moneyCtx, tripPoints) => {
  return new Chart(moneyCtx, {
    plugins: [ChartDataLabels],
    type: ChartType.HORIZONTAL_BAR,
    data: {
      labels: [...getLabels(tripPoints)],
      datasets: [{
        data: [...countSumByLabels(tripPoints)],
        backgroundColor: ChartBackgroundColor.WHITE,
        hoverBackgroundColor: ChartHoverBackgroundColor.WHITE,
        anchor: DATASETS_ANCHOR,
      }],
    },
    options: {
      plugins: {
        datalabels: {
          font: {
            size: DATA_LABEL_FONT_SIZE,
          },
          color: DATA_LABEL_COLOR,
          anchor: DATA_LABEL_ANCHOR,
          align: DATA_LABEL_ALIGN,
          formatter: (val) => `€ ${val}`,
        },
      },
      title: {
        display: true,
        text: ChartTitle.MONEY,
        fontColor: CHART_TITLE_FONT_COLOR,
        fontSize: CHART_TITLE_FONT_SIZE,
        position: CHART_TITLE_POSITION,
      },
      scales: {
        yAxes: [{
          ticks: {
            fontColor: CHART_SCALES_FONT_COLOR,
            padding: CHART_SCALES_PADDING,
            fontSize: CHART_SCALES_FONT_SIZE,
          },
          gridLines: {
            display: false,
            drawBorder: false,
          },
          barThickness: CHART_SCALES_BAR_THICKNESS,
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
          minBarLength: CHART_SCALES_MIN_BAR_LENGTH,
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
    type: ChartType.HORIZONTAL_BAR,
    data: {
      labels: [...getLabels(tripPoints)],
      datasets: [{
        data: [...countTripPointsByType(tripPoints)],
        backgroundColor: ChartBackgroundColor.WHITE,
        hoverBackgroundColor: ChartHoverBackgroundColor.WHITE,
        anchor: DATASETS_ANCHOR,
      }],
    },
    options: {
      plugins: {
        datalabels: {
          font: {
            size: DATA_LABEL_FONT_SIZE,
          },
          color: DATA_LABEL_COLOR,
          anchor: DATA_LABEL_ANCHOR,
          align: DATA_LABEL_ALIGN,
          formatter: (val) => `${val}x`,
        },
      },
      title: {
        display: true,
        text: ChartTitle.TYPE,
        fontColor: CHART_TITLE_FONT_COLOR,
        fontSize: CHART_TITLE_FONT_SIZE,
        position: CHART_TITLE_POSITION,
      },
      scales: {
        yAxes: [{
          ticks: {
            fontColor: CHART_SCALES_FONT_COLOR,
            padding: CHART_SCALES_PADDING,
            fontSize: CHART_SCALES_FONT_SIZE,
          },
          gridLines: {
            display: false,
            drawBorder: false,
          },
          barThickness: CHART_SCALES_BAR_THICKNESS,
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
          minBarLength: CHART_SCALES_MIN_BAR_LENGTH,
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
    type: ChartType.HORIZONTAL_BAR,
    data: {
      labels: [...getLabels(tripPoints)],
      datasets: [{
        data: [...countTimeSpendByType(tripPoints)],
        backgroundColor: ChartBackgroundColor.WHITE,
        hoverBackgroundColor: ChartHoverBackgroundColor.WHITE,
        anchor: DATASETS_ANCHOR,
      }],
    },
    options: {
      plugins: {
        datalabels: {
          font: {
            size: DATA_LABEL_FONT_SIZE,
          },
          color: DATA_LABEL_COLOR,
          anchor: DATA_LABEL_ANCHOR,
          align: DATA_LABEL_ALIGN,
          formatter: (val) => `${getDurationFormatted(val)}`,
        },
      },
      title: {
        display: true,
        text: ChartTitle.TIME_SPEND,
        fontColor: CHART_TITLE_FONT_COLOR,
        fontSize: CHART_TITLE_FONT_SIZE,
        position: CHART_TITLE_POSITION,
      },
      scales: {
        yAxes: [{
          ticks: {
            fontColor: CHART_SCALES_FONT_COLOR,
            padding: CHART_SCALES_PADDING,
            fontSize: CHART_SCALES_FONT_SIZE,
          },
          gridLines: {
            display: false,
            drawBorder: false,
          },
          barThickness: CHART_SCALES_BAR_THICKNESS,
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
          minBarLength: CHART_SCALES_MIN_BAR_LENGTH,
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
  if (labelCount <= MIN_LABELS_COUNT) {
    height = MIN_LABELS_COUNT_SIZE_MULTIPLIER * BASE_HEIGHT * labelCount;
  } else if (labelCount > MIN_LABELS_COUNT && labelCount <= AVERAGE_LABELS_COUNT) {
    height = AVERAGE_LABELS_COUNT_SIZE_MULTIPLIER * BASE_HEIGHT * labelCount;
  } else {
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

    const moneyCtxElement = this.getElement().querySelector('.statistics__chart--money');
    const typeCtxElement = this.getElement().querySelector('.statistics__chart--transport');
    const timeCtxElement = this.getElement().querySelector('.statistics__chart--time');

    this._moneyChart = createMoneyChart(moneyCtxElement, this._tripPoints);
    this._typeChart = createTypeChart(typeCtxElement, this._tripPoints);
    this._timeChart = createTimeChart(timeCtxElement, this._tripPoints);
  }
}
