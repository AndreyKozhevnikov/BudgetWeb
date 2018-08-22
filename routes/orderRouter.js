'use strict';
let express = require('express');
let router = express.Router();
let order_controller = require('../controllers/orderController.js');
// / Order ROUTES ///

// GET request for creating Order. NOTE This must come before route for id (i.e. display order).
router.get('/create', order_controller.order_create_get);
router.get('/createWithNewTag', order_controller.order_create_get_withNewTag);
// POST request for creating Order.
router.post('/create', order_controller.order_create_post);


// GET request to delete Order.
router.get('/:id/delete', order_controller.order_delete_get);

// POST request to delete Order.
router.post('/:id/delete', order_controller.order_delete_post);

// GET request to update Order.
router.get('/:id/update', order_controller.order_update_get);

// POST request to update Order.
router.post('/:id/update', order_controller.order_update_post);

// Post update localid of order
router.post('/update', order_controller.update_localid);

// GET request for list of all Orders.
router.get('/list', order_controller.order_list);

// export orders with empty localid to csv
router.get('/exportWithEmptyLocalId', order_controller.orders_exportWithEmptyLocalId);

// GET request for one Order.
router.get('/:id', order_controller.order_detail);

module.exports = router;
