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

    Sockets.io.emit('room:join', gameInitialState);

    Sockets.io.on('game:saved', Sockets.onGameSaved);

    Sockets.io.on('game:load', Sockets.onGameLoad);

    Sockets.io.on('game:reset', Sockets.onGameReset);

});