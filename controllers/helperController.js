'use strict';
let mongoose = require('mongoose');
let mixOrderTypes = { order: 'order', sorder: 'serviceOrder', fixrecord: 'fixrecord' };
let sOrderTypes = { between: 'between', in: 'in', out: 'out' };

let isRestoreMode = false;
function getFirstDateOfCurrentMonth() {
  let currentDate = getToday();
  let firstDayOfCurrMonth = new Date(Date.UTC(currentDate.getFullYear(), currentDate.getMonth(), 1));
  return firstDayOfCurrMonth;
}

function getFirstDateOfShifterMonth(currMonthDate, shift) {
  let dt = new Date(currMonthDate);
  let mnt = dt.getMonth();
  switch (shift) {
    case 'prev':
      mnt = mnt - 1;
      break;
    case 'next':
      mnt = mnt + 1;
      break;
  }
  dt.setMonth(mnt);
  return dt;

}

function getListByDates(entity, startDate, finishDate, propertyName) {
  if (finishDate == null) {
    finishDate = getToday();
  }
  if (propertyName == null) {
    propertyName = 'DateOrder';
  }
  let findObject = {};
  findObject[propertyName] = { $gte: startDate, $lt: finishDate };
  let list = entity.find(findObject);
  return list;
}
function createObjectId(id) {
  var ObjectId = mongoose.Types.ObjectId;
  return new ObjectId(id);
}

function getFirstDayOfLastMonth() {
  let dt = getToday();
  dt.setDate(1);
  dt.setMonth(dt.getMonth() - 1);
  dt.setHours(0, 0, 0, 0);
  return dt;
}

function getToday() {
  let dt = new Date();
  // let dt = new Date('2019-02-28');
  return dt;
}

function getTomorrow() {
  let dt = getToday();
  dt.setDate(dt.getDate() + 1);
  return dt;
}

function getCurrentMonthDaysCount() {
  let today = getToday();
  let dt = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  return dt;
}

function getMonthName(date) {
  let months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  let monthName = months[date.getMonth()];
  return monthName;
}

exports.getFirstDateOfCurrentMonth = getFirstDateOfCurrentMonth;
exports.getListByDates = getListByDates;
exports.createObjectId = createObjectId;
exports.mixOrderTypes = mixOrderTypes;
exports.getFirstDayOfLastMonth = getFirstDayOfLastMonth;
exports.getToday = getToday;
exports.getCurrentMonthDaysCount = getCurrentMonthDaysCount;
exports.getTomorrow = getTomorrow;
exports.isRestoreMode = isRestoreMode;
exports.sOrderTypes = sOrderTypes;
exports.getMonthName = getMonthName;
exports.getFirstDateOfShifterMonth = getFirstDateOfShifterMonth;


