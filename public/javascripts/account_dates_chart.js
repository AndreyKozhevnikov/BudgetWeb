/*global DevExpress thisMonthDates buildValueContainerForOrder*/
/*eslint no-new: 0, new-cap: 0*/
'use strict';

window.onload = function() {
  let chartElement = document.getElementById('thisMonthDatesContainer');
  new DevExpress.ui.dxDataGrid(chartElement, {
    dataSource: thisMonthDates,
    series: {
      argumentField: 'Date',
      valueField: 'oranges',
      name: 'My oranges',
      type: 'bar',
      color: '#ffaa66',
    },
  });

};
