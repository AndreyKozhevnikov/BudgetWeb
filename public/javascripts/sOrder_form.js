/*global valueInput*/

'use strict';
window.addEventListener('load', init);
let inCombo;
let outCombo;
let cashBackDv;


function init() {
  inCombo = document.getElementById('cmbAccountIn');
  outCombo = document.getElementById('cmbAccountOut');
  cashBackDv = document.getElementById('cashBackDv');
  handleTypeRButtons();
}
/* eslint-disable */
function accoutOutClick(accId) {
  /* eslint-enable */
  outCombo.value = accId;
}
/* eslint-disable */
function accoutInClick(accId) {
  /* eslint-enable */
  inCombo.value = accId;
}
/* eslint-disable */
function typeButtonClick(typeName) {
  /* eslint-enable */
  // console.log('tet331');
  // console.log(typeName);

  updateCombos();
}

function handleTypeRButtons() {
  let rButtons = document.getElementsByName('Type_frm');
  let value = null;
  for (let i = 0; i < rButtons.length; i++) {
    if (rButtons[i].checked) {
      value = rButtons[i].value;
    }
    rButtons[i].addEventListener('change', function() {
      updateCombos(this.value);
      updateButtons(this.value);
      valueInput.focus();
    });
  }
  updateCombos(value);
}

function updateButtons(value) {
  let buttonsForRB = document.getElementsByClassName('btnForRB');
  for (let i = 0; i < buttonsForRB.length; i++) {
    let bt = buttonsForRB[i];
    if (bt.htmlFor === 'rbType' + value) {
      bt.setAttribute('selected', '');
    } else {
      bt.removeAttribute('selected');
    }
  }
}

function updateCombos(value) {
  switch (value) {
    case 'in':
      outCombo.disabled = true;
      inCombo.disabled = false;
      cashBackDv.removeAttribute('hidden');
      break;
    case 'out':
      outCombo.disabled = false;
      inCombo.disabled = true;
      cashBackDv.setAttribute('hidden', '');
      break;
    case 'between':
      outCombo.disabled = false;
      inCombo.disabled = false;
      cashBackDv.setAttribute('hidden', '');
      break;
  }
}

