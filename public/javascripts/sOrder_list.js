/*global DevExpress serviceOrders_list*/
/*eslint no-new: 0, new-cap: 0*/
'use strict';

window.onload = function() {
  let gridElement = document.getElementById('listContainer');
  new DevExpress.ui.dxDataGrid(gridElement,
    {
      dataSource: serviceOrders_list,
      rowAlternationEnabled: true,
      showRowLines: true,
      showColumnLines: true,
      paging: {
        pageSize: 50,
      },
      sorting: {
        mode: 'none',
      },
      columns: [
        {
          dataField: 'DateOrder',
          dataType: 'date',
          format: 'dd-MMM-yy EEE',
          caption: 'Date',
        },
        {
          dataField: 'Value',
        },
        {
          dataField: 'Description',
        },
        {
          dataField: 'IsCashBack',
        },
        {
          dataField: 'AccountIn.Name',
        },
        {
          dataField: 'AccountOut.Name',
        },
      ],
      wordWrapEnabled: true,
    }
  );
};
