var CollectionTiles = Backbone.Collection.extend({
    model: ModelTile,
    sync: function() {
        return false;
    },
    comparator: "id",
    numOfClicks: 0,
    currentPlayer: 0,
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
    win: {
        tallies: {
        // '00-10-20-': 0,
        // '01-11-21-': 0,
        // '02-12-22-': 0,
        // '00-01-02-': 0,
        // '10-11-12-': 0,
        // '20-21-22-': 0,
        // '00-11-22-': 0,
        // '20-11-02-': 0,
        },
        gameWon: undefined,
        update: function(tileKey, tallyBy) {
            _.each(
                this.tallies,
                function(val, key) {
                    if (key.indexOf(tileKey) !== -1) {
                        this.tallies[key] += tallyBy;

                        if (this.tallies[key] === 3 || this.tallies[key] === -3) {
                            this.gameWon = true;
                        }
                    }
                },
                this
            );
        },
        init: function(size) {
            this.gameWon = false;
            var hWins = this.getHorizontalWins(size);
            var vWins = this.getVerticalWins(size);
            var dWins = this.getDiagonalWins(size);

            _.extend(
                this.tallies,
                hWins,
                vWins,
                dWins
            );
        },
        getHorizontalWins: function(size) {
            var wins = {};
            var y = 0;
            var x;
            var key;
            for (y; y < size; y++) {
                key = '';
                for (x = 0; x < size; x++) {
                    key += x + '' + y + '-';
                }
                wins[key] = 0;
            }
            return wins;
        },
        getVerticalWins: function(size) {
            var wins = {};
            var x = 0;
            var y;
            var key;
            for (x; x < size; x++) {
                key = '';
                for (y = 0; y < size; y++) {
                    key += x + '' + y + '-';
                }
                wins[key] = 0;
            }
            return wins;
        },
        getDiagonalWins: function(size) {
            var wins = {};
            var ii;
            var key = '';

            for (ii = 0; ii < size; ii++) {
                key += (ii + '' + ii + '-');
            }
            wins[key] = 0;

            key = ''
            for (ii = 0; ii < size; ii++) {
                var jj = size - 1 - ii;
                key += (ii + '' + jj + '-');
            }
            wins[key] = 0;

            return wins;
        }
    },
    checkIfEnd: function() {
        var lastTile = App.Tiles.getLastTile();

        var tileKey = lastTile.get('x') + '' + lastTile.get('y');
        var player = lastTile.get('selectedBy');
        var tallyBy; 

        if (player === 0) {
            tallyBy = -1;
        } else if (player === 1) {
            tallyBy = 1;
        }

        App.Tiles.win.update(tileKey, tallyBy);
        if (App.Tiles.win.gameWon === true) {
            lastTile.trigger('win');
        } else {
            if (App.Tiles.getSelectedTiles().length === 9) {
                lastTile.trigger('tie');
            }
        }

        return this;
    },
    endOfGame: function() {
        App.Tiles.allowClicks = false;
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