'use strict';
let valueInput;
window.addEventListener('load', init);


function init() {
  handleSubmitButton();
  handleYesterDayButton();
  focusValueInput();
}

function handleSubmitButton(){
  let btn = document.getElementById('btnDisableAfterClick');
  btn.addEventListener('click', disableOnSubmit);
}

function disableOnSubmit() {
  setTimeout(() => (this.disabled = true), 1);
  setTimeout(() => (this.disabled = false), 1000);
}
function handleYesterDayButton(){
  let btnYesterDay = document.getElementById('btnSetYesterday');
  btnYesterDay.addEventListener('click', setYesterday);
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

function focusValueInput(){
  valueInput = document.getElementById('txValue');
  valueInput.focus();
}
