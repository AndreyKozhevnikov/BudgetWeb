'use strict';

let FixRecord = require('../models/fixRecord.js');
let FRecordTypes = { StartMonth: 'StartMonth', Check: 'Check', TotalSum: 'TotalSum' };
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

async function getAccountRecords(accId) {
  let fRecs = FixRecord.find({ Account: accId });
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
async function createTotalSums(req, res, next){
  let ls = await FixRecord.find({Type: FRecordTypes.TotalSum});
  if (ls.length > 0){
    res.send('there are totalSum');
    return;
  }
  //   await FixRecord.remove({Type: FixRecordController.FRecordTypes.TotalSum});


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
exports.createFixRecord = createFixRecord;
exports.FRecordTypes = FRecordTypes;
exports.getTheLastFixRecordsDate = getTheLastFixRecordsDate;
exports.getAccountRecords = getAccountRecords;
exports.getList = getList;
exports.deleteTypes = deleteTypes;
exports.deleteCurrMonthStartRecords = deleteCurrMonthStartRecords;
exports.createTotalSums = createTotalSums;
