'use strict'
let OrderPlace = require('../models/orderPlace.js')
const { body, validationResult } = require('express-validator')

function orderPlace_list(req, res, next) {
    OrderPlace.find().exec(function (err, result_list) {
        if (err) {
            return next(err)
        }
        result_list.sort((a, b) => {
            if (a.Name < b.Name) {
                return -1
            }
            if (a.Name > b.Name) {
                return 1
            }
            return 0
        })
        res.render('orderPlace_list.pug', {
            title: 'Place List',
            orderPlace_list: result_list,
        })
    })
}

function create_get(req, res) {
    res.render('orderPlace_form', { title: 'Create Place' })
}

async function create_post(req, res, next) {
    const errors = validationResult(req)

    var orderPlace = createPlaceOrderFromRequest(req, false)

    if (!errors.isEmpty()) {
        res.render('orderPlace_form', {
            title: 'Create Place(error)',
            orderPlaceFromForm: orderPlace,
            errors: errors.array(),
        })
        return
    } else {
        try {
            let found_entity = await OrderPlace.findOne({
                Name: req.body.NameFromForm,
            })
            if (found_entity) {
                res.redirect(found_entity.url)
            } else {
                await orderPlace.save()
                res.redirect('/order/createWithNewLists')
            }
        } catch (err) {
            return next(err)
        }
    }
}
let create_post_array = [
    body('NameFromForm', 'name required').isLength({ min: 1 }).trim(),
    body('NameFromForm').trim().escape(),
    body('LocalIdFromForm').trim().escape(),
    (req, res, next) => create_post(req, res, next),
]

exports.delete_get = function (req, res) {
    res.send('NOT IMPLEMENTED: tag delete GET')
}

exports.delete_post = function (req, res) {
    res.send('NOT IMPLEMENTED: tag delete POST')
}

function update_get(req, res, next) {
    OrderPlace.findById(req.params.id).exec(function (err, result) {
        if (err) {
            next(err)
        }
        res.render('orderPlace_form', {
            title: 'Update Place',
            orderPlaceFromForm: result,
        })
    })
}
function createPlaceOrderFromRequest(req, isUpdate) {
    let orderPlace = new OrderPlace({
        Name: req.body.NameFromForm,
        LocalId: req.body.LocalIdFromForm,
        HasImage: Boolean(req.body.HasImageFromForm),
    })
    if (isUpdate) {
        orderPlace._id = req.params.id
    }
    return orderPlace
}

async function update_post(req, res, next) {
    let orderPlace = createPlaceOrderFromRequest(req, true)

    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        res.render('orderPlace_form', {
            title: 'Update Order',
            orderPlaceFromForm: orderPlace,
        })
    } else {
        try {
            await OrderPlace.findByIdAndUpdate(req.params.id, orderPlace, [])
            res.redirect('/orderplace/list')
        } catch (err) {
            return next(err)
        }
    }
}
let update_post_array = [
    body('LocalIdFromForm').trim().escape(),
    body('NameFromForm').trim().escape(),
    (req, res, next) => update_post(req, res, next),
]

async function deleteEntities(req, res, next) {
    try {
        await OrderPlace.deleteMany({})
        res.end('success')
    } catch (err) {
        next(err)
    }
}

exports.orderPlace_list = orderPlace_list
exports.create_get = create_get
exports.create_post = create_post_array
exports.update_get = update_get
exports.update_post = update_post_array
exports.deleteEntities = deleteEntities
