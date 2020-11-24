/*global totalSum_list $ */
/*eslint no-new: 0, new-cap: 0*/
'use strict';

window.onload = function() {
  // let chartElement = document.getElementById('totalSumChartContainer');
  $('#totalSumChartContainer').dxChart({
    dataSource: Object.values(totalSum_list),
    tooltip: {
      enabled: true,
      customizeTooltip: function(arg) {
        const d = arg.originalArgument;
        const ye = new Intl.DateTimeFormat('en', { year: '2-digit' }).format(d);
        const mo = new Intl.DateTimeFormat('en', { month: 'short' }).format(d);
        const da = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(d);
        let resultDate = `${da}-${mo}-${ye}`;
        return {
          text: resultDate + '<br> <br>' + arg.valueText,
        };
      },
    },
    legend: {
      visible: false,
    },
    argumentAxis: {
      tickInterval: { months: 1},
      argumentType: 'datetime',
      label: {
        format: 'MMM yy',
        overlappingBehavior: 'stagger',
      },
      grid: {
        visible: 'true',
      },
    },
    series: [{
      argumentField: 'DateTime',
      valueField: 'Value',
      color: '#ffaa66',
    },
    ],
  });
};
