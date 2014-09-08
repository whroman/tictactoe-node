var CollectionTiles = Backbone.Collection.extend({
    model: ModelTile,
    sync: function() {
        return false;
    },
    comparator: "id",
    numOfClicks: 0,
    currentPlayer: 0,
    allowClicks: true,
    win: undefined, // App.Services.win(size)
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
    checkIfEnd: function() {
        var lastTile = this.getLastTile();

        var tileKey = lastTile.get('x') + '' + lastTile.get('y');
        var player = lastTile.get('selectedBy');
        var tallyBy; 

        if (player === 0) {
            tallyBy = -1;
        } else if (player === 1) {
            tallyBy = 1;
        }

        this.win.update(tileKey, tallyBy);
        if (this.win.gameWon === true) {
            lastTile.trigger('win');
        } else {
            if (this.getSelectedTiles().length === 9) {
                lastTile.trigger('tie');
            }
        }

        return this;
    },
    endOfGame: function() {
        this.allowClicks = false;
    },
    saveGame: function() {
        if (getGameID() !== "") {
            var gameState = {
                tiles: this.models,
                id: getGameID()
            };
            Sockets.io.emit('game:save', gameState);
        }
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
            this.getSelectedTiles(),
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