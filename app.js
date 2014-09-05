var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var mongo = require('mongodb');
var mongoose = require('mongoose');


mongoose.connect(process.env.DB_URI);
// mongoose.set('debug', true)

var db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));

var gulp = require('./Gulpfile.js');

var routes = {
    index: require('./routes/index'),
    game: require('./routes/game'),
};

var app = express();
var http = require('http').Server(app);

var io = require('./sockets')(http, mongoose);

var port = process.env.PORT || 3000;

http.listen(port, function(foo){
    console.log('listening on *:' + port);
});

if (process.env.ENV === 'dev') {
    gulp.start('dev');
}

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.static(__dirname));

app.use('/socket.io', function(req, res) {
    console.log('socket connected');
});

app.use('/', routes.index);
app.use('/game', routes.game);

/// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (process.env.ENV === 'dev') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

function logError(error, item) {
    console.log('There was an error', error, item);
}

module.exports = app;
