/*global DevExpress mixOrders_list*/
/*eslint no-new: 0, new-cap: 0*/
'use strict';

window.onload = function() {
  let gridElement = document.getElementById('listContainer');
  new DevExpress.ui.dxDataGrid(gridElement,
    {
      dataSource: mixOrders_list,
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
          dataField: 'date',
          dataType: 'date',
          format: 'dd-MMM-yy EEE',
          caption: 'Date',
        },
        {
          dataField: 'value',
        },
        {
          dataField: 'description',
        },
        {
          dataField: 'type',
        },
        {
          dataField: 'entity',
        },
      ],
      wordWrapEnabled: true,
    }
  );
};
