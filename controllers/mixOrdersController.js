'use strict';
let serviceOrderController = require('../controllers/serviceOrderController.js');
let orderController = require('../controllers/orderController.js');
let accountController = require('../controllers/accountController.js');
let fixRecordController = require('../controllers/fixRecordController.js');
let Helper = require('../controllers/helperController.js');


async function list(req, res, next) {

  let firstDayOfCurrMonth = Helper.getFirstDateOfCurrentMonth();

  let sOrders = await serviceOrderController.getList(firstDayOfCurrMonth);
  let orders = await orderController.getList(firstDayOfCurrMonth);
  createAndShowMixOrdersList(orders, sOrders, res, 'All');
}

function createAndShowMixOrdersList(orderList, sOrderList, fRecords, res, title) {
  let mixOrders = getMixList(orderList, Helper.mixOrderTypes.order);
  let mixSOrders = getMixList(sOrderList, Helper.mixOrderTypes.sorder);
  let mixFRecords = getMixList(fRecords, Helper.mixOrderTypes.fixrecord);
  mixOrders = mixOrders.concat(mixSOrders).concat(mixFRecords);
  mixOrders.sort((a, b) => {
    let aDate = new Date(a.date);
    let bDate = new Date(b.date);
    aDate.setHours(0, 0, 0, 0);
    bDate.setHours(0, 0, 0, 0);
    if (aDate.getTime() === bDate.getTime()) {
      return new Date(b.createdtime) - new Date(a.createdtime);
    } else {
      return bDate - aDate;
    }
  });
  res.render('mixOrder_list', { title: title, mixOrders_list: mixOrders });

}

async function listByAcc(req, res, next) {
  let accId = req.params.accountId;
  try {
    let orders = await orderController.getAccountOrders(accId);
    let sOrders = await serviceOrderController.getAccountOrders(accId);
    let fRecords = await fixRecordController.getAccountRecords(accId);
    let accName = await accountController.getAccountName(accId);
    createAndShowMixOrdersList(orders, sOrders, fRecords, res, accName);
  } catch (err) {
    console.log(err);
  }
}

function getMixList(list, entityName) {
  let mixOrders = [];
  for (let i = 0; i < list.length; i++) {
    let mixRecord;
    switch (entityName) {
      case Helper.mixOrderTypes.fixrecord:
        let fRec = list[i];
        mixRecord = {
          date: fRec.DateTime,
          value: fRec.Value,
          description: fRec.Type,
          entity: fRec,
          type: entityName,
          createdtime: fRec.DateTime,
        };
        break;
      default:
        let ord = list[i];
        mixRecord = {
          date: ord.DateOrder,
          value: ord.Value,
          description: ord.Description,
          entity: ord,
          type: entityName,
          createdtime: ord.CreatedTime,
        };
        mixRecord.url = '/' + entityName + '/' + ord._id + '/update';
    }
    mixOrders.push(mixRecord);
  }
  return mixOrders;
}

exports.list = list;
exports.listByAcc = listByAcc;

