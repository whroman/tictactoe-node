var Sockets = {
    io: io(),
    onGameSaved: function(tiles) {
        if (tiles.length === 9) {
            App.Tiles.set(tiles);
        }
    },
    onGameLoad: function(tiles) {
        App.Tiles = new CollectionTiles();
        App.Board = new BoardView(
            [],
            {
                size : 3
            }
        );

        if (tiles.length === 9) {
            var sortedTiles = _.sortBy(
                tiles,
                'timeStamp'
            );
            
            App.Tiles.set(sortedTiles);
        }
    },
    onGameReset: function() {
        $("#overlay-bg").removeClass("show");
        $("#message").removeClass("show");
        App.Tiles.reset([], {size: 3});
        App.Tiles.allowClicks = true;
        App.Tiles.saveGame();
    }
};