'use strict';
let mongoose = require('mongoose');

function getFirstDateOfCurrentMonth() {
  let currentDate = getToday();
  let firstDayOfCurrMonth = new Date(Date.UTC(currentDate.getFullYear(), currentDate.getMonth(), 1));
  return firstDayOfCurrMonth;
}

function getListByDates(entity, startDate, finishDate) {
  if (finishDate == null) {
    finishDate = getToday();
  }
  let list = entity.find({ DateOrder: { $gte: startDate, $lt: finishDate } });
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

exports.getFirstDateOfCurrentMonth = getFirstDateOfCurrentMonth;
exports.getListByDates = getListByDates;
exports.createObjectId = createObjectId;
exports.getFirstDayOfLastMonth = getFirstDayOfLastMonth;
exports.getToday = getToday;
exports.getCurrentMonthDaysCount = getCurrentMonthDaysCount;
exports.getTomorrow = getTomorrow;


