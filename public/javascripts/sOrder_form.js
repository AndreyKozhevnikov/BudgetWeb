/*global  cmbParent*/

'use strict';
window.addEventListener('load', init);
console.log('sorder load00');
let inCombo;
let outCombo;
let cashBackCheckbox;

function init() {
  inCombo = document.getElementById('cmbAccountIn');
  outCombo = document.getElementById('cmbAccountOut');
  cashBackCheckbox = document.getElementById('chIsCashBack');
  cmbParent.addEventListener('change', disableCombos);
  updateCombos(cmbParent.value);
}

function disableCombos(event) {
  let vl = event.srcElement.value;
  updateCombos(vl);
}

function updateCombos(value) {
  switch (value) {
    case 'in':
      outCombo.disabled = true;
      inCombo.disabled = false;
      cashBackCheckbox.disabled = false;
      break;
    case 'out':
      outCombo.disabled = false;
      inCombo.disabled = true;
      cashBackCheckbox.disabled = true;
      break;
    case 'between':
      outCombo.disabled = false;
      inCombo.disabled = false;
      cashBackCheckbox.disabled = true;
      break;
  }
}

disableCombos();
