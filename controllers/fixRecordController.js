'use strict';

let FixRecord = require('../models/fixRecord.js');
let FRecordTypes = { StartMonth: 'StartMonth', Check: 'Check' };
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

exports.createFixRecord = createFixRecord;
exports.FRecordTypes = FRecordTypes;
exports.getTheLastFixRecordsDate = getTheLastFixRecordsDate;
exports.getAccountRecords = getAccountRecords;
exports.getList = getList;
exports.deleteTypes = deleteTypes;
exports.deleteCurrMonthStartRecords = deleteCurrMonthStartRecords;
