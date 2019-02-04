/*global valueInput*/

'use strict';

/* eslint-disable */
function popularTagButtonClick(tagId) {
  cmbParent.value = tagId;
   /* eslint-enable */
  valueInput.focus();
};
/* eslint-disable */
function popularPTypeButtonClick(ptypeId) {
  /* eslint-enable */
  let cmbPaymentType = document.getElementById('cmbPaymentType');
  cmbPaymentType.value = ptypeId;
};
