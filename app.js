'use strict';
let express = require('express');
let path = require('path');
let favicon = require('serve-favicon');
let logger = require('morgan');
let cookieParser = require('cookie-parser');
let bodyParser = require('body-parser');
let session = require('express-session');


let requestLogin = require('./routes/requestLogin');
let tagRouter = require('./routes/tagRouter.js');
let orderRouter = require('./routes/orderRouter.js');
let rootRouter = require('./routes/rootRouter.js');

let app = express();
app.locals.moment = require('moment');
// view engine setup
app.set('views', path.join(__dirname, 'views'));
// test
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
// app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(favicon(__dirname + '/public/images/favicon.ico'));
app.use(
  session({
    secret: 'work hard',
    resave: true,
    saveUninitialized: false,
  })
);
app.use('/', requestLogin);
app.use('/', rootRouter);
app.use('/tag', tagRouter);
app.use('/order', orderRouter);

// Set up mongoose connection
let mongoose = require('mongoose');

let mongoDB =
  process.env.MONGODB_URI ||
  'mongodb://TestUser:TestPassword@testbudgetweb-shard-00-00-ppkcc.mongodb.net:27017,testbudgetweb-shard-00-01-ppkcc.mongodb.net:27017,testbudgetweb-shard-00-02-ppkcc.mongodb.net:27017/test?ssl=true&replicaSet=TestBudgetWeb-shard-0&authSource=admin&retryWrites=true';
mongoose.connect(mongoDB, { useNewUrlParser: true });
mongoose.Promise = global.Promise;
let db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  let err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
