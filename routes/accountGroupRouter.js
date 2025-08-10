'use strict'
let express = require('express')
let router = express.Router()

let accountGroup_controller = require('../controllers/accountGroupController.js')
// GET request for creating an AccountGroup. NOTE This must come before routes that display AccountGroup (uses id).
router.get('/create', accountGroup_controller.accountGroup_create_get)

// POST request for creating AccountGroup.
router.post('/create', accountGroup_controller.accountGroup_create_post)
// GET request for list of all AccountGroup items.
router.get('/list', accountGroup_controller.accountGroup_list)

// GET request to delete AccountGroup.
router.get('/:id/delete', accountGroup_controller.accountGroup_delete_get)

// POST request to delete AccountGroup.
router.post('/:id/delete', accountGroup_controller.accountGroup_delete_post)

// GET request to update AccountGroup.
router.get('/:id/update', accountGroup_controller.accountGroup_update_get)

// POST request to update AccountGroup.
router.post('/:id/update', accountGroup_controller.accountGroup_update_post)

module.exports = router
