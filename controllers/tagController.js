let Tag = require('../models/tag.js');
let Order = require('../models/order.js');
let async = require('async');
const {body, validationResult} = require('express-validator/check');
const {sanitizeBody} = require('express-validator/filter');

// Display list of all tags.
exports.tag_list = function(req, res) {
  Tag.find()
    .exec(function(err, list_tags) {
      if (err) {return next(err);}
      //Successful, so render
      list_tags.sort(function(a, b) {
        return a.OrderNumber - b.OrderNumber;
      })
      res.render('tag_list', {title: 'Tag List', tag_list: list_tags});
    });
};

// Display detail page for a specific tag.
exports.tag_detail = function(req, res, next) {
  async.parallel({
    tag: function(callback) {
      Tag.findById(req.params.id)
        .exec(callback);
    },
    tag_orders: function(callback) {
      Order.find({'ParentTag': req.params.id})
        .exec(callback);
    },
  }, function(err, results) {
    if (err) {
      return next(err);
    }
    if (results.tag == null) {
      let merr = new Error('Tag not m found');
      merr.status = 404;
      return next(merr);
    }
    res.render("tag_detail", {title: 'Tag detail', tag: results.tag, tag_orders: results.tag_orders});
  }

  );

};

// Display tag create form on GET.
exports.tag_create_get = function(req, res) {
  res.render('tag_form', {title: 'Create Tag'});
};

// Handle tag create on POST.
exports.tag_create_post = [

  // Validate that the name field is not empty.

  body('NameFromForm', 'Tag name required').isLength({min: 1}).trim(),

  // Sanitize (trim and escape) the name field.
  sanitizeBody('NameFromForm').trim().escape(),
  sanitizeBody('LocalIdFromForm').trim().escape(),
  sanitizeBody('OrderNumberdFromForm').trim().escape(),
  // Process request after validation and sanitization.
  (req, res, next) => {

    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a genre object with escaped and trimmed data.

    var tag = new Tag(
      {
        Name: req.body.NameFromForm,
        LocalId: req.body.LocalIdFromForm,
        OrderNumber: req.body.OrderNumberFromForm
      }
    );


    if (!errors.isEmpty()) {
      // There are errors. Render the form again with sanitized values/error messages.
      res.render('tag_form', {title: 'Create tag', tagFromForm: tag, errors: errors.array()});

      return;
    }
    else {

      // Data from form is valid.
      // Check if Tag with same name already exists.

      Tag.findOne({'Name': req.body.NameFromForm})
        .exec(function(err, found_tag) {
          if (err) {return next(err);}

          if (found_tag) {
            // Tag exists, redirect to its detail page.
            res.redirect(found_tag.url);

          }
          else {

            tag.save(function(err) {
              if (err) {return next(err);}
              // Genre saved. Redirect to genre detail page.
              res.redirect('/catalog/tag/create');
            });

          }

        });
    }
  }
];

// Display tag delete form on GET.
exports.tag_delete_get = function(req, res) {
  res.send('NOT IMPLEMENTED: tag delete GET');
};

// Handle tag delete on POST.
exports.tag_delete_post = function(req, res) {
  res.send('NOT IMPLEMENTED: tag delete POST');
};

// Display tag update form on GET.
exports.tag_update_get = function(req, res, next) {

  Tag.findById(req.params.id).exec(function(err, result) {
    if (err) {next(err);}
    res.render('tag_form', {title: 'Update Order', tagFromForm: result});
  });

};

// Handle tag update on POST.
exports.tag_update_post = [
  sanitizeBody('LocalIdFromForm').trim().escape(),
  sanitizeBody('OrderNumberFromForm').trim().escape(),
  sanitizeBody('NameFromForm').trim().escape(),
  (req, res, next) => {
    console.dir(req.body);
    let tag = new Tag(
      {
        Name: req.body.NameFromForm,
        LocalId: req.body.LocalIdFromForm,
        OrderNumber: req.body.OrderNumberFromForm,
        _id: req.params.id
      });
    console.dir(tag);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/errors messages.
      res.render('tag_form', {title: 'Update Order', tagFromForm: tag});
    }
    else {
      // Data from form is valid.    

      Tag.findByIdAndUpdate(req.params.id, tag, [], function(err, theTag) {
        if (err) {return next(err);}
        console.log(theTag);
        res.redirect(theTag.url);
      });
    }
  }
]