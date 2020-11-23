/*global totalSum_list $ */
/*eslint no-new: 0, new-cap: 0*/
'use strict';

window.onload = function() {
  // let chartElement = document.getElementById('totalSumChartContainer');
  $('#totalSumChartContainer').dxChart({
    dataSource: Object.values(totalSum_list),
    tooltip: {
      enabled: true,
    },
    legend: {
      visible: false,
    },
    argumentAxis: {
      argumentType: 'datetime',
    },
    series: [{
      argumentField: 'DateTime',
      valueField: 'Value',
      color: '#ffaa66',
    },
    ],
  });
};
