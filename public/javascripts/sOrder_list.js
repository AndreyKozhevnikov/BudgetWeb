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
          width: '29%',
        },
        {
          dataField: 'Value',
          width: '19%',
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
            if (options.data.AccountIn) {
              let lblInAccount = this.document.createElement('label');
              lblInAccount.classList.add('InAccountLabel');
              lblInAccount.classList.add('plainLabel');
              let labelString = options.data.AccountIn.Name;
              if (options.data.IsCashBack) {
                labelString = '**' + labelString;
              }
              lblInAccount.innerHTML = labelString;
              container[0].appendChild(lblInAccount);

              let br = this.document.createElement('br');
              container[0].appendChild(br);
            }
            if (options.data.AccountOut) {
              let lblOutAccount = this.document.createElement('label');
              lblOutAccount.classList.add('OutAccountLabel');
              lblOutAccount.classList.add('plainLabel');
              lblOutAccount.innerHTML = options.data.AccountOut.Name;
              container[0].appendChild(lblOutAccount);
            }
          },
        },
      ],
      wordWrapEnabled: true,
    }
  );
};
