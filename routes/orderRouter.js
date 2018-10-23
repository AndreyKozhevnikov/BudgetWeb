'use strict';
let express = require('express');
let router = express.Router();
let order_controller = require('../controllers/orderController.js');
router.get('/create', order_controller.order_create_get);
router.get('/createWithNewTag', order_controller.order_create_get_withNewTag);
router.post('/create', order_controller.order_create_post);
router.get('/:id/delete', order_controller.order_delete_get);
router.post('/:id/delete', order_controller.order_delete_post);
router.get('/:id/update', order_controller.order_update_get);
router.post('/:id/update', order_controller.order_update_post);
router.get('/list', order_controller.order_list);
router.get('/exportWithEmptyLocalId', order_controller.orders_exportWithEmptyLocalId);
router.get('/:id', order_controller.order_detail);
module.exports = router;
