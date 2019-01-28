'use strict';
window.addEventListener('load', init);
console.log('sorder load00');
let cmbParent;
let inCombo;
let outCombo;

function init() {
  inCombo = document.getElementById('cmbAccountIn');
  outCombo = document.getElementById('cmbAccountOut');
  cmbParent = document.getElementById('cmbType');
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
      break;
    case 'out':
      outCombo.disabled = false;
      inCombo.disabled = true;
      break;
    case 'between':
      outCombo.disabled = false;
      inCombo.disabled = false;
      break;
  }
}

disableCombos();
