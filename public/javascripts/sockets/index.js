var Sockets = {
    io: io(),
    onGameSaved: function(tiles) {
        if (tiles.length === 9) {
            App.Board.collection.set(tiles);
        }
    },
    onGameLoad: function(doc) {
        var playerObj = {
            playerOne: doc.playerOne,
            playerTwo: doc.playerTwo,
        };

        var collection = new CollectionTiles();
        App.Board = new BoardView(
            [],
            {
                size: 3,
                collection: collection
            }
        );

        if (doc.tiles.length === 9) {
            var sortedTiles = _.sortBy(
                doc.tiles,
                'timeStamp'
            );
            
            App.Board.collection.set(sortedTiles);
        }

        App.Forms.loadValues(playerObj);
    },
    onGameReset: function() {
        var collection = new CollectionTiles();
        $("#overlay-bg").removeClass("show");
        $("#message").removeClass("show");
        App.Board = new BoardView(
            [],
            {
                size: 3,
                collection: collection
            }
        );
        App.Board.collection.allowClicks = true;
        App.Board.collection.saveGame();
    },
    onGamePlayerUpdated: function(playerObj) {
        App.Forms.loadValues(playerObj);
    }
};