'use strict';
let serviceOrderController = require('../controllers/serviceOrderController.js');
let orderController = require('../controllers/orderController.js');
let Helper = require('../controllers/helperController.js');


async function list(req, res, next) {

  let firstDayOfCurrMonth = Helper.getFirstDateOfCurrentMonth();

  let sOrders = await serviceOrderController.getList(firstDayOfCurrMonth);
  let orders = await orderController.getList(firstDayOfCurrMonth);
  let mixSOrders = getMixList(sOrders, 'sorder');
  let mixOrders = getMixList(orders, 'order');

  mixOrders = mixOrders.concat(mixSOrders);
  mixOrders.sort((a, b) => { return new Date(b.date) - new Date(a.date); });

  res.render('mixOrder_list', { title: 'Mix Order List', mixOrders_list: mixOrders });
}

function getMixList(list, name) {
  let mixOrders = [];
  for (let i = 0; i < list.length; i++) {
    let ord = list[i];
    let mOrder = {
      date: ord.DateOrder,
      value: ord.Value,
      description: ord.Description,
      entity: ord,
      type: name,
    };
    mixOrders.push(mOrder);
  }
  return mixOrders;
}

exports.list = list;

