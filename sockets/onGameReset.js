function onGameReset(id) {
    var socket = this;

    console.log('Game is being reset');
    socket.IO.sockets
        .in(id)
        .emit('game:reset');

    return socket;
}

module.exports = onGameReset;