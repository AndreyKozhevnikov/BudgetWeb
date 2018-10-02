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
          caption: 'Date',
          width: '29%',
        },
        {
          dataField: 'Value',
          width: '19%',
        },
        {
          dataField: 'Description',
          cellTemplate: (container, options) => {
            let a = document.createElement('a');
            a.classList.add('dx-link');
            a.text = options.data.Description;
            a.href = '/order/' + options.data._id + '/update';
            a.style.wordWrap = 'break-word';
            container[0].appendChild(a);
          },
        },
        {
          dataField: 'ParentTag.Name',
          caption: 'Tag',
          width: '21%',
        },
        {
          dataField: 'PaymentType.Name',
          caption: 'Type',
          width: '5%',
        },
      ],
      wordWrapEnabled: true,
    }
  );
};
