'use strict';
let mongoose = require('mongoose');
let mixOrderTypes = { order: 'order', sorder: 'serviceOrder' };
function getFirstDateOfCurrentMonth() {
  let currentDate = new Date();
  let firstDayOfCurrMonth = new Date(Date.UTC(currentDate.getFullYear(), currentDate.getMonth(), 1));
  return firstDayOfCurrMonth;
}

function getListByDates(entity, startDate, finishDate) {
  if (finishDate == null) {
    finishDate = new Date();
  }
  let list = entity.find({ DateOrder: { $gte: startDate, $lt: finishDate } });
  return list;
}
function createObjectId(id) {
  var ObjectId = mongoose.Types.ObjectId;
  return new ObjectId(id);
}

exports.getFirstDateOfCurrentMonth = getFirstDateOfCurrentMonth;
exports.getListByDates = getListByDates;
exports.createObjectId = createObjectId;
exports.mixOrderTypes = mixOrderTypes;

