'use strict';
window.addEventListener('load', init);
console.log('sorder load00');
let cmbParent;
function init() {
  console.log('sorder load0');
  disableAccComboWhenTypeChanged();
  console.log('sorder load1');
}

function disableAccComboWhenTypeChanged() {
  cmbParent = document.getElementById('cmbType');
  cmbParent.addEventListener('change', disableCombos);
}

function disableCombos() {
  console.log('mtest333');
  console.dir(arguments);
}

disableCombos();
