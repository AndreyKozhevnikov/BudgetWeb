'use strict';
let express = require('express');
let router = express.Router();

// Require controller modules.
let tag_controller = require('../controllers/tagController.js');
let order_controller = require('../controllers/orderController.js');
let home_controller = require('../controllers/homeController.js');
let formidable = require('formidable');
let fs = require('fs');
// / Tag ROUTES ///

// GET catalog home page.

router.get('/', home_controller.index);

// GET request for creating a Tag. NOTE This must come before routes that display Tag (uses id).
router.get('/tag/create', tag_controller.tag_create_get);

// POST request for creating Tag.
router.post('/tag/create', tag_controller.tag_create_post);

// GET request to delete Tag.
router.get('/tag/:id/delete', tag_controller.tag_delete_get);

// POST request to delete Tag.
router.post('/tag/:id/delete', tag_controller.tag_delete_post);

// GET request to update Tag.
router.get('/tag/:id/update', tag_controller.tag_update_get);

// POST request to update Tag.
router.post('/tag/:id/update', tag_controller.tag_update_post);

// GET request for one Tag.
router.get('/tag/:id', tag_controller.tag_detail);

// GET request for list of all Tag items.
router.get('/tags', tag_controller.tag_list);

// / Order ROUTES ///

// GET request for creating Order. NOTE This must come before route for id (i.e. display order).
router.get('/order/create', order_controller.order_create_get);

// POST request for creating Order.
router.post('/order/create', order_controller.order_create_post);

// GET request to delete Order.
router.get('/order/:id/delete', order_controller.order_delete_get);

// POST request to delete Order.
router.post('/order/:id/delete', order_controller.order_delete_post);

// GET request to update Order.
router.get('/order/:id/update', order_controller.order_update_get);

// POST request to update Order.
router.post('/order/:id/update', order_controller.order_update_post);

// GET request for one Order.
router.get('/order/:id', order_controller.order_detail);

// Post update localid of order
router.post('/update/order', order_controller.update_localid);

// GET request for list of all Orders.
router.get('/orders', order_controller.order_list);

// export orders with empty localid to csv
router.get('/orders/export', order_controller.orders_export);

// backup all orders
router.get('/backup', order_controller.orders_backup);

// delete orders and tags
router.get('/deleteall', deleteAll);

function deleteAll(req, res, next) {
  order_controller.deleteOrders(req, res, next);
  tag_controller.deleteTags(res, res, next);
}

router.get('/restore', function(req, res, next) {
  res.redirect('/wiki');
});

router.post('/restore', function(req, res, next) {
  var form = new formidable.IncomingForm();
  form.parse(req, function(err, fields, files) {
    if (err) {
      next(err);
    };
    console.dir(files.file.path);
    fs.readFile(files.file.path, function(err, data) {
      if (err) {
        next(err);
      }
      console.log('data');
      console.log(data.toString());
      let testjsong = JSON.parse(data);
      console.log(testjsong);
      // console.assert(false);
      let tmpTag = testjsong[0].ParentTag;
      tag_controller.createTagFromBackup(tmpTag);
    });
  });
});

module.exports = router;
