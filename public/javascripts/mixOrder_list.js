/*global DevExpress mixOrders_list buildValueContainerForOrder buildValueContainerForSOrder*/
/*eslint no-new: 0, new-cap: 0*/
'use strict';

window.onload = function() {
  let gridElement = document.getElementById('listContainer');
  new DevExpress.ui.dxDataGrid(gridElement,
    {
      dataSource: mixOrders_list,
      filterRow: {
        visible: true,
        applyFilter: 'auto',
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
                container[0].innerHTML = options.data.entity.Value;
                break;
              case 'order':
                buildValueContainerForOrder(container, options.data.entity, this.document);
                break;
              case 'serviceOrder':
                buildValueContainerForSOrder(container, options.data.entity, this.document);
            }
          },
        },
        {
          dataField: 'description',
        },
        {
          dataField: 'accountOut',
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
        {
          dataField: 'place',
          cellTemplate: (container, options) => {
            let lb = this.document.createElement('text');
            if (options.data.place){
              if (options.data.HasPlaceImage){
                let img = this.document.createElement('img');
                img.src = '/../images/' + options.data.place + '32.png';
                container[0].appendChild(img);
              }
              lb.innerHTML = options.data.place;
              container[0].appendChild(lb);
            }
          },
        },
        {
          dataField: 'object',
        },
        {
          dataField: 'tags',
        },
      ],
      wordWrapEnabled: true,
    }
  );
};
