/*eslint no-unused-vars: ["off"]*/
'use strict';
function buildContainerForSOrder(container, sOrder, document) {
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
