'use strict';
let valueInput;
window.addEventListener('load', init);

function init() {
  valueInput = document.getElementById('txValue');
  handleSubmitButton();
  handleSetDayButtons();
  focusValueInput();
  focusDescriptionAfterEnterNonNumberInValue();
  window.addEventListener('keydown', processKeyDown);
  disableMouseWheel(valueInput);
}

function disableMouseWheel(input){
  input.addEventListener('mousewheel', (e) => {
    e.preventDefault();
  });
}

function processKeyDown() {
  if (event.ctrlKey && event.keyCode === 13) {
    let form = document.querySelector('#detail_form');
    form.submit();
  }
}

function focusDescriptionAfterEnterNonNumberInValue() {
  valueInput.onkeydown = function(keyBoardEvent) {
    let notHandledKeys = ['Tab', 'ArrowRight', 'ArrowLeft', 'Delete', 'Backspace', '-', 'Home', 'End'];
    if (notHandledKeys.indexOf(keyBoardEvent.key) > -1) {
      return true;
    }
    let isNumber = isFinite(keyBoardEvent.key);
    let isSpace = keyBoardEvent.code === 'Space';
    if (!isNumber || isSpace) {
      let descriptionInput = document.getElementById('txDescr');
      descriptionInput.focus();
    }
    if (isSpace) {
      return false;
    }
  };
}
function handleSubmitButton() {
  let btn = document.getElementById('btnDisableAfterClick');
  btn.addEventListener('click', disableOnSubmit);
}

function disableOnSubmit() {
  setTimeout(() => (this.disabled = true), 1);
  setTimeout(() => (this.disabled = false), 1000);
}
function handleSetDayButtons() {
  let btnYesterDay = document.getElementById('btnSetYesterday');
  btnYesterDay.addEventListener('click', () => { changeOrderDate(-1); });

  let btnTomorrow = document.getElementById('btnSetTomorrow');
  btnTomorrow.addEventListener('click', () => { changeOrderDate(1); });
}

function changeOrderDate(shift) {
  let dtInput = document.getElementById('dtDateOrder');
  let stValue = dtInput.valueAsDate;
  stValue.setDate(stValue.getDate() + shift);
  dtInput.value = formatDate(stValue);
  focusValueInput();
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

function focusValueInput() {
  valueInput.focus();
}
