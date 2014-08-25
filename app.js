var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var mongo = require('mongodb');
var mongoose = require('mongoose');
mongoose.connect('localhost:27017/tictactoe');
var db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));

var GameSchema = new mongoose.Schema({
    room: String,
    tiles: Array
});

var GameModel = mongoose.model('Game', GameSchema);

var gulp = require('./Gulpfile.js');

var routes = {
    root: require('./routes/root'),
    game: require('./routes/game'),
}

var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

io.sockets.on('connection', function(socket){
    console.log('a user connected');

    var game;

    socket.on('join room', function(room) {
        console.log('Socket.io: join room');

        var data;

        socket.join(room);

        var cb = function(doc) {
            console.log('success', doc);

            if (doc.length === 0) {
                data = {
                    room: room,
                    tiles: []
                };
                game = new GameModel(data);
                game.save(logError);
            }
        };

        var eb = function(error) {
            console.log(error);
        };

        var query = GameModel
            .where('room')
            .equals(room)
            .limit(1)

        query
            .exec()
            .addCallback(cb)
            .addErrback(eb);

    });

    socket.on('game save', function(data) {
        console.log('Socket.io: game save');
        var roomObj = {
            room: data.room
        };


    });

    socket.on('disconnect', function(data){
        console.log('user disconnected');
    });

});

http.listen(3000, function(){
  console.log('listening on *:3000');
});

if (app.get('env') === 'development') {
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
app.use(express.static(path.join(__dirname, 'public')));

function exposeDBToRouter(req, res, next) {
    req.db = db;
    next();    
}

app.use(exposeDBToRouter);
app.use('/socket.io', function(req, res) {
    console.log('socket connected');
});

app.use('/game', routes.game);

app.use('/', routes.root);

/// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
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

function logError(error) {
    console.log(error);
}

module.exports = app;
