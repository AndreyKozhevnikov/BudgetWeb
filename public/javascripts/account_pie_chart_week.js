/*global lastWeekSpendGroups  $ */
/*eslint no-new: 0, new-cap: 0*/
'use strict';
// console.log('pie');
let oldonload2 = window.onload;
window.onload = function() {
  oldonload2();
  //  let chartElement = document.getElementById('thisMonthPieChartContainer');
  //  console.log(chartElement);
  // new DevExpress.ui.dxChart(chartElement, {
  console.dir(lastWeekSpendGroups);
  $('#lastWeekPieChartContainer').dxPieChart({
    dataSource: Object.values(lastWeekSpendGroups),
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
    customizePoint() {
      if (this.data.hasOwnProperty('Color')){
        return {color: this.data.Color};
      }
    },
  });

};
