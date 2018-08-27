'use strict';

window.onload = function() {
console.log('test123');

  const ds = new Array();
  for (let i = 1; i <= 100; i++) {
    ds.push({ ID: i, Name: 'Object ' + i });
  }
  let gridElement = document.getElementById('orderListContainer');
  new DevExpress.ui.dxDataGrid(gridElement,
    {
      dataSource: order_list,
    }
  );
};