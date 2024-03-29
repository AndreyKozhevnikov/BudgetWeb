'use strict';
let express = require('express');
let router = express.Router();
let mixOrders_controller = require('../controllers/mixOrdersController.js');
// router.get('/', mixOrders_controller.list);
router.get('/account/:accountId', mixOrders_controller.listByAcc);
router.get('/', mixOrders_controller.listByDate);
// router.post('/create', serviceOrder_controller.create_post);
// // router.get('/:id/delete', account_controller.order_delete_get);
// // router.post('/:id/delete', account_controller.order_delete_post);
// router.get('/:id/update', serviceOrder_controller.update_get);
// router.post('/:id/update', serviceOrder_controller.update_post);
// router.get('/list', serviceOrder_controller.list);
// router.get('/updatelists', serviceOrder_controller.updateLists);
module.exports = router;
