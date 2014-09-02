var socket = io();
var App = {};


function getGameID() {
    var pathname = window.location.pathname.split('/');
    var gameID = pathname[pathname.length - 1];
    return gameID;
}

$(function() {


    var gameInitialState = {
        id: getGameID(),
        tiles: []
    };

    socket.emit('room:join', gameInitialState);

    socket.on('game:saved', Sockets.onGameSaved);

    socket.on('game:load', Sockets.onGameLoad);

    socket.on('game:reset', Sockets.onGameReset);

});