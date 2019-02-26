'use strict';
let serviceOrderController = require('../controllers/serviceOrderController.js');
let orderController = require('../controllers/orderController.js');


async function list() {
  let sOrders = await serviceOrderController.getList();
}
exports.list = list;

