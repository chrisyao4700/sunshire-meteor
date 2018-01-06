var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var expressSession = require('express-session');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var index = require('./routes/index');
var users = require('./routes/users');
var flights = require('./routes/flights');
var price = require('./routes/price');
var services =  require('./routes/services');
// var flight_result = require('./routes/flight-result');

// var errorHandler = require('./routes/404');

var app = express();
// app.use(session({
//     secret: 'recommand 128 bytes random string', // 建议使用 128 个字符的随机字符串
//     resave: true,
//     saveUninitialized: true,
//     cookie: { maxAge: 60 * 1000 }
// }));
app.use(expressSession({secret:'max',saveUninitialized:false, resave:false}));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use('/bower_components',  express.static(__dirname + '/bower_components'));
app.use('/semantic',  express.static(__dirname + '/semantic'));
// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
// app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
// app.use('/flight-result',flight_result);
app.use('/flights',flights);
app.use('/price',price);
app.use('/users', users);
app.use('/services',services);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler

// app.use(errorHandler);
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
