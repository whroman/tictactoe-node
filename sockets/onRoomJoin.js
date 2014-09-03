function onRoomJoin(data) {
    var socket = this;

    console.log('Socket.io: join room');

    socket.join(data.id);

    var createDoc = {
        cb: function(err, doc) {
            if (!err) {
                console.log('Creation of doc ' + doc.id + ' was successful!')
                socket.IO.sockets
                    .in(data.id)
                    .emit('game:load', createDoc.set);
            } else {
                socket.LogError(err, doc)
            }
        },
        query: {
            id: data.id
        },
        set: {
            id: data.id,
            tiles: [],
            playerOne: 'player one',
            playerTwo: 'player two',
        },
        options: {
            upsert: true
        }
    };

    var getModelCB = function(doc) {
        var query, update, options, cb;
        if (docDoesntExist(doc)) {
            console.log('Creating new doc: ' + data.id);

            socket.GameModel.update(
                createDoc.query,
                createDoc.set,
                createDoc.options,
                createDoc.cb
            );

        } else {
            console.log("loading doc: " + doc[0].id);

            socket.IO.sockets
                .in(doc[0].id)
                .emit('game:load', doc[0]);
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

    socket.GameModel
        .where('id')
        .equals(data.id)
        .limit(1)
        .exec()
        .addCallback(getModelCB)
        .addErrback(socket.LogError);

    return socket;
}

module.exports = onRoomJoin;