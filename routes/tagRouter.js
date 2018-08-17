'use strict';
let express = require('express');
let router = express.Router();

let tag_controller = require('../controllers/tagController.js');
// GET request for creating a Tag. NOTE This must come before routes that display Tag (uses id).
router.get('/create', tag_controller.tag_create_get);

// POST request for creating Tag.
router.post('/create', tag_controller.tag_create_post);
// GET request for list of all Tag items.
router.get('/list', tag_controller.tag_list);

// GET request to delete Tag.
router.get('/:id/delete', tag_controller.tag_delete_get);

// POST request to delete Tag.
router.post('/:id/delete', tag_controller.tag_delete_post);

// GET request to update Tag.
router.get('/:id/update', tag_controller.tag_update_get);

// POST request to update Tag.
router.post('/:id/update', tag_controller.tag_update_post);

// GET request for one Tag.
router.get('/:id', tag_controller.tag_detail);

module.exports = router;
