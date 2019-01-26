/*global valueInput*/

'use strict';
window.addEventListener('load', init);

let cmbParent;
function init() {
  focusInputAfterTagSelection();
}

function focusInputAfterTagSelection(){
  cmbParent = document.getElementById('cmbParentTag');
  cmbParent.addEventListener('change', () => { valueInput.focus(); });
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
