'use strict'
let AccountGroup = require('../models/accountGroup.js')
const { body, validationResult } = require('express-validator')

async function accountGroup_list(req, res, next) {
    try {
        let list_accountGroups = await AccountGroup.find()
        res.render('accountGroup_list', {
            title: 'AccountGroup List',
            accountGroup_list: list_accountGroups,
        })
    } catch (err) {
        return next(err)
    }
}

function accountGroup_create_get(req, res) {
    res.render('accountGroup_form', { title: 'Create AccountGroup' })
}

async function accountGroup_create_post(req, res, next) {
    const errors = validationResult(req)

    var accountGroup = new AccountGroup({
        Name: req.body.NameFromForm,
    })

    if (!errors.isEmpty()) {
        res.render('accountGroup_form', {
            title: 'Create accountGroup',
            accountGroupFromForm: accountGroup,
            errors: errors.array(),
        })
        return
    } else {
        try {
            let found_accountGroup = await AccountGroup.findOne({
                Name: req.body.NameFromForm,
            })
            if (found_accountGroup) {
                res.redirect(found_accountGroup.url)
            } else {
                await accountGroup.save()
                res.redirect('/accountGroup/list')
            }
        } catch (err) {
            return next(err)
        }
    }
}
let accountGroup_create_post_array = [
    body('NameFromForm', 'AccountGroup name required')
        .isLength({ min: 1 })
        .trim(),
    body('NameFromForm').trim().escape(),
    (req, res, next) => accountGroup_create_post(req, res, next),
]

exports.accountGroup_delete_get = function (req, res) {
    res.send('NOT IMPLEMENTED: accountGroup delete GET')
}

exports.accountGroup_delete_post = function (req, res) {
    res.send('NOT IMPLEMENTED: accountGroup delete POST')
}

function accountGroup_update_get(req, res, next) {
    AccountGroup.findById(req.params.id).exec(function (err, result) {
        if (err) {
            next(err)
        }
        res.render('accountGroup_form', {
            title: 'Update AccountGroup',
            accountGroupFromForm: result,
        })
    })
}

async function accountGroup_update_post(req, res, next) {
    let accountGroup = new AccountGroup({
        Name: req.body.NameFromForm,
        _id: req.params.id,
    })

    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        res.render('accountGroup_form', {
            title: 'Update AccountGroup',
            accountGroupFromForm: accountGroup,
        })
    } else {
        try {
            let theAccountGroup = await AccountGroup.findByIdAndUpdate(
                req.params.id,
                accountGroup,
                [],
            )
            res.redirect(theAccountGroup.url)
        } catch (err) {
            return next(err)
        }
    }
}
let accountGroup_update_post_array = [
    body('NameFromForm').trim().escape(),
    (req, res, next) => accountGroup_update_post(req, res, next),
]

function deleteAccountGroups(req, res, next) {
    AccountGroup.remove({}, function (err) {
        if (err) {
            next(err)
        } else {
            res.end('success')
        }
    })
}

exports.accountGroup_list = accountGroup_list
exports.accountGroup_create_get = accountGroup_create_get
exports.accountGroup_create_post = accountGroup_create_post_array
exports.accountGroup_update_get = accountGroup_update_get
exports.accountGroup_update_post = accountGroup_update_post_array
exports.deleteAccountGroups = deleteAccountGroups
