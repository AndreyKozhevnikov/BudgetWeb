'use strict';
let moment = require('moment');

let Account = require('../models/account.js');
let Order = require('../models/order.js');
let PaymentType = require('../models/paymentType.js');

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

function createFOrdersForFeb19(req, res, next) {
  Account.aggregate(
    [
      {
        $lookup: {
          from: 'paymenttypes',
          localField: '_id',
          foreignField: 'Account',
          as: 'acPayments',
        },
      },
      {
        $unwind: {
          path: '$acPayments',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'orders',
          let: { ptId: '$acPayments._id' },
          pipeline: [
            {
              $match:
              {
                $expr: {
                  $and: [
                    { $eq: ['$PaymentType', '$$ptId'] },
                    { $gte: ['$DateOrder', new Date('2019-01-23')] },
                    { $lt: ['$DateOrder', new Date('2019-02-01')] },
                  ],

                },
              },
            },
          ],
          as: 'filteredOrders',
        },
      },
      {
        $project: {
          name: '$Name',
          ordernumber: '$OrderNumber',
          _id: '$_id',
          sumfOrders: { $sum: '$filteredOrders.Value' },
        },
      },
      {
        $group: {
          _id: '$_id',
          name: { $first: '$name' },
          ordernumber: { $first: '$ordernumber' },
          fOrders: { $sum: '$sumfOrders' },
        },
      },
      {
        $lookup: {
          from: 'serviceorders',
          let: { mId: '$_id' },
          pipeline: [
            {
              $match:
              {
                $expr: {
                  $and: [
                    { $eq: ['$AccountOut', '$$mId'] },
                    { $gte: ['$DateOrder', new Date('2019-01-23')] },
                    { $lt: ['$DateOrder', new Date('2019-02-01')] },
                  ],

                },
              },
            },
          ],
          // localField: '_id',
          // foreignField: 'AccountOut',
          as: 'acOutSOrders',
        },
      },
      {
        $lookup: {
          from: 'serviceorders',
          let: { mId: '$_id' },
          pipeline: [
            {
              $match:
              {
                $expr: {
                  $and: [
                    { $eq: ['$AccountIn', '$$mId'] },
                    { $gte: ['$DateOrder', new Date('2019-01-23')] },
                    { $lt: ['$DateOrder', new Date('2019-02-01')] },
                  ],

                },
              },
            },
          ],
          // localField: '_id',
          // foreignField: 'AccountIn',
          as: 'acInSOrders',
        },
      },
      {
        $project: {
          name: '$name',
          _id: '$_id',
          sumPayments: { $sum: '$fOrders' },
          sumInSOrders: { $sum: '$acInSOrders.Value' },
          sumOutSOrders: { $sum: '$acOutSOrders.Value' },
          ordernumber: '$ordernumber',
        },
      },
    ],
    function(err, accList) {
      if (err) {
        next(err);
      }
      accList.forEach((item) => {
        item.result = item.sumInSOrders - item.sumOutSOrders - item.sumPayments;
        Account.findById(item._id).exec(function(err, acc) {
          if (err) {

          } else {
            FixRecordController.createFixRecord(
              FixRecordController.FRecordTypes.StartMonth,
              new Date('2019-02-01'),
              acc,
              item.result);
          }
        });
      });
      res.redirect('/wiki');
    }
  );
}
// function handlerError(next, err) {
//   if (err) {
//     next(err);
//   }
// }

async function getAggregatedAccList(startDate, finishDate) {
  if (finishDate == null) {
    finishDate = Helper.getTomorrow();
  }
  let startDateExtractMonth = new Date();
  startDateExtractMonth.setDate(startDate.getDate() - 30);
  let accList = await Account.aggregate(
    [
      {
        $lookup: {
          from: 'paymenttypes',
          localField: '_id',
          foreignField: 'Account',
          as: 'acPayments',
        },
      },
      {
        $lookup: {
          from: 'orders',
          let: { ptId: '$acPayments._id' },
          pipeline: [
            {
              $match: {
                $and: [
                  {
                    $expr: {
                      $in: ['$PaymentType', '$$ptId'],
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
async function aggregatedList(req, res, next) {
  // FixRecord.findOne({ Type: FRecordTypes.StartMonth }).sort('-DateTime')
  //   .then((fRec) => {
  //     let lastFOrderTime = fRec.DateTime;
  //     console.dir(arguments);
  //   });
  let firstDayOfTargetMonth;
  let firstDayOfNextToTargetMonth = null;
  if (req.params.hasOwnProperty('direction')) {
    firstDayOfTargetMonth = Helper.getFirstDateOfShifterMonth(req.params.date, req.params.direction);
    firstDayOfNextToTargetMonth = Helper.getFirstDateOfShifterMonth(firstDayOfTargetMonth, 'next');
  } else {
    let lastFOrderTime = await FixRecordController.getTheLastFixRecordsDate();
    firstDayOfTargetMonth = Helper.getFirstDateOfCurrentMonth();
    if (lastFOrderTime < firstDayOfTargetMonth) {
      let firsDayOfPrevMonth = Helper.getFirstDayOfLastMonth();
      let accListObject = await getAggregatedAccList(firsDayOfPrevMonth, firstDayOfTargetMonth);
      let start = async () => {
        await asyncForEach(accListObject.accList, async (accRecord) => {
          await FixRecordController.createFixRecord(
            FixRecordController.FRecordTypes.StartMonth,
            firstDayOfTargetMonth,
            accRecord._id,
            accRecord.result);
        });
      };
      await start();
    }
  }

  let accListObject = await getAggregatedAccList(firstDayOfTargetMonth, firstDayOfNextToTargetMonth);
  let statisticObject = await getStaticObject();
  let currMonthName = Helper.getMonthName(firstDayOfTargetMonth);
  let targetMonthData = {};
  targetMonthData.Date = firstDayOfTargetMonth.toISOString().substring(0, 10);
  targetMonthData.MonthName = currMonthName;
  res.render('account_list_aggregate', { currMonthData: targetMonthData, accListObject: accListObject, statObject: statisticObject });
}
async function getStaticObject() {
  const normEatPerDay = 500;
  const normAllPerDay = 2300;
  let paymentTypeList = await PaymentType.find();
  let today = Helper.getToday();
  let dayCount = today.getDate();
  let firstDay = Helper.getFirstDateOfCurrentMonth();
  let thisMonthsorders = await Order.find({ DateOrder: { $gte: firstDay } })
    .populate('ParentTag');
  // let thisMonthsorders = order_list.filter(function(order) {
  //   return order.DateOrder >= firstDay;
  // });
  let sumAllOrders = thisMonthsorders.reduce(function(accumulator, order) {
    return accumulator + order.Value;
  }, 0);
  let sumEatOrders = thisMonthsorders.reduce(function(accumulator, order) {
    if (order.ParentTag.LocalId === 1) {
      accumulator = accumulator + order.Value;
    }
    return accumulator;
  }, 0);
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

  let allYaPaymentTypes = paymentTypeList.filter(p => p.IsYandex);
  let yandexMappedList = allYaPaymentTypes.map(function(p) {
    let newObj = { value: p.Name + '-' + p.CurrentCount, isFourth: p.CurrentCount === 4 };
    return newObj;
  });
  statisticObject.yaList = yandexMappedList;


  return statisticObject;
}

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
    IsUntouchable: Boolean(req.body.IsUntouchable_frm),
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
exports.createFOrdersForFeb19 = createFOrdersForFeb19;
exports.getAccountName = getAccountName;
exports.createCheck = createCheck;

