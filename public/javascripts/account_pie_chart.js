/*global thisMonthSpendGroups  $ */
/*eslint no-new: 0, new-cap: 0*/
'use strict';
// console.log('pie');
let oldonload = window.onload;
window.onload = function() {
  oldonload();
  //  let chartElement = document.getElementById('thisMonthPieChartContainer');
  //  console.log(chartElement);
  // new DevExpress.ui.dxChart(chartElement, {
  $('#thisMonthPieChartContainer').dxPieChart({
    dataSource: Object.values(thisMonthSpendGroups),
    palette: 'bright',
    series: [
      {
        argumentField: 'Name',
        valueField: 'Value',
        label: {
          visible: true,
          connector: {
            visible: true,
            width: 1,
          },
        },
      },
    ],
    tooltip: {
      enabled: true,
      customizeTooltip: function(point){
        return {text: point.argument};
      },
    },
  });

};
