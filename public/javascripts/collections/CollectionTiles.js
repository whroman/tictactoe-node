var CollectionTiles = Backbone.Collection.extend({
    model: ModelTile,
    sync: function() {
        return false;
    },
    comparator: "id",
    numOfClicks: 0,
    currentPlayer: 0,
    boardSize: null,
    allowClicks: true,
    nextId: function() {
        if (!this.length) return 1;
        return this.last().get("id") + 1;
    },
    newGame: function(boardSize) {
        for ( var yy = 0; yy < boardSize; yy++ ) {
            for ( var xx = 0; xx < boardSize; xx++ ) {
                var tile = this.create({
                    x: xx, 
                    y: yy, 
                });
                tile.save();
            }
        }
    },
    check: {
        col: {
            val: null,
            filter: function(model) {
                var isInCol = model.get('x') === App.Tiles.check.col.val;
                return isInCol;
            },
            win: function(tiles) {
                var col = _.filter(tiles, this.filter);
                if (col.length === 3) return true;
                return false;
            }
        },
        row: {
            val: null,
            filter: function(model) {
                var isInRow = model.get('y') === App.Tiles.check.row.val;
                return isInRow;
            },
            win: function(tiles) {
                var row = _.filter(tiles, this.filter);
                if (row.length === 3) return true;
                return false;
            }
        },
        diag: {
            filter: function(model) {
                var isInDiag = model.get('x') === model.get('y');
                console.log(isInDiag, model)
                return isInDiag;
            },
            win: function(tiles) {
                var diag = _.filter(tiles, this.filter);
                console.log(diag, tiles)
                if (diag.length === 3) return true;
                return false;
            }
        },
    },
    checkIfWin: function() {
        var lastTile = App.Tiles.getLastTile();
        var playerTiles;

        if (lastTile) {
            playerTiles = App.Tiles.getSelectedTiles(lastTile);
            App.Tiles.check.col.val = lastTile.get('x');
            App.Tiles.check.row.val = lastTile.get('y');

            if (App.Tiles.check.col.val  === App.Tiles.check.row.val ) {
                if (App.Tiles.check.diag.win(playerTiles)) {
                    lastTile.trigger("win");
                    return true;   
                }
            }

            if (App.Tiles.check.col.win(playerTiles)) {
                lastTile.trigger("win");
                return true;   
            }

            if (App.Tiles.check.row.win(playerTiles)) {
                lastTile.trigger("win");
                return true;   
            }
        }

        return false;
    },
    endOfGame: function() {
        App.Tiles.allowClicks = false;
    },
    saveGame: function() {
        var gameState = {
            tiles: this.models,
            id: getGameID()
        };
        Sockets.io.emit('game:save', gameState);
    },
    getSelectedTiles: function(tile) {
        var query;
        if (tile) {
            query = {
                "selectedBy": tile.get("selectedBy")
            };
        } else {
            query = {
                "hasBeenSelected": true
            };
        }

        return this.where(query);
    },
    getLastTile: function() {
        var lastTile = _.max(
            App.Tiles.getSelectedTiles(),
            function(tile) {
                return tile.get("timeStamp");
            }
        );

        if (lastTile === -Infinity) {
            lastTile = false;
        }

        return lastTile;
    }
});