/*global thisMonthSpendGroups lastWeekSpendGroups $ */
/*eslint no-new: 0, new-cap: 0*/
'use strict';
// console.log('pie');
let oldonload = window.onload;
function createPieChart(divName, collection){
  $(divName).dxPieChart({
    dataSource: Object.values(collection),
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
}


window.onload = function() {
  oldonload();
  //  let chartElement = document.getElementById('thisMonthPieChartContainer');
  //  console.log(chartElement);
  // new DevExpress.ui.dxChart(chartElement, {
  createPieChart('#thisMonthPieChartContainer', thisMonthSpendGroups);
  createPieChart('#lastWeekPieChartContainer', lastWeekSpendGroups);

};
