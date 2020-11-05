'use strict';
let moment = require('moment');

let Account = require('../models/account.js');
let Order = require('../models/order.js');
let ServiceOrder = require('../models/serviceOrder.js');

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

async function getAggregatedAccList(startDate, finishDate) {
  let startDateExtractMonth = Helper.getToday();
  startDateExtractMonth.setDate(startDate.getDate() - 30);
  let accList = await Account.aggregate(
    [
      {
        $lookup: {
          from: 'orders',
          let: { myid: '$_id' },
          pipeline: [
            {
              $match: {
                $and: [
                  {
                    $expr: {
                      $eq: ['$PaymentAccount', '$$myid'],
                    },
                  },
                  { DateOrder: { $gte: startDate, $lt: finishDate } },
                ],
              },
            },
          ],
          as: 'filteredOrders',
        },
      },
      {
        $lookup: {
          from: 'serviceorders',
          let: { myid: '$_id' },
          pipeline: [
            {
              $match:
              {
                $and: [
                  {
                    $expr: {
                      $eq: ['$AccountOut', '$$myid'],
                    },
                  },
                  { DateOrder: { $gte: startDate, $lt: finishDate } },
                ],
              },
            },
          ],
          as: 'acOutSOrders',
        },
      },
      {
        $lookup: {
          from: 'serviceorders',
          let: { myid: '$_id' },
          pipeline: [
            {
              $match:
              {
                $and: [
                  {
                    $expr: {
                      $eq: ['$AccountOut', '$$myid'],
                    },
                  },
                  { DateOrder: { $gte: startDate, $lt: finishDate } },
                  { Type: { $ne: 'between' } },
                ],
              },
            },
          ],
          as: 'acOutSOrdersClean',
        },
      },
      {
        $lookup: {
          from: 'serviceorders',
          let: { myid: '$_id' },
          pipeline: [
            {
              $match:
              {
                $and: [
                  {
                    $expr: {
                      $eq: ['$AccountIn', '$$myid'],
                    },
                  },
                  { DateOrder: { $gte: startDate, $lt: finishDate } },
                ],
              },
            },
          ],
          as: 'acInSOrders',
        },
      },
      {
        $lookup: {
          from: 'serviceorders',
          let: { myid: '$_id' },
          pipeline: [
            {
              $match:
              {
                $and: [
                  {
                    $expr: {
                      $eq: ['$AccountIn', '$$myid'],
                    },
                  },
                  { DateOrder: { $gte: startDate, $lt: finishDate } },
                  { Type: { $ne: Helper.sOrderTypes.between } },
                ],
              },
            },
          ],
          as: 'acInSOrdersClean',
        },
      },
      {
        $lookup: {
          from: 'serviceorders',
          let: { myid: '$_id' },
          pipeline: [
            {
              $match:
              {
                $and: [
                  {
                    $expr: {
                      $eq: ['$AccountIn', '$$myid'],
                    },
                  },
                  { DateOrder: { $gte: startDate, $lt: finishDate } },
                  { IsCashBack: true },
                ],
              },
            },
          ],
          as: 'acInSOrdersCashback',
        },
      },
      {
        $lookup: {
          from: 'fixrecords',
          let: { myid: '$_id' },
          pipeline: [
            {
              $match:
              {
                $and: [
                  {
                    $expr: {
                      $eq: ['$Account', '$$myid'],
                    },
                  },
                  { Type: FixRecordController.FRecordTypes.StartMonth },
                  { DateTime: { $gte: startDate, $lt: finishDate } },
                ],
              },
            },
          ],
          as: 'fixRecordsStartMonth',
        },
      },
      {
        $lookup: {
          from: 'fixrecords',
          let: { myid: '$_id' },
          pipeline: [
            {
              $match:
              {
                $and: [
                  {
                    $expr: {
                      $eq: ['$Account', '$$myid'],
                    },
                  },
                  { Type: FixRecordController.FRecordTypes.Check },
                  { DateTime: { $gte: startDateExtractMonth, $lt: finishDate } },
                ],
              },
            },
          ],
          as: 'fixRecordsLastCheck',
        },
      },
      {
        $project: {
          name: '$Name',
          isuntouchable: '$IsUntouchable',
          isarchived: '$IsArchived',
          _id: '$_id',
          startSum: { $sum: '$fixRecordsStartMonth.Value' },
          sumPayments: { $sum: '$filteredOrders.Value' },
          sumInSOrders: { $sum: '$acInSOrders.Value' },
          sumInSOrdersClean: { $sum: '$acInSOrdersClean.Value' },
          sumacInSOrdersCashback: { $sum: '$acInSOrdersCashback.Value' },
          sumOutSOrders: { $sum: '$acOutSOrders.Value' },
          sumOutSOrdersClean: { $sum: '$acOutSOrdersClean.Value' },
          ordernumber: '$OrderNumber',
          fixRecordsLastCheck: '$fixRecordsLastCheck',
        },
      },
    ]
  );
  accList.sort(function(a, b) {
    let aNumber = a.ordernumber;
    let bNumber = b.ordernumber;
    if (aNumber === null)
      aNumber = 999;
    if (bNumber === null)
      bNumber = 999;
    return aNumber - bNumber;
  });
  let sumObject = {
    commonSum: 0,
    startSum: 0,
    paymentsSum: 0,
    inputSum: 0,
    outputSum: 0,
    cashBackSum: 0,
  };
  accList.forEach((item) => {
    let lastCheckDate = new Date(-8640000000000000);
    let lastCheckValue = 0;
    if (item.fixRecordsLastCheck.length > 0) {
      item.fixRecordsLastCheck.sort((a, b) => {
        let aDate = new Date(a.DateTime);
        let bDate = new Date(b.DateTime);
        return bDate - aDate;
      });
      lastCheckDate = item.fixRecordsLastCheck[0].DateTime;
      lastCheckValue = item.fixRecordsLastCheck[0].Value;
    }
    item.lastCheckDate = moment(lastCheckDate).format('DD-MM-YY');
    item.lastCheckValue = lastCheckValue;

    item.result = item.startSum + item.sumInSOrders - item.sumOutSOrders - item.sumPayments;
    // item.url = '/account/' + item._id + '/update';
    item.getOrdsUrl = '/mixorders/account/' + item._id;
    item.createCheckUrl = 'createCheck/' + item._id + '/' + item.result;
    if (item.isuntouchable !== true) {
      sumObject.commonSum = sumObject.commonSum + item.result;
      sumObject.startSum = sumObject.startSum + item.startSum;
      sumObject.paymentsSum = sumObject.paymentsSum + item.sumPayments;
      sumObject.inputSum = sumObject.inputSum + item.sumInSOrdersClean;
      sumObject.outputSum = sumObject.outputSum + item.sumOutSOrdersClean;
      sumObject.cashBackSum = sumObject.cashBackSum + item.sumacInSOrdersCashback;
    }
  });
  return { accList: accList, sumObject: sumObject };
}
async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
  // https://codeburst.io/javascript-async-await-with-foreach-b6ba62bbf404
}

async function createStartMonthRecords(startDateToCalculate){
  let firsDayOfPrevMonth = Helper.getFirstDayOfLastMonth();
  let accListObject = await getAggregatedAccList(firsDayOfPrevMonth, startDateToCalculate);
  let start = async () => {
    await asyncForEach(accListObject.accList, async (accRecord) => {
      await FixRecordController.createFixRecord(
        FixRecordController.FRecordTypes.StartMonth,
        startDateToCalculate,
        accRecord._id,
        accRecord.result);
    });
  };
  await start();
}

async function aggregatedList(req, res, next) {
  let startDateToCalculate;
  let finishDateToCalculate;
  if (req.params.hasOwnProperty('direction')) {
    startDateToCalculate = Helper.getFirstDateOfShifterMonth(req.params.date, req.params.direction);
    finishDateToCalculate = Helper.getFirstDateOfShifterMonth(startDateToCalculate, 'next');
  } else {
    startDateToCalculate = Helper.getFirstDateOfCurrentMonth();
    finishDateToCalculate = Helper.getTomorrow();
    let lastStartMonthRecordDate = await FixRecordController.getTheLastFixRecordsDate();
    if (lastStartMonthRecordDate < startDateToCalculate) {
      await createStartMonthRecords(startDateToCalculate);
    }
  }

  let accListObject = await getAggregatedAccList(startDateToCalculate, finishDateToCalculate);
  accListObject.accList = accListObject.accList.filter(x => !x.isarchived);

  let ali = accListObject.accList.find(el => el.name === 'TinkoffAli');
  if (ali != null){
    let alires = ali.result;
    ali.result = alires + ' (' + (Number(alires) + 50000) + ')';
  }
  let statisticObject = await getStaticObject(startDateToCalculate, finishDateToCalculate);
  let currMonthName = Helper.getMonthName(startDateToCalculate);
  let targetMonthData = {};
  targetMonthData.Date = startDateToCalculate.toISOString().substring(0, 10);
  targetMonthData.MonthName = currMonthName;
  res.render('account_list_aggregate', { currMonthData: targetMonthData, accListObject: accListObject, statObject: statisticObject });
}

async function getStaticObject(startDateToCalculate, finishDateToCalculate) {
  const normEatPerDay = 500;
  const normAllPerDay = 2300;
  let lastMonthDate = new Date(finishDateToCalculate.getTime());
  lastMonthDate.setDate(lastMonthDate.getDate() - 1);
  let dayCount = lastMonthDate.getDate();

  let thisMonthDates = getDaysArray(startDateToCalculate, lastMonthDate);

  let thisMonthsorders = await Order.find({ DateOrder: { $gte: startDateToCalculate, $lt: finishDateToCalculate } })
    .populate('ParentTag');
  let thisMonthsSorders = await ServiceOrder.find({
    DateOrder: { $gte: startDateToCalculate, $lt: finishDateToCalculate }, Type: 'between',
    AccountIn: Helper.createObjectId('5f5765b9a37660001491ac09'),
  });
  let sumAllOrders = 0;
  for (let sOrderKey in thisMonthsSorders) {
    let sOrder = thisMonthsSorders[sOrderKey];
    thisMonthDates[sOrder.DateOrder].Value = thisMonthDates[sOrder.DateOrder].Value + sOrder.Value;
    sumAllOrders = sumAllOrders + sOrder.Value;
  }
  // let thisMonthsorders = order_list.filter(function(order) {
  //   return order.DateOrder >= firstDay;
  // });
  let sumEatOrders = 0;
  sumAllOrders = sumAllOrders + thisMonthsorders.reduce(function(accumulator, order) {
    if (order.ParentTag.LocalId === 21 || order.ParentTag.LocalId === 22) {
      return accumulator;
    }
    if (order.ParentTag.LocalId === 1) {
      sumEatOrders = sumEatOrders + order.Value;
    }
    thisMonthDates[order.DateOrder].Value = thisMonthDates[order.DateOrder].Value + order.Value;
    return accumulator + order.Value;
  }, 0);
  processthisMonthDates(thisMonthDates, normAllPerDay);
  let monthDayCount = Helper.getCurrentMonthDaysCount();
  let leftDayCount = monthDayCount - dayCount + 1;
  if (leftDayCount < 1)
    leftDayCount = 1;
  let desiredAllSumForMonth = normAllPerDay * monthDayCount;
  let desiredEatSumForMonth = normEatPerDay * monthDayCount;

  let statisticObject =
  {
    spendEat: sumEatOrders,
    normEat: normEatPerDay * dayCount,
    normEatMonth: desiredEatSumForMonth,
    spendAll: sumAllOrders,
    normAll: normAllPerDay * dayCount,
    normAllMonth: desiredAllSumForMonth,
  };
  statisticObject.diffEat = statisticObject.normEat - statisticObject.spendEat;
  statisticObject.diffEatMonth = statisticObject.normEatMonth - statisticObject.spendEat;
  statisticObject.moneyLeftEat = Math.round(statisticObject.diffEatMonth / leftDayCount);
  statisticObject.diffAll = statisticObject.normAll - statisticObject.spendAll;
  statisticObject.diffAllMonth = statisticObject.normAllMonth - statisticObject.spendAll;
  statisticObject.moneyLeftAll = Math.round(statisticObject.diffAllMonth / leftDayCount);

  statisticObject.allColorAttribute = statisticObject.diffAll < 0;
  statisticObject.eatColorAttribute = statisticObject.diffEat < 0;

  statisticObject.thisMonthDates = thisMonthDates;

  return statisticObject;
}
function processthisMonthDates(thisMonthDates, normAllPerDay) {
  let allResult = 0;
  for (let dateData in thisMonthDates) {
    thisMonthDates[dateData].Diff = normAllPerDay - thisMonthDates[dateData].Value;
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

function getDaysArray(start, end) {
  let arr = {};
  let dt = new Date(start);
  while (dt <= end) {
    arr[dt] = {
      Value: 0,
      Date: moment(dt).format('DD MMM YY'),
      getDateUrl: '/mixorders/date/' + moment(dt).format('YYYY-MM-DD'),
    };
    dt.setDate(dt.getDate() + 1);
  }
  return arr;
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
  });
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

exports.create_get = create_get;
exports.create_post = create_post_array;
exports.list = list;
exports.aggregatedList = aggregatedList;
exports.update_get = update_get;
exports.update_post = update_post_array;
exports.getAccountName = getAccountName;
exports.createCheck = createCheck;

