// onGamePlayerUpdate(data)
// data = {
//     id: ID of Doc to be selected,
//     key: Key of Doc that will be updated,
//     val: Value that will replace value stored in Doc[data.key]
// };

function onGamePlayerUpdate(data) {
    var socket = this;

    console.log('Socket.io: player names updated');

    var query = {
        id: data.id
    };

    var set = {};
    set[data.key] = data.val;

    var cb = function(err) {
        if (!err) {
            socket.IO.sockets
                .in(data.id)
                .emit('game:playerUpdated', data);
        }
    };

    socket.GameModel.update(
        query, 
        set, 
        cb
    );

    return socket;
}

module.exports = onGamePlayerUpdate;