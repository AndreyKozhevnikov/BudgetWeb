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
          cellTemplate: (container, options) => {
            let a = document.createElement('a');
            a.classList.add('dx-link');
            a.text = options.data.Value;
            a.href = '/serviceOrder/' + options.data._id + '/update';
            a.style.wordWrap = 'break-word';
            container[0].appendChild(a);
          },
        },
        {
          dataField: 'Description',
          cellTemplate: (container, options) => {
            let a = document.createElement('a');
            a.classList.add('dx-link');
            if (options.data.Type === 'between') {
              a.text = 'between';
            } else {
              a.text = options.data.Description;
            }
            a.href = '/serviceOrder/' + options.data._id + '/update';
            a.style.wordWrap = 'break-word';
            container[0].appendChild(a);
          },
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
