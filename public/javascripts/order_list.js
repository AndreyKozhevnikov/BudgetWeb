/*global DevExpress order_list ExcelJS saveAs */
/*eslint no-new: 0, new-cap: 0*/
'use strict'

window.onload = function () {
    let gridElement = document.getElementById('orderListContainer')
    new DevExpress.ui.dxDataGrid(gridElement, {
        dataSource: order_list,
        filterRow: {
            visible: true,
            applyFilter: 'auto',
        },
        export: {
            enabled: true,
            allowExportSelectedData: true,
        },
        onExporting: function (e) {
            var workbook = new ExcelJS.Workbook()
            var worksheet = workbook.addWorksheet('Main sheet')
            DevExpress.excelExporter
                .exportDataGrid({
                    worksheet: worksheet,
                    component: e.component,
                    customizeCell: function (options) {
                        options.excelCell.font = { name: 'Arial', size: 12 }
                        options.excelCell.alignment = { horizontal: 'left' }
                    },
                })
                .then(function () {
                    workbook.xlsx.writeBuffer().then(function (buffer) {
                        saveAs(
                            new Blob([buffer], {
                                type: 'application/octet-stream',
                            }),
                            'DataGrid.xlsx',
                        )
                    })
                })
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
                width: '125px',
                hidingPriority: 10, // Always visible
            },
            {
                dataField: 'Value',
                width: '125px',
                hidingPriority: 10, // Always visible
            },
            {
                dataField: 'PaymentAccount.Name',
                caption: 'Account',
                hidingPriority: 5, // Hide on small screens
            },
            {
                dataField: 'Description',
                cellTemplate: (container, options) => {
                    let a = document.createElement('a')
                    a.classList.add('dx-link')
                    a.text = options.data.Description
                    a.href = '/order/' + options.data._id + '/update'
                    a.style.wordWrap = 'break-word'
                    container[0].appendChild(a)
                },
                hidingPriority: 0, // Always visible
            },
            {
                dataField: 'ParentTag.Name',
                caption: 'Tag',
                hidingPriority: 4, // Hide on small screens
            },
            {
                dataField: 'Place.Name',
                cellTemplate: (container, options) => {
                    let lb = this.document.createElement('text')
                    if (options.data.Place) {
                        if (options.data.Place.HasImage) {
                            let img = this.document.createElement('img')
                            img.src =
                                '/../images/' +
                                options.data.Place.Name +
                                '32.png'
                            container[0].appendChild(img)
                        }
                        lb.innerHTML = options.data.Place.Name
                        container[0].appendChild(lb)
                    }
                },
                hidingPriority: 3, // Hide on small screens
            },
            // {
            //     dataField: 'Object.Name',
            //     caption: 'Object',
            //     hidingPriority: 10, // Hide on small screens
            // },
            {
                dataField: 'Tags',
                hidingPriority: 1, // Hide on small screens
            },
            {
                dataField: 'PaymentAccount.Currency',
                caption: 'Currency',
                hidingPriority: 1, // Hide on small screens
            },
        ],
        columnHidingEnabled: true,
        wordWrapEnabled: true,
    })
}
