'use strict';
let Tag = require('../models/tag.js');
const { body, validationResult } = require('express-validator');

function tag_list(req, res, next) {
  Tag.find().exec(function(err, list_tags) {
    if (err) {
      return next(err);
    }
    res.render('tag_list', { title: 'Tag List', tag_list: list_tags });
  });
};

function tag_create_get(req, res) {
  res.render('tag_form', { title: 'Create Tag' });
};

function tag_create_post(req, res, next) {
  const errors = validationResult(req);

  var tag = new Tag({
    Name: req.body.NameFromForm,
    LocalId: req.body.LocalIdFromForm,
  });

  if (!errors.isEmpty()) {
    res.render('tag_form', {
      title: 'Create tag',
      tagFromForm: tag,
      errors: errors.array(),
    });
    return;
  } else {
    Tag.findOne({ Name: req.body.NameFromForm }).exec(function(err, found_tag) {
      if (err) {
        return next(err);
      }
      if (found_tag) {
        res.redirect(found_tag.url);
      } else {
        tag.save(function(err) {
          if (err) {
            return next(err);
          }
          res.redirect('/order/createWithNewLists');
        });
      }
    });
  }
};
let tag_create_post_array = [
  body('NameFromForm', 'Tag name required')
    .isLength({ min: 1 })
    .trim(),
  body('NameFromForm')
    .trim()
    .escape(),
  body('LocalIdFromForm')
    .trim()
    .escape(),
  (req, res, next) => tag_create_post(req, res, next),
];

exports.tag_delete_get = function(req, res) {
  res.send('NOT IMPLEMENTED: tag delete GET');
};

exports.tag_delete_post = function(req, res) {
  res.send('NOT IMPLEMENTED: tag delete POST');
};

function tag_update_get(req, res, next) {
  Tag.findById(req.params.id).exec(function(err, result) {
    if (err) {
      next(err);
    }
    res.render('tag_form', { title: 'Update Order', tagFromForm: result });
  });
};

function tag_update_post(req, res, next) {
  let tag = new Tag({
    Name: req.body.NameFromForm,
    LocalId: req.body.LocalIdFromForm,
    _id: req.params.id,
  });

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.render('tag_form', { title: 'Update Order', tagFromForm: tag });
  } else {
    Tag.findByIdAndUpdate(req.params.id, tag, [], function(err, theTag) {
      if (err) {
        return next(err);
      }
      res.redirect(theTag.url);
    });
  }
}
let tag_update_post_array = [
  body('LocalIdFromForm')
    .trim()
    .escape(),
  body('NameFromForm')
    .trim()
    .escape(),
  (req, res, next) => tag_update_post(req, res, next),
];

function deleteTags(req, res, next) {
  Tag.remove({}, function(err) {
    if (err) {
      next(err);
    } else {
      res.end('success');
    }
  });
};

exports.tag_list = tag_list;
exports.tag_create_get = tag_create_get;
exports.tag_create_post = tag_create_post_array;
exports.tag_update_get = tag_update_get;
exports.tag_update_post = tag_update_post_array;
exports.deleteTags = deleteTags;
