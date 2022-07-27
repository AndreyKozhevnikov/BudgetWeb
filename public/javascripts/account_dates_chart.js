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
      if (this.seriesName === 'TempResultSeries'){
        let dt = this.data.Date.getDay();
        switch (dt){
          case 1:
            return { color: '#FF0000' };
          case 2:
            return { color: '#FF7F00' };
          case 3:
            return { color: '#FFFF00' };
          case 4:
            return { color: '#00FF00' };
          case 5:
            return { color: '#0000FF' };
          case 6:
            return { color: '#4B0082' };
          case 0:
            return { color: '#9400D3' };
        }
      }
    },
    tooltip: {
      enabled: true,
      customizeTooltip: function(arg) {
        return {
          text: arg.point.data.DateString + '<br> <br>' + arg.valueText,
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
