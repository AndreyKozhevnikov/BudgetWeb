/*global thisMonthDates thisMonthMondays $ */
/*eslint no-new: 0, new-cap: 0*/
'use strict';

window.onload = function() {
  // let chartElement = document.getElementById('thisMonthDatesContainer');
  // new DevExpress.ui.dxChart(chartElement, {
  $('#thisMonthDatesContainer').dxChart({
    dataSource: Object.values(thisMonthDates),
    customizePoint: function() {
      if (this.seriesName === 'DiffSeries'){
        if (this.value > 0) {
          return { color: '#00FF00', hoverStyle: { color: '#8c8cff' } };
        } else {
          return { color: '#FF0000', hoverStyle: { color: '#ff7c7c' } };
        }
      }
    },
    tooltip: {
      enabled: true,
      customizeTooltip: function(arg) {
        return {
          text: arg.originalArgument + '<br> <br>' + arg.valueText,
        };
      },
    },
    commonSeriesSettings: {
      point: {
        visible: true,
      },
    },
    legend: { visible: false },
    series: [{
      name: 'DiffSeries',
      argumentField: 'Date',
      valueField: 'Diff',
      type: 'bar',
      color: '#ffaa66',
      axis: 'Diff',
    },
    {
      name: 'TempResultSeries',
      argumentField: 'Date',
      valueField: 'TempResult',
      color: '#3333FF',
      axis: 'Running',
      width: 4,
    }],
    valueAxis: [{
      name: 'Diff',
      position: 'left',
      synchronizedValue: 0,
    }, {
      name: 'Running',
      position: 'right',
      openValueField: 0,
      synchronizedValue: 0,
    },
    ],
    argumentAxis: {
      constantLines: Object.values(thisMonthMondays),
    },
  });

};
