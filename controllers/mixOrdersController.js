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
  let fRecords = await fixRecordController.getList(firstDayOfCurrMonth);
  createAndShowMixOrdersList(orders, sOrders, fRecords, res, 'All');
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
    prepareSOrders(sOrders, accId);
    prepareOrders(orders);
    prepareOrdersFixRecords(fRecords);
    let accName = await accountController.getAccountName(accId);
    createAndShowMixOrdersList(orders, sOrders, fRecords, res, accName);
  } catch (err) {
    console.log(err);
  }
}
function prepareOrdersFixRecords(list) {
  for (let i = 0; i < list.length; i++) {
    let fRec = list[i];
    fRec.ViewType = 'Check';
    fRec.ViewData = fRec.Type;
  }
}
function prepareOrders(list) {
  for (let i = 0; i < list.length; i++) {
    let ord = list[i];
    ord.ViewType = 'Order';
    ord.ViewData = ord.ParentTag.Name;
  }
}
function prepareSOrders(list, accId) {
  for (let i = 0; i < list.length; i++) {
    let sord = list[i];
    switch (sord.Type) {
      case Helper.sOrderTypes.in:
        sord.ViewType = 'In';
        // sord.ViewData = sord.AccountOut.Name;
        sord.ViewData = sord.Description;
        if (sord.IsCashBack) {
          sord.ViewData = '**' + sord.ViewData;
        }
        break;
      case Helper.sOrderTypes.out:
        sord.ViewType = 'Out';
        // sord.ViewData = sord.AccountOut.Name;
        sord.ViewData = sord.Description;
        break;
      case Helper.sOrderTypes.between:
        if (sord.AccountIn.id === accId) {
          sord.ViewType = 'BetweenIn';
          sord.ViewData = sord.AccountOut.Name;
        } else {
          sord.ViewType = 'BetweenOut';
          sord.ViewData = sord.AccountIn.Name;
        }
        break;
    }
  }
}

function getMixList(list, entityName) {
  let mixOrders = [];
  for (let i = 0; i < list.length; i++) {
    let mixRecord;
    let entity = list[i];
    switch (entityName) {
      case Helper.mixOrderTypes.fixrecord:
        mixRecord = {
          date: entity.DateTime,
          value: entity.Value,
          description: entity.Type,
          entity: entity,
          type: entityName,
          createdtime: entity.DateTime,
        };
        break;
      default:
        mixRecord = {
          date: entity.DateOrder,
          value: entity.Value,
          description: entity.Description,
          entity: entity,
          type: entityName,
          createdtime: entity.CreatedTime,
        };
        mixRecord.url = '/' + entityName + '/' + entity._id + '/update';
    }
    mixRecord.viewType = entity.ViewType;
    mixRecord.viewData = entity.ViewData;
    mixOrders.push(mixRecord);
  }
  return mixOrders;
}

exports.list = list;
exports.listByAcc = listByAcc;

