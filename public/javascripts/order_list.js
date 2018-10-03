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
          cellTemplate: (container, options) => {
            let lblValue = this.document.createElement('label');
            lblValue.classList.add('plainLabel');
            lblValue.innerHTML = options.data.Value;
            container[0].appendChild(lblValue);
            if (options.data.PaymentType) {
              let br = this.document.createElement('br');
              let lbl = this.document.createElement('label');
              lbl.classList.add('plainLabel');
              lbl.innerHTML = options.data.PaymentType.Name + '-' + options.data.PaymentNumber;
              container[0].appendChild(br);
              container[0].appendChild(lbl);
            }
          },
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
      ],
      wordWrapEnabled: true,
    }
  );
};
