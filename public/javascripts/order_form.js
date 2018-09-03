'use strict';
window.onload = init;
window.onkeydown = processKeyDown;

function init() {
  let btn = document.getElementById('btnDisableAfterClick');
  btn.addEventListener('click', disableOnSubmit);
  let btnYesterDay = document.getElementById('btnSetYesterday');
  btnYesterDay.addEventListener('click', setYesterday);

  let valueInput = document.getElementById('txValue');
  valueInput.focus();
  valueInput.onkeydown = function(keyBoardEvent) {
    let notHandledKeys=['Tab', 'ArrowRight', 'ArrowLeft', 'Delete', 'Backspace'];
    if (notHandledKeys.indexOf(keyBoardEvent.key)>-1) {
      return true;
    }
    let isNumber = isFinite(keyBoardEvent.key);
    let isSpace = keyBoardEvent.code == 'Space';
    if (!isNumber || isSpace) {
      let descriptionInput = document.getElementById('txDescr');
      descriptionInput.focus();
    }
    if (isSpace) {
      return false;
    }
  };
}

function disableOnSubmit() {
  setTimeout(() => (this.disabled = true), 1);
  setTimeout(() => (this.disabled = false), 1000);
}

function processKeyDown() {
  if (event.ctrlKey && event.keyCode == 13) {
    let form = document.querySelector('#order_form');
    form.submit();
  }
}

function setYesterday() {
  let dtInput = document.getElementById('dtDateOrder');
  let stValue = dtInput.valueAsDate;
  stValue.setDate(stValue.getDate() - 1);
  dtInput.value = formatDate(stValue);
}

function formatDate(date) {
  let d = new Date(date);
  let month = '' + (d.getMonth() + 1);
  let day = '' + d.getDate();
  let year = d.getFullYear();
  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day;
  return [year, month, day].join('-');
}
/* eslint-disable */
function popularTagButtonClick(tagId) {
  /* eslint-enable */
  let cmb = document.getElementById('cmbParentTag');
  cmb.value = tagId;
};
