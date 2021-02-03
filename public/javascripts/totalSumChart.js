/*global totalSum_list $ */
/*eslint no-new: 0, new-cap: 0*/
'use strict';
// https://codepen.io/freazeek/pen/OJXKpPv
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
        let resultValue = arg.valueText.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
        return {
          text: resultDate + '<br> <br>' + resultValue,
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
    series: [
      {
        argumentField: 'DateTime',
        valueField: 'TotalIncoming',
        type: 'bar',
        color: '#A8C879',
        axis: 'Right',
      },
      {
        argumentField: 'DateTime',
        valueField: 'TotalExpense',
        type: 'bar',
        color: '#E28FAD',
        axis: 'Left',
      },
      {
        argumentField: 'DateTime',
        valueField: 'TotalSum',
        color: '#ffaa66',
        axis: 'Right',
      },
    ],
    valueAxis: [{
      name: 'Left',
      position: 'left',
      synchronizedValue: 0,
    }, {
      name: 'Right',
      position: 'right',
      openValueField: 0,
      synchronizedValue: 0,
    },
    ],
  });
};
