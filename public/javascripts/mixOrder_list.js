/*global DevExpress mixOrders_list buildValueContainerForOrder*/
/*eslint no-new: 0, new-cap: 0*/
'use strict';

window.onload = function() {
  let gridElement = document.getElementById('listContainer');
  new DevExpress.ui.dxDataGrid(gridElement,
    {
      dataSource: mixOrders_list,
      // rowAlternationEnabled: true,
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
          width: '28%',
        },
        {
          dataField: 'value',
          width: '23%',
          cellTemplate: (container, options) => {
            switch (options.data.type) {
              case 'fixrecord':
                container[0].innerHTML = options.data.value;
                break;
              case 'order':
                buildValueContainerForOrder(container, options.data.entity, this.document);
                break;
              default:
                let a = document.createElement('a');
                a.classList.add('dx-link');
                a.text = options.data.value;
                a.href = options.data.url;
                a.style.wordWrap = 'break-word';
                container[0].appendChild(a);
            }
          },
        },
        {
          dataField: 'description',
        },
        {
          dataField: 'data',
          cellTemplate: (container, options) => {
            let lb = this.document.createElement('label');
            lb.innerHTML = options.data.viewData;
            lb.classList.add('plainLabel');
            container[0].appendChild(lb);
            container[0].classList.add(options.data.viewType);
          },
        },
      ],
      wordWrapEnabled: true,
    }
  );
};
