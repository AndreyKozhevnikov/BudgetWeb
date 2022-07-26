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
          from: 'accounts',
          pipeline: [
            {
              $match:
              {
                $expr: {
                  $and: [
                    {$eq: ['$IsMoneyBox', true] },
                  ],
                },
              },
            },
          ],
          as: 'mbAccounts',
        },
      },
      {
        $lookup: {
          from: 'serviceorders',
          let: { localAccountId: '$_id', localMBAccountIds: '$mbAccounts._id' },
          pipeline: [
            {
              $match:
              {
                $and: [
                  {
                    $expr: {
                      $and: [
                        { $eq: ['$AccountOut', '$$localAccountId']},
                        { $in: ['$AccountIn', '$$localMBAccountIds'] },

                      ],
                    },
                  },
                  { DateOrder: { $gte: startDate, $lt: finishDate } },
                ],
              },
            },
          ],
          as: 'acOutSOrdersToMB',
        },
      },
      {
        $lookup: {
          from: 'serviceorders',
          let: { localAccountId: '$_id', localMBAccountIds: '$mbAccounts._id' },
          pipeline: [
            {
              $match:
              {
                $and: [
                  {
                    $expr: {
                      $and: [
                        { $eq: ['$AccountIn', '$$localAccountId']},
                        { $in: ['$AccountOut', '$$localMBAccountIds'] },

                      ],
                    },
                  },
                  { DateOrder: { $gte: startDate, $lt: finishDate } },
                ],
              },
            },
          ],
          as: 'acInSOrdersFromMB',
        },
      },
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
          currency: '$Currency',
          isuntouchable: '$IsUntouchable',
          isarchived: '$IsArchived',
          IsMoneyBox: '$IsMoneyBox',
          _id: '$_id',
          startSum: { $sum: '$fixRecordsStartMonth.Value' },
          sumPayments: { $sum: '$filteredOrders.Value' },
          sumInSOrders: { $sum: '$acInSOrders.Value' },
          sumInSOrdersClean: { $sum: '$acInSOrdersClean.Value' },
          sumOutSOrders: { $sum: '$acOutSOrders.Value' },
          sumOutSOrdersClean: { $sum: '$acOutSOrdersClean.Value' },
          sumOutSOrdersToMB: { $sum: '$acOutSOrdersToMB.Value' },
          sumInSOrdersFromMB: { $sum: '$acInSOrdersFromMB.Value' },
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
    commonSum: {},
    startSum: {},
    paymentsSum: {},
    inputSum: {},
    outputSum: {},
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
    item.sumPaymentsWithMB = item.sumPayments + item.sumOutSOrdersToMB;
    item.sumInSOrdersCleanWithMB = item.sumInSOrdersClean + item.sumInSOrdersFromMB;
    item.result = item.startSum + item.sumInSOrders - item.sumOutSOrders - item.sumPayments;
    // item.url = '/account/' + item._id + '/update';
    item.getOrdsUrl = '/mixorders/account/' + item._id;
    item.createCheckUrl = 'createCheck/' + item._id + '/' + item.result;
    if (item.isuntouchable !== true && item.isarchived !== true) {
      let currency = item.currency;
      if (currency == null){
        currency = 'Rub';
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
  return { accList: accList, sumObject: sumObject };
}
async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
  // https://codeburst.io/javascript-async-await-with-foreach-b6ba62bbf404
}

async function createStartMonthRecords(firstDateOfCurrentMonth){
  let firsDayOfPrevMonth = Helper.getFirstDayOfLastMonth();
  let accListObject = await getAggregatedAccList(firsDayOfPrevMonth, firstDateOfCurrentMonth);
  let totalSum = 0;
  let totalIncoming = 0;
  let totalExpense = 0;
  let start = async () => {
    await asyncForEach(accListObject.accList, async (accRecord) => {
      if (!accRecord.IsMoneyBox){
        totalSum = totalSum + accRecord.result;
        totalIncoming = totalIncoming + accRecord.sumInSOrdersCleanWithMB;
      }

      totalExpense = totalExpense + accRecord.sumPaymentsWithMB;
      await FixRecordController.createFixRecord(
        FixRecordController.FRecordTypes.StartMonth,
        firstDateOfCurrentMonth,
        accRecord._id,
        accRecord.result);
    });
  };
  await start();
  await FixRecordController.createFixRecord(
    FixRecordController.FRecordTypes.TotalSum,
    firstDateOfCurrentMonth,
    null,
    totalSum
  );
  let dateForPrevMonths = new Date(firsDayOfPrevMonth.getFullYear(), firsDayOfPrevMonth.getMonth(), 15);


  await FixRecordController.createFixRecord(
    FixRecordController.FRecordTypes.TotalIncoming,
    dateForPrevMonths,
    null,
    totalIncoming
  );
  await FixRecordController.createFixRecord(
    FixRecordController.FRecordTypes.TotalExpense,
    dateForPrevMonths,
    null,
    totalExpense
  );
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
  let sberCredit = accListObject.accList.find(el => el.name === 'SberCredit');
  if (sberCredit != null){
    let sberCreditres = sberCredit.result;
    sberCredit.result = sberCreditres + ' (' + (Number(sberCreditres) + 100000) + ')';
  }
  let statisticObject = await getStaticObject(startDateToCalculate, finishDateToCalculate);
  let currMonthName = Helper.getMonthName(startDateToCalculate);
  let targetMonthData = {};
  targetMonthData.Date = startDateToCalculate.toISOString().substring(0, 10);
  targetMonthData.MonthName = currMonthName;
  res.render('account_list_aggregate', { currMonthData: targetMonthData, accListObject: accListObject, statObject: statisticObject });
}

async function getStaticObject(startDateToCalculate, finishDateToCalculate) {
  const normEatPerDay = 4000;
  const normFastFoodPerDay = 1000;
  const normExcessPerDay = 2000;
  const normAllPerDay = 6000;
  const mortGagePayment = 0;
  let lastMonthDate = new Date(finishDateToCalculate.getTime());
  lastMonthDate.setDate(lastMonthDate.getDate() - 1);
  let dayCount = lastMonthDate.getDate();
  let thisMonthMondays = [];
  let thisMonthDates = getDaysArray(startDateToCalculate, lastMonthDate, thisMonthMondays);

  let thisMonthsorders = await Order.find({ DateOrder: { $gte: startDateToCalculate, $lt: finishDateToCalculate } })
    .populate('ParentTag').populate('PaymentAccount');

  let thisMonthsSorders = await Account.aggregate(
    [
      {$match: { IsMoneyBox: true} },
      {
        $lookup: {
          from: ServiceOrder.collection.name,
          let: {accountId: '$_id'},
          pipeline: [
            {$match: {
              $and: [
                {DateOrder: { $gte: startDateToCalculate, $lt: finishDateToCalculate }},
                {$expr: {$eq: ['$AccountIn', '$$accountId']}},
                {Type: Helper.sOrderTypes.between},
              ],
            } },
          ],
          as: 'sOrders',
        },
      },
      {$unwind: '$sOrders'},
      { $replaceRoot: { newRoot: '$sOrders' }},
    ]
  );
  let sumAllOrders = 0;
  for (let sOrderKey in thisMonthsSorders) {
    let sOrder = thisMonthsSorders[sOrderKey];
    thisMonthDates[sOrder.DateOrder].Value = thisMonthDates[sOrder.DateOrder].Value + sOrder.Value;
    sumAllOrders = sumAllOrders + sOrder.Value;
  }
  let sumEatOrders = 0;
  let sumFastFoodOrders = 0;
  let sumExcessOrders = 0;
  sumAllOrders = sumAllOrders + thisMonthsorders.reduce(function(accumulator, order) {
    if (order.PaymentAccount.Currency !== 'Dram'){
      return accumulator;
    }
    if (order.ParentTag.LocalId === 22){ // capital - flat rent
      return accumulator;
    }
    if (order.ParentTag.LocalId === 1) {
      sumEatOrders = sumEatOrders + order.Value;
    }
    if (order.ParentTag.LocalId === 2037){
      sumFastFoodOrders = sumFastFoodOrders + order.Value;
    }
    if (order.IsExcess === true){
      sumExcessOrders = sumExcessOrders + order.Value;
    }
    thisMonthDates[order.DateOrder].Value = thisMonthDates[order.DateOrder].Value + order.Value;
    return accumulator + order.Value;
  }, 0);


  processthisMonthDates(thisMonthDates, normAllPerDay, mortGagePayment);
  let monthDayCount = Helper.getCurrentMonthDaysCount();
  let leftDayCount = monthDayCount - dayCount + 1;
  if (leftDayCount < 1)
    leftDayCount = 1;
  let desiredAllSumForMonth = normAllPerDay * monthDayCount + mortGagePayment;
  let desiredEatSumForMonth = normEatPerDay * monthDayCount;
  let desiredFastFoodSumForMonth = normFastFoodPerDay * monthDayCount;
  let desiredExcessSumForMonth = normExcessPerDay * monthDayCount;
  let statisticObject =
  {
    spendEat: sumEatOrders,
    normEat: normEatPerDay * dayCount,
    normEatMonth: desiredEatSumForMonth,
    spendFastFood: sumFastFoodOrders,
    spendExcess: sumExcessOrders,
    normFastFood: normFastFoodPerDay * dayCount,
    normFastFoodMonth: desiredFastFoodSumForMonth,
    normExcess: normExcessPerDay * dayCount,
    normExcessMonth: desiredExcessSumForMonth,
    spendAll: sumAllOrders,
    normAll: normAllPerDay * dayCount + mortGagePayment,
    normAllMonth: desiredAllSumForMonth,
  };
  statisticObject.diffEat = statisticObject.normEat - statisticObject.spendEat;
  statisticObject.diffEatMonth = statisticObject.normEatMonth - statisticObject.spendEat;
  statisticObject.moneyLeftEat = Math.round(statisticObject.diffEatMonth / leftDayCount);

  statisticObject.diffFastFood = statisticObject.normFastFood - statisticObject.spendFastFood;
  statisticObject.diffFastFoodMonth = statisticObject.normFastFoodMonth - statisticObject.spendFastFood;
  statisticObject.moneyLeftFastFood = Math.round(statisticObject.diffFastFoodMonth / leftDayCount);

  statisticObject.diffExcess = statisticObject.normExcess - statisticObject.spendExcess;
  statisticObject.diffExcessMonth = statisticObject.normExcessMonth - statisticObject.spendExcess;
  statisticObject.moneyLeftExcess = Math.round(statisticObject.diffExcessMonth / leftDayCount);


  statisticObject.diffAll = statisticObject.normAll - statisticObject.spendAll;
  statisticObject.diffAllMonth = statisticObject.normAllMonth - statisticObject.spendAll;
  statisticObject.moneyLeftAll = Math.round(statisticObject.diffAllMonth / leftDayCount);

  statisticObject.allColorAttribute = statisticObject.diffAll < 0;
  statisticObject.eatColorAttribute = statisticObject.diffEat < 0;
  statisticObject.fastFoodColorAttribute = statisticObject.diffFastFood < 0;
  statisticObject.excessColorAttribute = statisticObject.diffExcess < 0;

  statisticObject.thisMonthDates = thisMonthDates;
  statisticObject.thisMonthMondays = thisMonthMondays;

  return statisticObject;
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

function getDaysArray(start, end, listMondays) {


  let arr = {};
  let dt = new Date(start);

  while (dt <= end) {
    let dateSt = moment(dt).format('DD MMM YY');
    arr[dt] = {
      Value: 0,
      Date: dateSt,
      getDateUrl: '/mixorders/date/' + moment(dt).format('YYYY-MM-DD'),
    };

    if (dt.getDay() === 1){
      listMondays.push({
        label: {
          text: dateSt,
        },
        width: 1,
        value: dateSt,
        color: 'red',
        dashStyle: 'dash' });
    }

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
    Currency: req.body.Currency_frm,
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

