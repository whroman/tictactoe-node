var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var mongo = require('mongodb');
var mongoose = require('mongoose');
mongoose.connect('localhost:27017/tictactoe');
mongoose.set('debug', true)

var db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));

var GameSchema = new mongoose.Schema({
    id: String,
    tiles: Array,
    lastModified: {
        type: Number,
        default: function() {
            return (new Date().getTime());
        } 
    }
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

    socket.on('room:join', function(data) {
        console.log('Socket.io: join room');

        socket.join(data.id);

        var cb = function(doc) {
            var query, update, options, cb;
            console.log(doc)
            if (docDoesntExist(doc)) {
                console.log('creating new doc: ' + data.id);

                query = {
                    id: data.id
                }

                update = {
                    id: data.id,
                    tiles: [
                        {}, {}, {}, {}, {}, {}, {}, {}, {}
                    ]
                };

                options = {
                    upsert: true
                };

                cb = function(err, doc) {
                    if (!err) {
                        console.log('Creation of doc was successful!', doc.id)
                        io.sockets
                            .in(data.id)
                            .emit('game:load', update.tiles);
                    } else {
                        console.log('Creation error', doc)
                    }
                }

                GameModel.update(
                    query,
                    update,
                    options,
                    cb
                );

            } else {
                console.log("loading doc: " + doc[0].id);

                io.sockets
                    .in(doc[0].id)
                    .emit('game:load', doc[0].tiles);
            }
        };

        var docDoesntExist = function (doc) {
            return doc.length === 0;
        }

        GameModel
            .where('id')
            .equals(data.id)
            .limit(1)
            .exec()
            .addCallback(cb)
            .addErrback(logError);

    });

    socket.on('game:save', function(data) {
        console.log('Socket.io: game save');

        var query = {
            id: data.id
        };

        var date = (new Date().getTime());

        var set = {
            tiles: data.tiles,
            lastModified: date
        };

        var cb = function(err) {
            var log = 'Saved game ' + data.id + ': ' + data.tiles;
            if (!err) {
                console.log(log);
                io.sockets
                    .in(data.id)
                    .emit('game:saved', data.tiles);
            }
        };

        GameModel
            .update(query, set, cb)

    });

    socket.on('game:reset', function(id) {
        console.log('Game is being reset');
        io.sockets
            .in(id)
            .emit('game:reset');

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
app.use(express.static(__dirname));

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

function logError(error, item) {
    console.log('There was an error', error, item);
}

module.exports = app;
