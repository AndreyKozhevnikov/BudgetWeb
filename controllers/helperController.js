'use strict';

function getFirstDateOfCurrentMonth() {
  let currentDate = new Date();
  let firstDayOfCurrMonth = new Date(Date.UTC(currentDate.getFullYear(), currentDate.getMonth(), 1));
  return firstDayOfCurrMonth;
}

async function getListByDates(entity, startDate, finishDate) {
  if (finishDate == null) {
    finishDate = new Date();
  }
  let list = await entity.find({ DateOrder: { $gte: startDate, $lt: finishDate } });
  return list;
}

exports.getFirstDateOfCurrentMonth = getFirstDateOfCurrentMonth;
exports.getListByDates = getListByDates;

