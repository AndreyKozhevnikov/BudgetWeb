'use strict';
let express = require('express');
let router = express.Router();

// Require controller modules.

let home_controller = require('../controllers/homeController.js');
let formidable = require('formidable');
let fs = require('fs');
// / Tag ROUTES ///

// GET catalog home page.

router.get('/', home_controller.index);



// backup all orders
router.get('/backup', order_controller.orders_backup);

// delete orders and tags
router.get('/deleteall', deleteAll);

function deleteAll(req, res, next) {
  // order_controller.deleteOrders(req, res, next);
  // tag_controller.deleteTags(res, res, next);
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
      let storedTags = {};

      for (let i = 0; i < testjsong.length; i++) {
        let tmpOrder = testjsong[i];
        let tmpTag = tmpOrder.ParentTag;
        let storedTag = storedTags[tmpTag.Name];
        if (storedTag == undefined) {
          storedTag = tag_controller.createTagFromBackup(tmpTag);
          storedTags[storedTag.Name] = storedTag;
        }
        order_controller.createOrderFromBackup(tmpOrder, storedTag);
      }
    });
  });
});

module.exports = router;
