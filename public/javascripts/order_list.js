/*global DevExpress order_list buildValueContainerForOrder*/
/*eslint no-new: 0, new-cap: 0*/
'use strict';

window.onload = function() {
  let gridElement = document.getElementById('orderListContainer');
  new DevExpress.ui.dxDataGrid(gridElement,
    {
      dataSource: order_list,
      filterRow: {
        visible: true,
        applyFilter: 'auto',
      },
      export: {
        enabled: true,
        allowExportSelectedData: true,
      },
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
          width: '10%',
        },
        {
          dataField: 'Value',
          width: '10%',
        },
        {
          dataField: 'PaymentAccount.Name',
          caption: 'Account',
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
          dataField: 'Place.Name',
          cellTemplate: (container, options) => {
            let lb = this.document.createElement('text');
            if (options.data.Place){
              if (options.data.Place.HasImage){
                let img = this.document.createElement('img');
                img.src = '/../images/' + options.data.Place.Name + '32.png';
                container[0].appendChild(img);
              }
              lb.innerHTML = options.data.Place.Name;
              container[0].appendChild(lb);
            }
          },
        },
        {
          dataField: 'Object.Name',
          caption: 'Object',
        },
        {
          dataField: 'Tags',
        },
        {
          dataField: 'PaymentAccount.Currency',
          caption: 'Currency',
        },
        
      ],
      wordWrapEnabled: true,
    }
  );
};
