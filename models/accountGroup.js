'use strict'
let mongoose = require('mongoose')
let moment = require('moment')
let Helper = require('../controllers/helperController.js')

let Schema = mongoose.Schema

let AccountGroupSchema = new Schema({
    Name: { type: String, max: 100 },
})

// Virtual for accountGroup's URL
AccountGroupSchema.virtual('url').get(function () {
    return '/accountGroup/' + this._id + '/update'
})

module.exports = mongoose.model('AccountGroup', AccountGroupSchema)
