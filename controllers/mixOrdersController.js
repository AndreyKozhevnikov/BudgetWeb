'use strict';
let serviceOrderController = require('../controllers/serviceOrderController.js');
let orderController = require('../controllers/orderController.js');
let accountController = require('../controllers/accountController.js');
let fixRecordController = require('../controllers/fixRecordController.js');
let Helper = require('../controllers/helperController.js');

function createAndShowMixOrdersList(orderList, sOrderList, fRecords, res, title, accId) {
  let mixOrders = getMixListFromOrders(orderList);
  let mixSOrders = getMixListFromSOrders(sOrderList, accId);
  let mixFRecords = getMixListFromFixRecords(fRecords);
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
    createAndShowMixOrdersList(orders, sOrders, fRecords, res, accName, accId);
  } catch (err) {
    console.log(err);
  }
}

async function listByDate(req, res, next) {
  let dt = req.params.date;
  let dtNext = new Date(dt);
  dtNext.setDate(dtNext.getDate() + 1);
  try {
    let orders = await orderController.getList(dt, dtNext);
    let sOrders = await serviceOrderController.getList(dt, dtNext);
    sOrders = sOrders.filter(x => x.Type === 'between' && x.AccountIn.IsMoneyBox === true);
    createAndShowMixOrdersList(orders, sOrders, [], res, dt, null);
  } catch (err) {
    console.log(err);
  }
}

function getMixListFromOrders(orderList) {
  let mixOrders = [];
  for (let i = 0; i < orderList.length; i++) {
    let order = orderList[i];
    let mixRecord = {
      date: order.DateOrder,
      description: order.Description,
      createdtime: order.CreatedTime,
      viewType: 'Order',
      viewData: order.ParentTag.Name,
      accountOut: order.PaymentAccount.Name,
      tags: order.Tags,
    };
    if (order.Place){
      mixRecord.place = order.Place.Name;
      mixRecord.HasPlaceImage = order.Place.HasImage;
    };
    if (order.Object){
      mixRecord.object = order.Object.Name;
    };
    mixRecord.entity = order;
    mixRecord.type = Helper.mixOrderTypes.order;
    mixOrders.push(mixRecord);
  }
  return mixOrders;
}

function getMixListFromSOrders(sOrderList, accId) {
  let mixOrders = [];
  for (let i = 0; i < sOrderList.length; i++) {
    let sOrder = sOrderList[i];
    let mixRecord = {
      date: sOrder.DateOrder,
      description: sOrder.Description,
      createdtime: sOrder.CreatedTime,

    };
    switch (sOrder.Type) {
      case Helper.sOrderTypes.in:
        mixRecord.viewType = 'In';
        mixRecord.viewData = sOrder.Description;
        break;
      case Helper.sOrderTypes.out:
        mixRecord.viewType = 'Out';
        mixRecord.viewData = sOrder.Description;
        mixRecord.accountOut = sOrder.AccountOut.Name;
        break;
      case Helper.sOrderTypes.between:
        if (sOrder.AccountIn.id === accId) {
          mixRecord.viewType = 'BetweenIn';
          mixRecord.viewData = sOrder.AccountOut.Name;
        } else {
          mixRecord.viewType = 'BetweenOut';
          mixRecord.viewData = sOrder.AccountIn.Name;
        }
        mixRecord.accountOut = sOrder.AccountOut.Name;
        break;
    }
    mixRecord.entity = sOrder;
    mixRecord.type = Helper.mixOrderTypes.sorder;
    mixOrders.push(mixRecord);
  }
  return mixOrders;
}

function getMixListFromFixRecords(fixRecordsList) {
  let mixOrders = [];
  for (let i = 0; i < fixRecordsList.length; i++) {
    let fRecord = fixRecordsList[i];
    let mixRecord = {
      date: fRecord.DateTime,
      description: fRecord.Type,
      createdtime: fRecord.DateTime,
      viewType: 'Check',
      viewData: fRecord.Type,
    };
    mixRecord.entity = fRecord;
    mixRecord.type = Helper.mixOrderTypes.fixrecord;
    mixOrders.push(mixRecord);
  }
  return mixOrders;
}


exports.listByAcc = listByAcc;
exports.listByDate = listByDate;

