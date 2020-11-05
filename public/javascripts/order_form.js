/*global valueInput*/

'use strict';

let cmbParent;
window.addEventListener('load', init);

function init() {
  focusInputAfterTypeSelection();
}

/* eslint-disable */
function popularTagButtonClick(tagId) {
  cmbParent.value = tagId;
   /* eslint-enable */
  valueInput.focus();
};

function focusInputAfterTypeSelection(){
  cmbParent = document.getElementById('cmbType');
  cmbParent.addEventListener('change', () => { valueInput.focus(); });
}


/* eslint-disable */
function popularAccountButtonClick(accId) {
  /* eslint-enable */
  let cmbAccount = document.getElementById('cmbAccount');
  cmbAccount.value = accId;
};
