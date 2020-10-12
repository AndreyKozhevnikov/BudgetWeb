/*global DevExpress thisMonthDates $ buildValueContainerForOrder*/
/*eslint no-new: 0, new-cap: 0*/
'use strict';

window.onload = function() {
  // let chartElement = document.getElementById('thisMonthDatesContainer');
  // new DevExpress.ui.dxChart(chartElement, {
  console.log('test111');
  $('#thisMonthDatesContainer').dxChart({
    dataSource: Object.values(thisMonthDates),
    series: [{
      argumentField: 'Date',
      valueField: 'Diff',
      type: 'bar',
      color: '#ffaa66',
      axis: 'Diff',
    },
    {
      argumentField: 'Date',
      valueField: 'TempResult',
      color: '#ffaa66',
      axis: 'Running',
    }],
    valueAxis: [{
      name: 'Diff',
      position: 'left',
    }, {
      name: 'Running',
      position: 'right',
    },
    ],
  });

};
