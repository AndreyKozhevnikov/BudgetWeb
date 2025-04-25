/*global DevExpress data_list */
/*eslint no-new: 0, new-cap: 0*/
'use strict'

window.onload = function () {
    let gridElement = document.getElementById('listContainer')
    new DevExpress.ui.dxDataGrid(gridElement, {
        dataSource: data_list,
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
                dataField: 'DateTime',
                dataType: 'date',
                format: 'dd-MMM-yy EEE',
                caption: 'Date',
                width: '10%',
            },
            {
                dataField: 'Type',
                width: '10%',
            },
            {
                dataField: 'Account.Name',
                caption: 'Account',
            },
            {
                dataField: 'Value',
                caption: 'Tag',
                width: '21%',
            },
            {
                dataField: 'PaymentAccount.Currency',
                caption: 'Currency',
            },
        ],
        wordWrapEnabled: true,
    })
}
