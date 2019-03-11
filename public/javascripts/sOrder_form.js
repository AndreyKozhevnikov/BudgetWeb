/*global*/

'use strict';
window.addEventListener('load', init);
let inCombo;
let outCombo;
let cashBackCheckbox;


function init() {
  inCombo = document.getElementById('cmbAccountIn');
  outCombo = document.getElementById('cmbAccountOut');
  cashBackCheckbox = document.getElementById('chIsCashBack');
  handleTypeRButtons();
}


/* eslint-disable */
function typeButtonClick(typeName) {
  /* eslint-enable */
  console.log('tet331');
  console.log(typeName);

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

