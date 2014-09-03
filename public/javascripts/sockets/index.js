var Sockets = {
    io: io(),
    onGameSaved: function(tiles) {
        if (tiles.length === 9) {
            App.Tiles.set(tiles);
        }
    },
    onGameLoad: function(doc) {
        var playerObj = {
            playerOne: doc.playerOne,
            playerTwo: doc.playerTwo,
        };

        App.Tiles = new CollectionTiles();
        App.Board = new BoardView(
            [],
            {
                size : 3
            }
        );

        if (doc.tiles.length === 9) {
            var sortedTiles = _.sortBy(
                doc.tiles,
                'timeStamp'
            );
            
            App.Tiles.set(sortedTiles);
        }

        App.Forms.loadValues(playerObj);
    },
    onGameReset: function() {
        $("#overlay-bg").removeClass("show");
        $("#message").removeClass("show");
        App.Tiles.reset([], {size: 3});
        App.Tiles.allowClicks = true;
        App.Tiles.saveGame();
    },
    onGamePlayerUpdated: function(playerObj) {
        App.Forms.loadValues(playerObj);
    }
};