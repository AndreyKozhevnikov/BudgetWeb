/*global DevExpress mixOrders_list buildContainerForSOrder*/
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
          width: '29%',
        },
        {
          dataField: 'value',
          width: '19%',
        },
        {
          dataField: 'description',
        },
        {
          dataField: 'data',
          cellTemplate: (container, options) => {
            if (options.data.type === 'order') {
              let lb = this.document.createElement('label');
              lb.innerHTML = options.data.entity.ParentTag.Name;
              lb.classList.add('plainLabel');
              container[0].appendChild(lb);
            } else {
              buildContainerForSOrder(container, options.data.entity, this.document);
              container[0].classList.add('tdSOrder');
            }
          },
        },
      ],
      wordWrapEnabled: true,
    }
  );
};
