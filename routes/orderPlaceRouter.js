'use strict';
let express = require('express');
let router = express.Router();

let controller = require('../controllers/orderPlaceController.js');
// GET request for creating a Tag. NOTE This must come before routes that display Tag (uses id).
router.get('/create', controller.create_get);

// POST request for creating Tag.
router.post('/create', controller.create_post);
// GET request for list of all Tag items.
router.get('/list', controller.entity_list);

// GET request to delete Tag.
router.get('/:id/delete', controller.delete_get);

// POST request to delete Tag.
router.post('/:id/delete', controller.delete_post);

// GET request to update Tag.
router.get('/:id/update', controller.update_get);

// POST request to update Tag.
router.post('/:id/update', controller.update_post);

module.exports = router;
