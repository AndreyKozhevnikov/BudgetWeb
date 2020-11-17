'use strict';
let express = require('express');
let router = express.Router();
let serviceOrder_controller = require('../controllers/serviceOrderController.js');
router.get('/create', serviceOrder_controller.create_get);
router.post('/create', serviceOrder_controller.create_post);
// router.get('/:id/delete', account_controller.order_delete_get);
// router.post('/:id/delete', account_controller.order_delete_post);
router.get('/:id/update', serviceOrder_controller.update_get);
router.post('/:id/update', serviceOrder_controller.update_post);
router.get('/list/:showallrecords', serviceOrder_controller.list);
router.get('/updatelists', serviceOrder_controller.updateLists);
module.exports = router;
