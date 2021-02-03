/*global valueInput*/

'use strict';

let cmbParent;
let cmbPlace;
let cmbObject;

window.addEventListener('load', init);

function init() {
  populateCmbs();
  focusInputAfterTypeSelection();
}
function populateCmbs(){
  cmbParent = document.getElementById('cmbType');
  cmbPlace = document.getElementById('cmbPlace');
  cmbObject = document.getElementById('cmbObject');
}

/* eslint-disable */
function popularTagButtonClick(tagId) {
  cmbParent.value = tagId;
   /* eslint-enable */
  valueInput.focus();
};
/* eslint-disable */
function popularPlaceButtonClick(placeId) {
  cmbPlace.value = placeId;
  /* eslint-enable */
  valueInput.focus();
};
/* eslint-disable */
function popularObjectButtonClick(objectId) {
  cmbObject.value = objectId;
  /* eslint-enable */
  valueInput.focus();
};

function focusInputAfterTypeSelection(){
  cmbParent.addEventListener('change', () => { valueInput.focus(); });
}


/* eslint-disable */
function popularAccountButtonClick(accId) {
  /* eslint-enable */
  let cmbAccount = document.getElementById('cmbAccount');
  cmbAccount.value = accId;
};
