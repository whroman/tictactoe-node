var IO;
var GameModel;

function init(http, mongoose) {
    IO = require('socket.io')(http);
    GameModel = require('../models/Game.js')(mongoose);

    IO.sockets.on('connection', onConnection);

    return IO;
}

function onConnection(socket) {
    console.log('a user connected');

    socket
        .on('room:join', onRoomJoin)
        .on('game:save', onGameSave)
        .on('game:reset', onGameReset)
        .on('disconnect', onDisconnect);

}

function onRoomJoin(data) {
    var socket = this;

    console.log('Socket.io: join room');

    socket.join(data.id);

    var createDoc = {
        cb: function(err, doc) {
            if (!err) {
                console.log('Creation of doc ' + doc.id + ' was successful!')
                IO.sockets
                    .in(data.id)
                    .emit('game:load', createDoc.set.tiles);
            } else {
                logError(err, doc)
            }
        },
        query: {
            id: data.id
        },
        set: {
            id: data.id,
            tiles: []
        },
        options: {
            upsert: true
        }
    };

    var getModelCB = function(doc) {
        var query, update, options, cb;
        if (docDoesntExist(doc)) {
            console.log('Creating new doc: ' + data.id);

            GameModel.update(
                createDoc.query,
                createDoc.set,
                createDoc.options,
                createDoc.cb
            );

        } else {
            console.log("loading doc: " + doc[0].id);

            IO.sockets
                .in(doc[0].id)
                .emit('game:load', doc[0].tiles);
        }
    };

    var docDoesntExist = function (doc) {
        var doesntExist = false;
        if (doc.length === 0) {
            doesntExist = true;
        } else if (doc[0].tiles.length != 9){
            doesntExist = true;
        }
        return doesntExist;
    }

    GameModel
        .where('id')
        .equals(data.id)
        .limit(1)
        .exec()
        .addCallback(getModelCB)
        .addErrback(logError);

    return socket;
}

function onGameSave(data) {
    var socket = this;

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
        if (!err) {
            console.log('Saved game: ' + data.id);
            IO.sockets
                .in(data.id)
                .emit('game:saved', data.tiles);
        }
    };

    GameModel.update(
        query, 
        set, 
        cb
    );

    return socket;
}

function onGameReset(id) {
    var socket = this;

    console.log('Game is being reset');
    IO.sockets
        .in(id)
        .emit('game:reset');

    return socket;
}

function onDisconnect() {
    console.log('user disconnected');
}

function logError(error, item) {
    console.log('There was an error', error, item);
}


module.exports = init;