'use strict';

let FixRecord = require('../models/fixRecord.js');
let FRecordTypes = { StartMonth: 'StartMonth', Check: 'Check' };
// let Helper = require('../controllers/helperController.js');

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

exports.createFixRecord = createFixRecord;
exports.FRecordTypes = FRecordTypes;
exports.getTheLastFixRecordsDate = getTheLastFixRecordsDate;
exports.getAccountRecords = getAccountRecords;
