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
            socket.IO.sockets
                .in(data.id)
                .emit('game:saved', data.tiles);
        }
    };

    socket.GameModel.update(
        query, 
        set, 
        cb
    );

    return socket;
}

module.exports = onGameSave;