/*eslint no-unused-vars: ["off"]*/
'use strict';
function buildDataContainerForSOrder(container, sOrder, document) {
  if (sOrder.AccountOut) {
    let lblOutAccount = document.createElement('label');
    lblOutAccount.classList.add('OutAccountLabel');
    lblOutAccount.classList.add('plainLabel');
    lblOutAccount.innerHTML = sOrder.AccountOut.Name;
    container[0].appendChild(lblOutAccount);
    let br = document.createElement('br');
    container[0].appendChild(br);
  }
  if (sOrder.AccountIn) {
    let lblInAccount = document.createElement('label');
    lblInAccount.classList.add('InAccountLabel');
    lblInAccount.classList.add('plainLabel');
    let labelString = sOrder.AccountIn.Name;
    if (sOrder.IsCashBack) {
      labelString = '**' + labelString;
    }
    lblInAccount.innerHTML = labelString;
    container[0].appendChild(lblInAccount);
  }
}
function buildValueContainerForOrder(container, order, document) {
  let valueString = order.Value;
  if (!order.LocalId) {
    valueString = valueString + '*';
  }
  let a = document.createElement('a');
  a.classList.add('dx-link');
  a.text = valueString;
  a.href = '/order/' + order._id + '/update';
  a.style.wordWrap = 'break-word';
  container[0].appendChild(a);
  if (order.PaymentAccount) {
    let br = document.createElement('br');
    let lbl = document.createElement('label');
    lbl.classList.add('plainLabel');
    lbl.innerHTML = order.PaymentAccount.Name;
    container[0].appendChild(br);
    container[0].appendChild(lbl);
  }
}

function buildValueContainerForSOrder(container, sOrder, document) {
  let a = document.createElement('a');
  a.classList.add('dx-link');
  a.text = sOrder.Value;
  a.href = '/serviceOrder/' + sOrder._id + '/update';
  a.style.wordWrap = 'break-word';
  container[0].appendChild(a);
}
