var IO;
var GameModel;
var onRoomJoin = require('./onRoomJoin');
var onGameSave = require('./onGameSave');
var onGameReset = require('./onGameReset');

function init(http, mongoose) {
    IO = require('socket.io')(http);
    GameModel = require('../models/Game.js')(mongoose);

    IO.sockets.on('connection', onConnection);

    return IO;
}

function onConnection(socket) {
    console.log('a user connected');

    socket.GameModel = GameModel;
    socket.IO = IO;
    socket.LogError = function logError(error, item) {
        console.log('There was an error', error, item);
    };

    socket
        .on('room:join', onRoomJoin)
        .on('game:save', onGameSave)
        .on('game:reset', onGameReset)
        .on('disconnect', onDisconnect);

}

function onDisconnect() {
    console.log('user disconnected');
}

module.exports = init;