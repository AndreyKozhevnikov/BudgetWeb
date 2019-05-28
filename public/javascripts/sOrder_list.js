/*global DevExpress serviceOrders_list buildDataContainerForSOrder buildValueContainerForSOrder*/
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
          width: '29%',
        },
        {
          dataField: 'Value',
          width: '19%',
          cellTemplate: (container, options) => {
            buildValueContainerForSOrder(container, options.data, document);
          },
        },
        {
          dataField: 'Descr',
          cellTemplate: (container, options) => {
            let a = document.createElement('a');
            a.classList.add('dx-link');
            if (options.data.Type === 'between' && options.data.Description === '') {
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
          dataField: 'Data',
          cellTemplate: (container, options) => {
            buildDataContainerForSOrder(container, options.data, this.document);
          },
        },
      ],
      wordWrapEnabled: true,
    }
  );
};
