'use strict';
let mongoose = require('mongoose');
let mixOrderTypes = { order: 'order', sorder: 'serviceOrder', fixrecord: 'fixrecord' };
let sOrderTypes = { between: 'between', in: 'in', out: 'out' };
let Currencies = {Rub: 'Rub', Dram: 'Dram'};
let url = require('url');
let moment = require('moment');

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

  return dt;
  // return new Date('2022-11-03');
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

function promisify(f, context) {
  return function(...args) { // return a wrapper-function
    return new Promise((resolve, reject) => {
      function callback(err, result) { // our custom callback for f
        if (err) {
          return reject(err);
        } else {
          resolve(result);
        }
      }
      args.push(callback); // append our custom callback to the end of f arguments
      f.call(context, ...args); // call the original function
    });
  };
};

function sortListByGroupedList(listToSort, groupedList) {
  listToSort.sort(function(a, b) {
    let aNumber = groupedList.find(item => item._id.equals(a._id));
    let bNumber = groupedList.find(item => item._id.equals(b._id));
    aNumber = aNumber ? aNumber.count : 0;
    bNumber = bNumber ? bNumber.count : 0;
    if (!a.MyNumber) {
      a.MyNumber = aNumber;
    }
    if (!b.MyNumber) {
      b.MyNumber = bNumber;
    }
    return bNumber - aNumber;
  });
}

function getCutDate(){
  let cutDate = getToday();
  cutDate.setDate(cutDate.getDate() - 30);
  return cutDate;
}

function canDeleteEntities() {
  
  return process.env.CANDELETEENTITIES === 'TRUE';
}

function getDateObjectFromUrl(req){
  let startDate = new Date(2000, 1);
  let finishDate = getTomorrow();
  let hasDateParameter = false;
  let queryObject = url.parse(req.url, true).query;
  if (queryObject.startDate !== undefined){
    startDate = new Date(queryObject.startDate);
    hasDateParameter = true;
  }
  if (queryObject.finishDate !== undefined){
    finishDate = new Date(queryObject.finishDate);
  }
  let obj = {startDate: startDate, finishDate: finishDate, hasDateParameter: hasDateParameter};
  return obj;
}

function getUrlDateString(startDate){
  return moment(startDate).format('YYYY-MM-DD');
}
function redirectToLastMonth(req, res){
  let tempDate = getToday();
  tempDate.setDate(tempDate.getDate() - 31);
  res.redirect(req.originalUrl + '?startDate=' + getUrlDateString(tempDate));
}

let dateForOrders;

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
exports.promisify = promisify;
exports.sortListByGroupedList = sortListByGroupedList;
exports.getCutDate = getCutDate;
exports.dateForOrders = dateForOrders;
exports.canDeleteEntities = canDeleteEntities;
exports.getDateObjectFromUrl = getDateObjectFromUrl;
exports.getUrlDateString = getUrlDateString;
exports.redirectToLastMonth = redirectToLastMonth;
exports.Currencies = Currencies;


