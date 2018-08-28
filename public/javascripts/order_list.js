/*global DevExpress order_list*/
/*eslint no-new: 0, new-cap: 0*/
'use strict';

window.onload = function() {
  let gridElement = document.getElementById('orderListContainer');
  new DevExpress.ui.dxDataGrid(gridElement,
    {
      dataSource: order_list,
      rowAlternationEnabled: true,
      showRowLines: true,
      showColumnLines: true,
      sorting: {
        mode: 'none',
      },
      columns: [
        {
          dataField: 'DateOrder',
          dataType: 'date',
          format: 'dd-MMM-yy EEE',
        },
        'Value',
        {
          dataField: 'Description',
          cellTemplate: (container, options) => {
            let a = document.createElement('a');
            a.classList.add('dx-link');
            a.text = options.data.Description;
            a.href = '/order/' + options.data._id + '/update';
            container[0].appendChild(a);
          },
        },
        'ParentTag.Name',
      ],
    }
  );
};
