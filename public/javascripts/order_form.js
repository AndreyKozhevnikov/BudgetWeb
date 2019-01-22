/*global valueInput*/

'use strict';
window.addEventListener('load', init);

window.onkeydown = processKeyDown;
let cmbParent;
function init() {
  focusInputAfterTagSelection();
}


function focusInputAfterTagSelection(){
  cmbParent = document.getElementById('cmbParentTag');
  cmbParent.addEventListener('change', () => { valueInput.focus(); });
}

function processKeyDown() {
  if (event.ctrlKey && event.keyCode === 13) {
    let form = document.querySelector('#order_form');
    form.submit();
  }
}

/* eslint-disable */
function popularTagButtonClick(tagId) {
  /* eslint-enable */
  cmbParent.value = tagId;
  valueInput.focus();
};
/* eslint-disable */
function popularPTypeButtonClick(ptypeId) {
  /* eslint-enable */
  let cmbPaymentType = document.getElementById('cmbPaymentType');
  cmbPaymentType.value = ptypeId;
};
