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
  let lblValue = document.createElement('label');
  lblValue.classList.add('plainLabel');
  let valueString = order.Value;
  if (!order.LocalId) {
    valueString = valueString + '*';
  }
  if (order.IsMonthCategory) {
    valueString = valueString + '(m)';
  }
  lblValue.innerHTML = valueString;
  container[0].appendChild(lblValue);
  if (order.PaymentType) {
    let br = document.createElement('br');
    let lbl = document.createElement('label');
    lbl.classList.add('plainLabel');
    let pNumber = order.PaymentNumber;
    if (pNumber) {
      lbl.innerHTML = order.PaymentType.Name + '-' + pNumber;
      lbl.classList.add('yaLabel');
      if (pNumber === 5) {
        lbl.classList.add('yaLabel5');
      }
    } else {
      lbl.innerHTML = order.PaymentType.Name;
    }
    container[0].appendChild(br);
    container[0].appendChild(lbl);
  }
}

