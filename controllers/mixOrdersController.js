'use strict';
let serviceOrderController = require('../controllers/serviceOrderController.js');
let orderController = require('../controllers/orderController.js');
let accountController = require('../controllers/accountController.js');
let Helper = require('../controllers/helperController.js');


async function list(req, res, next) {

  let firstDayOfCurrMonth = Helper.getFirstDateOfCurrentMonth();

  let sOrders = await serviceOrderController.getList(firstDayOfCurrMonth);
  let orders = await orderController.getList(firstDayOfCurrMonth);
  createAndShowMixOrdersList(orders, sOrders, res, 'All');
}

function createAndShowMixOrdersList(orderList, sOrderList, res, title) {
  let mixOrders = getMixList(orderList, Helper.mixOrderTypes.order);
  let mixSOrders = getMixList(sOrderList, Helper.mixOrderTypes.sorder);

  mixOrders = mixOrders.concat(mixSOrders);
  mixOrders.sort((a, b) => { return new Date(b.date) - new Date(a.date); });
  res.render('mixOrder_list', { title: title, mixOrders_list: mixOrders });

}

async function listByAcc(req, res, next) {
  let accId = req.params.accountId;
  try {
    let orders = await orderController.getAccountOrders(accId);
    let sOrders = await serviceOrderController.getAccountOrders(accId);
    let accName = await accountController.getAccountName(accId);
    createAndShowMixOrdersList(orders, sOrders, res, accName);
  } catch (err) {
    console.log(err);
  }
}

function getMixList(list, entityName) {
  let mixOrders = [];
  for (let i = 0; i < list.length; i++) {
    let ord = list[i];
    let mOrder = {
      date: ord.DateOrder,
      value: ord.Value,
      description: ord.Description,
      entity: ord,
      type: entityName,
    };
    mOrder.url = '/' + entityName + '/' + ord._id + '/update';
    mixOrders.push(mOrder);
  }
  return mixOrders;
}

exports.list = list;
exports.listByAcc = listByAcc;

