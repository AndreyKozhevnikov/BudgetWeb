'use strict';

let FixRecord = require('../models/fixRecord.js');
let ServiceOrder = require('../models/serviceOrder.js');
let Order = require('../models/order.js');
let FRecordTypes = { StartMonth: 'StartMonth', Check: 'Check', TotalSum: 'TotalSum', TotalIncoming: 'TotalIncoming', TotalExpense: 'TotalExpense' };
let Helper = require('../controllers/helperController.js');

async function createFixRecord(type, datetime, account, value) {
  let fRec = new FixRecord({
    Type: type,
    DateTime: datetime,
    Account: account,
    Value: value,
  });
  await fRec.save();
  return fRec;
}

async function getTheLastFixRecordsDate() {
  let lastFRecord = await FixRecord.findOne({ Type: FRecordTypes.StartMonth }).sort('-DateTime');
  if (lastFRecord == null)
    return new Date();
  return lastFRecord.DateTime;
}

async function getAccountRecords(accId, cutDate) {
  let fRecs = FixRecord.find({ Account: accId, DateTime: { $gt: cutDate }});
  return fRecs;
}

async function getList(startDate, finishDate) {
  let list = Helper.getListByDates(FixRecord, startDate, finishDate, 'DateTime');
  return list;
}

function deleteTypes(req, res, next) {
  FixRecord.remove({}, function(err) {
    if (err) {
      next(err);
    } else {
      res.end('success');
    }

  });
}
function deleteStartMonthRecords(req, res, next) {
  if (!Helper.canDeleteEntities()) {
    res.send('cant delete objects');
    return;
  }
  deleteCurrMonthStartRecords(req, res, next);
}
function deleteCurrMonthStartRecords(req, res, next) {
  let currMonthFirstDate = Helper.getFirstDateOfCurrentMonth();
  FixRecord.remove({ DateTime: { $gte: currMonthFirstDate } }, function(err) {
    if (err) {
      next(err);
    } else {
      res.end('success');
    }
  });
}


async function createTotalIncoming(req, res, next){
  let ls = await FixRecord.find({Type: FRecordTypes.TotalIncoming});
  if (ls.length > 0){
    res.send('there are total incoming and expense');
    return;
  }
  let sInOrders = await ServiceOrder.aggregate(
    [
      {
        $match:
        {
          Type: Helper.sOrderTypes.in,
        },
      },
      {
        $group:
           {
             _id: { year: { $year: '$DateOrder' }, month: { $month: '$DateOrder' }},
             sum: { $sum: '$Value' },
           },
      },
    ]
  );
  let sOutOrders = await ServiceOrder.aggregate(
    [
      {
        $match:
        {
          Type: Helper.sOrderTypes.out,
        },
      },
      {
        $group:
           {
             _id: { year: { $year: '$DateOrder' }, month: { $month: '$DateOrder' }},
             sum: { $sum: '$Value' },
           },
      },
    ]
  );
  let orders = await Order.aggregate(
    [
      {
        $group:
           {
             _id: { year: { $year: '$DateOrder' }, month: { $month: '$DateOrder' }},
             sum: { $sum: '$Value' },
           },
      },
    ]
  );

  for (let inOrder of sInOrders){
    let dt = new Date(inOrder._id.year, inOrder._id.month - 1, 15);
    await createFixRecord(
      FRecordTypes.TotalIncoming,
      dt,
      null,
      inOrder.sum
    );
  }
  for (let order of orders){
    let dt = new Date(order._id.year, order._id.month - 1, 15);
    let sOutOrder = sOutOrders.find(x => x._id.year === order._id.year && x._id.month === order._id.month);

    if (sOutOrder != null){
      order.sum = order.sum + sOutOrder.sum;
    }


    await createFixRecord(
      FRecordTypes.TotalExpense,
      dt,
      null,
      order.sum
    );
  }

  res.send('createTotalIncoming succeed');
}
async function createTotalSums(req, res, next){
  // await FixRecord.remove({Type: FRecordTypes.TotalSum});
  // return;
  let ls = await FixRecord.find({Type: FRecordTypes.TotalSum});
  if (ls.length > 0){
    res.send('there are totalSum');
    return;
  }


  let lst = await FixRecord.aggregate([
    {
      $match: {
        Type: FRecordTypes.StartMonth,
        // DateTime: { $dayOfMonth: new Date('2016-01-01') },
      },
    },
    {
      $group: {
        _id: '$DateTime',
        totalSum: { $sum: '$Value' },
      },
    },
  ]);
  let listFirtsOnly = lst.filter(x => x._id.getDate() === 1);
  for (let row of listFirtsOnly){
    createFixRecord(
      FRecordTypes.TotalSum,
      row._id,
      null,
      row.totalSum
    );
  }
  res.send('totalSum are created');
}

async function showTotalSumsChart(req, res, next){
  let totalSum_list = await FixRecord.find(
    {$or: [
      {Type: FRecordTypes.TotalSum},
      {Type: FRecordTypes.TotalExpense},
      {Type: FRecordTypes.TotalIncoming},
    ]},
  ).sort({DateTime: 1});
  let chartList = totalSum_list.map(x => {
    let chartObject = {DateTime: x.DateTime};
    chartObject[x.Type] = x.Value;
    return chartObject;
  });
  res.render('totalSumsChart.pug', { chartList: chartList });
}

async function removeTotals(req, res, next){
  if (!Helper.canDeleteEntities()) {
    res.send('cant delete objects');
    return;
  }
  var result = await FixRecord.find(
    {$or: [
      {Type: FRecordTypes.TotalSum},
      {Type: FRecordTypes.TotalExpense},
      {Type: FRecordTypes.TotalIncoming},
    ]},
  ).deleteMany();
  res.send('removeTotals succeed' + result.n);
}

exports.createFixRecord = createFixRecord;
exports.FRecordTypes = FRecordTypes;
exports.getTheLastFixRecordsDate = getTheLastFixRecordsDate;
exports.getAccountRecords = getAccountRecords;
exports.getList = getList;
exports.deleteTypes = deleteTypes;
exports.deleteStartMonthRecords = deleteStartMonthRecords;
exports.createTotalSums = createTotalSums;
exports.createTotalIncoming = createTotalIncoming;
exports.showTotalSumsChart = showTotalSumsChart;
exports.removeTotals = removeTotals;
