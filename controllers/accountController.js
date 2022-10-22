'use strict';
let moment = require('moment');

let Account = require('../models/account.js');
let Order = require('../models/order.js');
let ServiceOrder = require('../models/serviceOrder.js');
let FixRecord = require('../models/fixRecord.js');

let Helper = require('../controllers/helperController.js');
let FixRecordController = require('../controllers/fixRecordController.js');

const { body, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

function create_get(req, res, next) {
  res.render('account_form', {
    title: 'Create Account',
  });
};

function create_post(req, res, next) {
  const errors = validationResult(req);

  var account = createAccountFromRequest(req, false);

  if (!errors.isEmpty()) {
    res.render('account_form', {
      title: 'Create account(error)',
      account_frm: account,
      errors: errors.array(),
    });
    return;
  } else {
    Account.findOne({ Name: req.body.Name_frm }).exec(function(err, found_acc) {
      if (err) {
        return next(err);
      }
      if (found_acc) {
        res.redirect(found_acc.url);
      } else {

        account.save(function(err, acc) {
          if (err) {
            return next(err);
          }
          FixRecordController.createFixRecord(
            FixRecordController.FRecordTypes.StartMonth,
            Helper.getToday(),
            acc,
            0);
          res.redirect('/account/list');
        });
      }
    });
  }
};
let create_post_array = [
  body('Name_frm', 'Tag name required')
    .isLength({ min: 1 })
    .trim(),
  sanitizeBody('Name_frm')
    .trim()
    .escape(),
  sanitizeBody('LocalId_frm')
    .trim()
    .escape(),
  (req, res, next) => create_post(req, res, next),
];

function list(req, res, next) {
  Account.find().exec(function(err, list_account) {
    if (err) {
      return next(err);
    }
    res.render('account_list', { title: 'Account List', list_account: list_account });
  });
};

async function tuneAccountResultObject(accRes, dateObject, isCreateFirstMonth){

  let startDate = dateObject.startDateToCalculate;
  accRes.accList = Object.values(accRes.accList);
  accRes.accList = accRes.accList.filter(x => !x.isarchived);
  accRes.accList.sort(function(a, b) {
    let aNumber = a.ordernumber;
    let bNumber = b.ordernumber;
    if (aNumber === null)
      aNumber = 999;
    if (bNumber === null)
      bNumber = 999;
    return aNumber - bNumber;
  });

  let sumObject = {
    commonSum: {},
    startSum: {},
    paymentsSum: {},
    inputSum: {},
    outputSum: {},
  };
  accRes.accList.forEach((item) => {
    if (item.lastCheckDate.getFullYear() < 2000){
      item.lastCheckDate = '--';
    } else {
      item.lastCheckDate = Helper.getUrlDateString(item.lastCheckDate);
    }
    item.sumPaymentsWithMB = item.sumPayments + item.sumOutSOrdersToMB;
    item.sumInSOrdersCleanWithMB = item.sumInSOrdersClean + item.sumInSOrdersFromMB;
    item.result = item.startSum + item.sumInSOrders - item.sumOutSOrders - item.sumPayments;
    let startDateString = Helper.getUrlDateString(startDate);
    let finishDateString = Helper.getUrlDateString(Helper.getFirstDateOfShifterMonth(startDate, 'next'));
    item.getOrdsUrl = `/mixorders/account/${item._id}?startDate=${startDateString}&finishDate=${finishDateString}`;
    item.createCheckUrl = 'createCheck/' + item._id + '/' + item.result;
    if (item.isuntouchable !== true && item.isarchived !== true) {
      let currency = item.currency;
      if (!currency){
        currency = Helper.Currencies.Rub;
      }
      if (!sumObject.commonSum.hasOwnProperty(currency)){
        sumObject.commonSum[currency] = 0;
        sumObject.startSum[currency] = 0;
        sumObject.paymentsSum[currency] = 0;
        sumObject.inputSum[currency] = 0;
        sumObject.outputSum[currency] = 0;
      }
      sumObject.commonSum[currency] = sumObject.commonSum[currency] + item.result;
      sumObject.startSum[currency] = sumObject.startSum[currency] + item.startSum;
      sumObject.paymentsSum[currency] = sumObject.paymentsSum[currency] + item.sumPaymentsWithMB;
      sumObject.inputSum[currency] = sumObject.inputSum[currency] + item.sumInSOrdersCleanWithMB;
      sumObject.outputSum[currency] = sumObject.outputSum[currency] + item.sumOutSOrdersClean;
    }
  });
  accRes.sumObject = sumObject;

  if (!isCreateFirstMonth){
    let ali = accRes.accList.find(el => el.name === 'TinkoffAli');
    if (ali != null){
      let alires = ali.result;
      ali.result = alires + ' (' + (Number(alires) + 50000) + ')';
    }
    let sberCredit = accRes.accList.find(el => el.name === 'SberCredit');
    if (sberCredit != null){
      let sberCreditres = sberCredit.result;
      sberCredit.result = sberCreditres + ' (' + (Number(sberCreditres) + 100000) + ')';
    }
  }

  return accRes;
}

async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
  // https://codeburst.io/javascript-async-await-with-foreach-b6ba62bbf404
}

async function createStartMonthRecords(firstDateOfCurrentMonth){
  let firsDayOfPrevMonth = Helper.getFirstDayOfLastMonth();
  let lastDateToCalculate = new Date();

  lastDateToCalculate.setDate(firstDateOfCurrentMonth.getDate());
  lastDateToCalculate.setHours(0, 0, 0, 0);
  let dataObject = await prepareDataToBuildAccountList(firsDayOfPrevMonth, lastDateToCalculate);
  let accListObject = {};
 
  await iterateOverDataAndPopulateResultObjects(dataObject, accListObject, {}, {}, {startDateToCalculate: firsDayOfPrevMonth}, true);
  await tuneAccountResultObject(accListObject, {startDateToCalculate: firsDayOfPrevMonth }, true);
  let totalSum = {};
  let totalIncoming = {};
  let totalExpense = {};
  totalSum[Helper.Currencies.Dram] = 0;
  totalSum[Helper.Currencies.Rub] = 0;
  totalIncoming[Helper.Currencies.Dram] = 0;
  totalIncoming[Helper.Currencies.Rub] = 0;
  totalExpense[Helper.Currencies.Dram] = 0;
  totalExpense[Helper.Currencies.Rub] = 0;


  let start = async () => {
    await asyncForEach(accListObject.accList, async (accRecord) => {
      let currentCurrency = accRecord.currency;
      if (currentCurrency == null){
        currentCurrency = Helper.Currencies.Rub;
      }
      if (!accRecord.IsMoneyBox){
        totalSum[currentCurrency] = totalSum[currentCurrency] + accRecord.result;
        totalIncoming[currentCurrency] = totalIncoming[currentCurrency] + accRecord.sumInSOrdersCleanWithMB;
      }

      totalExpense[currentCurrency] = totalExpense[currentCurrency] + accRecord.sumPaymentsWithMB;
      await FixRecordController.createFixRecord(
        FixRecordController.FRecordTypes.StartMonth,
        firstDateOfCurrentMonth,
        accRecord._id,
        accRecord.result,
        null);
    });
  };
  await start();
  await FixRecordController.createFixRecord(
    FixRecordController.FRecordTypes.TotalSum,
    firstDateOfCurrentMonth,
    null,
    totalSum[Helper.Currencies.Rub],
    Helper.Currencies.Rub,
  );
  await FixRecordController.createFixRecord(
    FixRecordController.FRecordTypes.TotalSum,
    firstDateOfCurrentMonth,
    null,
    totalSum[Helper.Currencies.Dram],
    Helper.Currencies.Dram,
  );
  let dateForPrevMonths = new Date(firsDayOfPrevMonth.getFullYear(), firsDayOfPrevMonth.getMonth(), 15);


  await FixRecordController.createFixRecord(
    FixRecordController.FRecordTypes.TotalIncoming,
    dateForPrevMonths,
    null,
    totalIncoming[Helper.Currencies.Rub],
    Helper.Currencies.Rub,
  );
  await FixRecordController.createFixRecord(
    FixRecordController.FRecordTypes.TotalIncoming,
    dateForPrevMonths,
    null,
    totalIncoming[Helper.Currencies.Dram],
    Helper.Currencies.Dram,
  );
  await FixRecordController.createFixRecord(
    FixRecordController.FRecordTypes.TotalExpense,
    dateForPrevMonths,
    null,
    totalExpense[Helper.Currencies.Rub],
    Helper.Currencies.Rub,
  );
  await FixRecordController.createFixRecord(
    FixRecordController.FRecordTypes.TotalExpense,
    dateForPrevMonths,
    null,
    totalExpense[Helper.Currencies.Dram],
    Helper.Currencies.Dram,
  );
}

async function prepareDataToBuildAccountList(startDate, finishDate){
  let dataObject = {};
  dataObject.orderList = await Order.find({$and: [{DateOrder: { $gte: startDate }}, {DateOrder: { $lte: finishDate }}]})
  // .populate('PaymentAccount').populate('ParentTag');
    .populate('ParentTag');
  dataObject.serviceOrderList = await ServiceOrder.find({$and: [{DateOrder: { $gte: startDate }}, {DateOrder: { $lte: finishDate }}]});
  // .populate('AccountIn').populate('AccountOut');
  dataObject.lastCheckDate = new Date(startDate.getTime());
  dataObject.lastCheckDate.setDate(dataObject.lastCheckDate.getDate() - 45);
  dataObject.fixRecordsList = await FixRecord.find({$and: [{DateTime: { $gte: dataObject.lastCheckDate }}, {DateTime: { $lte: finishDate }}]})
  // .populate('Account')
    .sort('DateTime');
  dataObject.accountList = await Account.find();
  console.time('iterate');
  dataObject.orderList.forEach((order) => {
    let realAcc = dataObject.accountList.find(acc => acc._id.equals(order.PaymentAccount));
    order.PaymentAccount = realAcc;
  });

  dataObject.serviceOrderList.forEach((sOrder) => {
    let realAccIn = dataObject.accountList.find(acc => acc._id.equals(sOrder.AccountIn));
    sOrder.AccountIn = realAccIn;

    let realAccOut = dataObject.accountList.find(acc => acc._id.equals(sOrder.AccountOut));
    sOrder.AccountOut = realAccOut;
  });

  dataObject.fixRecordsList.forEach((fRecord) => {
    let realAcc = dataObject.accountList.find(acc => acc._id.equals(fRecord.Account));
    fRecord.Account = realAcc;
  });
  console.timeEnd('iterate');
  return dataObject;
}

async function iterateOverDataAndPopulateResultObjects(dataObject, accRes, statObj, monthObject, dateObject, isCreateFirstMonth){
  accRes.accList = {};
  dataObject.accountList.forEach((acc) => {
    accRes.accList[acc.Name] = {
      name: acc.Name,
      startSum: 0,
      sumPayments: 0,
      sumOutSOrdersToMB: 0,
      sumInSOrdersFromMB: 0,
      sumOutSOrders: 0,
      sumOutSOrdersClean: 0,
      sumInSOrders: 0,
      sumInSOrdersClean: 0,
      ordernumber: acc.OrderNumber,
      fixRecordsLastCheck: 0,
      lastCheckDate: new Date(-8640000000000000),
      lastCheckValue: 0,
      isarchived: acc.IsArchived,
      isuntouchable: acc.IsUntouchable,
      currency: acc.Currency,
      _id: acc._id,
    };
  });

  dataObject.serviceOrderList.forEach((sOrder) => {
    if (sOrder.AccountIn){
      if (sOrder.AccountIn.IsMoneyBox){
        accRes.accList[sOrder.AccountOut.Name].sumOutSOrdersToMB += sOrder.Value;
        if (sOrder.AccountOut.Currency === Helper.Currencies.Dram){
          statObj.sumAllOrders += sOrder.Value;
        }
      }
      accRes.accList[sOrder.AccountIn.Name].sumInSOrders += sOrder.Value;
      if (sOrder.Type !== Helper.sOrderTypes.between){
        accRes.accList[sOrder.AccountIn.Name].sumInSOrdersClean += sOrder.Value;
      }
    }
    if (sOrder.AccountOut){
      if (sOrder.AccountOut.IsMoneyBox){
        accRes.accList[sOrder.AccountIn.Name].sumInSOrdersFromMB += sOrder.Value;
      }
      accRes.accList[sOrder.AccountOut.Name].sumOutSOrders += sOrder.Value;
      if (sOrder.Type !== Helper.sOrderTypes.between){
        accRes.accList[sOrder.AccountOut.Name].sumOutSOrdersClean += sOrder.Value;
      }
    }
  });
  dataObject.orderList.forEach((order) => {
    let orderAccount = order.PaymentAccount;
    accRes.accList[orderAccount.Name].sumPayments += order.Value;

    if (order.PaymentAccount.Currency !== Helper.Currencies.Dram){ // dram theme
      return;
    }
    if (order.ParentTag.LocalId === 22){ // capital
      return;
    }
    if (order.ParentTag.LocalId === 3039){ // flat rent
      return;
    }
    if (order.ParentTag.LocalId === 1) {
      statObj.sumEatOrders += order.Value;
    }
    if (order.ParentTag.LocalId === 2037){
      statObj.sumFastFoodOrders += order.Value;
    }
    if (order.IsExcess === true){
      statObj.sumExcessOrders += order.Value;
    }
    if (!isCreateFirstMonth){
      monthObject.thisMonthDates[order.DateOrder].Value += order.Value;
    }
    statObj.sumAllOrders += order.Value;
  });
  dataObject.fixRecordsList.forEach((fixRecord) => {
    if (fixRecord.Type === FixRecordController.FRecordTypes.StartMonth){
      if (fixRecord.DateTime >= dateObject.startDateToCalculate){
        accRes.accList[fixRecord.Account.Name].startSum = fixRecord.Value;
      }
    }
    if (fixRecord.Type === FixRecordController.FRecordTypes.Check){
      accRes.accList[fixRecord.Account.Name].lastCheckDate = fixRecord.DateTime;
      accRes.accList[fixRecord.Account.Name].lastCheckValue = fixRecord.Value;
    }
  });
}

async function getDateObject(req){
  let dateData = {};
  let dateObjectFromQuery = Helper.getDateObjectFromUrl(req);
  if (!dateObjectFromQuery.hasDateParameter){
    dateData.startDateToCalculate = Helper.getFirstDateOfCurrentMonth();
    dateData.finishDateToCalculate = Helper.getTomorrow();
    let lastStartMonthRecordDate = await FixRecordController.getTheLastFixRecordsDate();
    if (lastStartMonthRecordDate < dateData.startDateToCalculate) {
      await createStartMonthRecords(dateData.startDateToCalculate);
    }
  } else {
    dateData.startDateToCalculate = dateObjectFromQuery.startDate;
    if (dateData.startDateToCalculate > Helper.getToday()){
      dateData.startDateToCalculate = Helper.getFirstDateOfCurrentMonth();
    }
    dateData.finishDateToCalculate = Helper.getFirstDateOfShifterMonth(dateObjectFromQuery.startDate, 'next');
  }
  dateData.lastMonthDate = new Date(dateData.finishDateToCalculate.getTime());
  dateData.lastMonthDate.setDate(dateData.lastMonthDate.getDate() - 1);
  dateData.dayCount = dateData.lastMonthDate.getDate();
  let currMonthName = Helper.getMonthName(dateData.startDateToCalculate);

  let prevMonthStartDate = Helper.getFirstDateOfShifterMonth(dateData.startDateToCalculate, 'prev');
  let nextMonthStartDate = Helper.getFirstDateOfShifterMonth(dateData.startDateToCalculate, 'next');
  dateData.prevMonthStartDate = Helper.getUrlDateString(prevMonthStartDate);
  dateData.nextMonthStartDate = Helper.getUrlDateString(nextMonthStartDate);
  dateData.MonthName = currMonthName;
  return dateData;
}

async function aggregatedList(req, res, next) {
  console.time('aggregatedList');
  let dateObject = await getDateObject(req);
  let dataObject = await prepareDataToBuildAccountList(dateObject.startDateToCalculate, dateObject.finishDateToCalculate);
  let accountResultObject = {};
  let statisticObject = {
    sumAllOrders: 0,
    sumEatOrders: 0,
    sumFastFoodOrders: 0,
    sumExcessOrders: 0,
  };
  let monthObject = {
    thisMonthMondays: [],
    thisMonthDates: {},

  };
  prepareEmptyMonthObject(dateObject, monthObject);
  iterateOverDataAndPopulateResultObjects(dataObject, accountResultObject, statisticObject, monthObject, dateObject);
  tuneAccountResultObject(accountResultObject, dateObject);
  processStatisticObjectAndMonthDates(dateObject, monthObject, statisticObject);
  console.timeEnd('aggregatedList');
  res.render('account_list_aggregate', { dateObject: dateObject, accListObject: accountResultObject, statObject: statisticObject, monthObject: monthObject });
}

async function processStatisticObjectAndMonthDates(dateObject, monthObject, statObj) {
  const normEatPerDay = 4000;
  const normFastFoodPerDay = 1000;
  const normExcessPerDay = 2000;
  const normAllPerDay = 6000;
  const mortGagePayment = 0;


  processthisMonthDates(monthObject.thisMonthDates, normAllPerDay, mortGagePayment);
  let monthDayCount = Helper.getCurrentMonthDaysCount();
  let leftDayCount = monthDayCount - dateObject.dayCount;
  if (leftDayCount < 1)
    leftDayCount = 1;
  let desiredAllSumForMonth = normAllPerDay * monthDayCount + mortGagePayment;
  let desiredEatSumForMonth = normEatPerDay * monthDayCount;
  let desiredFastFoodSumForMonth = normFastFoodPerDay * monthDayCount;
  let desiredExcessSumForMonth = normExcessPerDay * monthDayCount;

  statObj.spendEat = statObj.sumEatOrders;
  statObj.normEat = normEatPerDay * dateObject.dayCount;
  statObj.normEatMonth = desiredEatSumForMonth;
  statObj.spendFastFood = statObj.sumFastFoodOrders;
  statObj.spendExcess = statObj.sumExcessOrders;
  statObj.normFastFood = normFastFoodPerDay * dateObject.dayCount;
  statObj.normFastFoodMonth = desiredFastFoodSumForMonth;
  statObj.normExcess = normExcessPerDay * dateObject.dayCount;
  statObj.normExcessMonth = desiredExcessSumForMonth;
  statObj.spendAll = statObj.sumAllOrders;
  statObj.normAll = normAllPerDay * dateObject.dayCount + mortGagePayment;
  statObj.normAllMonth = desiredAllSumForMonth;

  statObj.diffEat = statObj.normEat - statObj.spendEat;
  statObj.diffEatMonth = statObj.normEatMonth - statObj.spendEat;
  statObj.moneyLeftEat = Math.round(statObj.diffEatMonth / leftDayCount);

  statObj.diffFastFood = statObj.normFastFood - statObj.spendFastFood;
  statObj.diffFastFoodMonth = statObj.normFastFoodMonth - statObj.spendFastFood;
  statObj.moneyLeftFastFood = Math.round(statObj.diffFastFoodMonth / leftDayCount);

  statObj.diffExcess = statObj.normExcess - statObj.spendExcess;
  statObj.diffExcessMonth = statObj.normExcessMonth - statObj.spendExcess;
  statObj.moneyLeftExcess = Math.round(statObj.diffExcessMonth / leftDayCount);


  statObj.diffAll = statObj.normAll - statObj.spendAll;
  statObj.diffAllMonth = statObj.normAllMonth - statObj.spendAll;
  statObj.moneyLeftAll = Math.round(statObj.diffAllMonth / leftDayCount);

  statObj.allColorAttribute = statObj.diffAll < 0;
  statObj.eatColorAttribute = statObj.diffEat < 0;
  statObj.fastFoodColorAttribute = statObj.diffFastFood < 0;
  statObj.excessColorAttribute = statObj.diffExcess < 0;
}
function processthisMonthDates(thisMonthDates, normAllPerDay, mortGagePayment) {
  let allResult = 0;
  for (let dateData in thisMonthDates) {

    thisMonthDates[dateData].Diff = normAllPerDay - thisMonthDates[dateData].Value;

    if (new Date(dateData).getDate() === 1){
      thisMonthDates[dateData].Diff = thisMonthDates[dateData].Diff + mortGagePayment;
    }
    allResult = allResult + thisMonthDates[dateData].Diff;
    thisMonthDates[dateData].TempResult = allResult;
  }


}
// function ConvertDatesList(dict) {
//   let list = [];
//   for (var key in dict) {
//     var value = objects[key];
//   }
// }

function prepareEmptyMonthObject(dateObject, monthObject) {
  let arr = {};
  let dt = new Date(dateObject.startDateToCalculate);

  while (dt <= dateObject.lastMonthDate) {
    let dateSt = moment(dt).format('DD MMM YY');
    let currDt = new Date(dt.getTime());
    arr[dt] = {
      Value: 0,
      Date: currDt,
      DateString: dateSt,
      getDateUrl: '/mixorders/?startDate=' + Helper.getUrlDateString(dt),
    };

    if (dt.getDay() === 1){
      let monDate = new Date();
      monDate.setTime(currDt.getTime() - 12 * 60 * 60 * 1000);
      monthObject.thisMonthMondays.push({
        label: {
          text: dateSt,
        },
        width: 1,
        value: monDate,
        color: 'red',
        dashStyle: 'dash' });
    }

    dt.setDate(dt.getDate() + 1);
  }
  monthObject.thisMonthDates = arr;
};

function update_get(req, res, next) {
  Account.findById(req.params.id).exec(function(err, result) {
    if (err) {
      next(err);
    }
    res.render('account_form', { title: 'Update Account', account_frm: result });
  });
};

async function createCheck(req, res, next) {
  let id = req.params.id;
  let sum = req.params.sum;
  let acc = await Account.findById(id);

  await FixRecordController.createFixRecord(
    FixRecordController.FRecordTypes.Check,
    Helper.getToday(),
    acc,
    sum);
  res.redirect('/account/aggregatedList');
}

function createAccountFromRequest(req, isUpdate) {
  var account = new Account({
    Name: req.body.Name_frm,
    LocalId: req.body.LocalId_frm,
    OrderNumber: req.body.OrderNumber_frm,
    OrderInNumber: req.body.OrderInNumber_frm,
    OrderOutNumber: req.body.OrderOutNumber_frm,
    IsUntouchable: Boolean(req.body.IsUntouchable_frm),
    IsArchived: Boolean(req.body.IsIsArchived_frm),
    Currency: req.body.Currency_frm,
    IsMoneyBox: Boolean(req.body.IsMoneyBox_frm),
    HasMoneyBox: Boolean(req.body.HasMoneyBox_frm),

  });
  if (req.body.MoneyBoxId_frm){
    account.MoneyBoxId = req.body.MoneyBoxId_frm;
  }
  if (isUpdate) {
    account._id = req.params.id;
  }
  return account;
}

function update_post(req, res, next) {
  let account = createAccountFromRequest(req, true);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.render('account_form', { title: 'Update Account', account_frm: account });
  } else {
    Account.findByIdAndUpdate(req.params.id, account, [], function(err, theAcc) {
      if (err) {
        return next(err);
      }
      res.redirect('/account/aggregatedList');
    });
  }
}

async function getAccountName(accId) {
  let acc = await Account.findById(accId).select('Name');
  return acc.Name;
}

let update_post_array = [
  sanitizeBody('LocalId_frm')
    .trim()
    .escape(),
  sanitizeBody('Name_frm')
    .trim()
    .escape(),
  (req, res, next) => update_post(req, res, next),
];

function deleteTypes(req, res, next) {
  Account.remove({}, function(err) {
    if (err) {
      next(err);
    } else {
      res.end('success');
    }

  });
}

exports.create_get = create_get;
exports.create_post = create_post_array;
exports.list = list;
exports.aggregatedList = aggregatedList;
exports.update_get = update_get;
exports.update_post = update_post_array;
exports.getAccountName = getAccountName;
exports.createCheck = createCheck;
exports.deleteTypes = deleteTypes;

