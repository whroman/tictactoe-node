var socket = io();

function getGameID() {
    var pathname = window.location.pathname.split('/');
    var gameID = pathname[pathname.length - 1];
    return gameID;
}

$(function() {
    var Tile = Backbone.Model.extend({
        defaults: function() {
            var order = Tiles.nextId();
            return {
                id: order,
                hasBeenSelected: false,
                selectedBy: "",
                timeStamp: 0
            };
        },
        sync: function() {
            return false;
        },
        x : "", 
        y : "",
        stamp: function() {
            var stamp = (new Date().getTime());
            this.set('timeStamp', stamp);
        }
    });

    var AllTiles = Backbone.Collection.extend({
        model: Tile,
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
                    var isInCol = model.get('x') === Tiles.check.col.val;
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
                    var isInRow = model.get('y') === Tiles.check.row.val;
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
                    return isInDiag;
                },
                win: function(tiles) {
                    var diag = _.filter(tiles, this.filter);
                    if (diag.length === 3) return true;
                    return false;
                }
            },
        },
        checkIfWin: function() {
            var lastTile = Tiles.getLastTile();
            var playerTiles;

            if (lastTile) {
                playerTiles = Tiles.getSelectedTiles(lastTile);
                Tiles.check.col.val = lastTile.get('x');
                Tiles.check.row.val = lastTile.get('y');

                if (Tiles.check.col.val  === Tiles.check.row.val ) {
                    if (Tiles.check.diag.win(playerTiles)) {
                        lastTile.trigger("win");
                        return true;   
                    }
                }

                if (Tiles.check.col.win(playerTiles)) {
                    lastTile.trigger("win");
                    return true;   
                }

                if (Tiles.check.row.win(playerTiles)) {
                    lastTile.trigger("win");
                    return true;   
                }
            }

            return false;
        },
        endOfGame: function() {
            Tiles.allowClicks = false;
        },
        saveGame: function() {
            var gameState = {
                tiles: this.models,
                id: getGameID()
            };
            socket.emit('game:save', gameState);
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
                Tiles.getSelectedTiles(),
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

    var TileView = Backbone.View.extend({
        template: _.template($('#tile-template').html()),
        events: {
            "click": "tileClick",
        },
        initialize: function() {
            this.listenTo(this.model, "change:hasBeenSelected", this.markTile);
            this.listenTo(this.model, "change:hasBeenSelected", Tiles.checkIfWin);
        },
        render: function() {
            return this.template(this.model.toJSON());
        },
        // Update Model
        tileClick: function() {
            if (this.model.get("hasBeenSelected") === false &&  Tiles.allowClicks === true) {
                var tile = {
                    selectedBy: Tiles.currentPlayer,
                    hasBeenSelected: true
                };
                this.model.save(tile);
                Tiles.saveGame();
            }
        },
        // Update View
        markTile: function() {
            var player = this.model.get('selectedBy');
            this.model.stamp();
            var nextPlayer = player === 0 ? 1 : 0;
            Tiles.currentPlayer = nextPlayer;
            if (player === 0) {
                this.$el
                    .addClass("one")
                    .removeClass("two");
                App.playerOne
                    .removeClass("one");
                App.playerTwo
                    .addClass("two");
                App.$el
                    .addClass("two")
                    .removeClass("one");
            } else if (player === 1) {
                this.$el
                    .addClass("two")
                    .removeClass("one");
                App.playerTwo
                    .removeClass("two");
                App.playerOne
                    .addClass("one");
                App.$el
                    .addClass("one")
                    .removeClass("two");
            }
        },
    });

    var BoardView = Backbone.View.extend({
        el: $("#board"),
        playerOne : $(".player.one .tile"),
        playerTwo : $(".player.two .tile"),
        initialize: function(tiles, options) {
            this
                .setCollectionEvents()
                .setDOMEvents()
                .render(tiles, options);
        },
        setCollectionEvents: function() {
            this.listenTo(Tiles, "win", this.win);
            this.listenTo(Tiles, "tie", this.tie);
            this.listenTo(Tiles, "reset", this.render);

            return this;
        },
        setDOMEvents: function() {
            $("#overlay-bg").on("click", function() {
                $(this).removeClass("show");
                $("#message").removeClass("show");
            });
            $(".new-game").on("click", function() {                
                socket.emit('game:reset', getGameID());
            });
            return this;
        },
        render: function(tiles, options) {
            this.$el.empty();   
            Tiles.boardSize = options.size;

            if (Tiles.length === 0) {
                Tiles.newGame(options.size);
            }

            if (Tiles.currentPlayer === 0) {
                this.renderP1Turn();
            } else {
                this.renderP2Turn();
            }

            _.each(Tiles.models, this.addTile, this);
        },
        renderP1Turn: function() {
            this.$el
                .addClass("one")
                .removeClass("two");
            this.playerOne
                .addClass("one");
            this.playerTwo
                .removeClass("two");
        },
        renderP2Turn: function() {
            this.$el
                .addClass("two")
                .removeClass("one");
            this.playerTwo
                .addClass("two");
            this.playerOne
                .removeClass("one");
        },
        addTile: function(tile) {
            var elString = "#tileX" + tile.get("x") + 'Y' + tile.get("y");
            var newTileView = new TileView({
                model: tile,
            });
            this.$el.append(newTileView.render());
            newTileView.setElement(elString);
            if (newTileView.model.get("hasBeenSelected") === true) {
                if (newTileView.model.get("selectedBy") === 0) {
                    newTileView.$el.addClass("one");
                } else if (newTileView.model.get("selectedBy") === 1) {
                    newTileView.$el.addClass("two");
                }
            }
        },
        win: function() {
            var tile = Tiles.getLastTile();
            Tiles.endOfGame();
            player = (tile.get("selectedBy") === 0) ? "Green" : "Orange";
            this.displayOverlay(player + " wins!");
        },
        tie: function() {
            this.displayOverlay("It's a tie!");
        },
        displayOverlay: function(text) {
            $("#overlay-bg").addClass("show");          
            $("#message").addClass("show");
            $("#message .title").html(text);    
        }
    });


    var App, Tiles;

    var gameInitialState = {
        id: getGameID(),
        tiles: []
    };

    socket.emit('room:join', gameInitialState);

    socket.on('game:saved', function(tiles) {
        console.log('Game was saved', tiles);
        if (tiles.length === 9) {
            Tiles.set(tiles);
        }
    });

    socket.on('game:load', function(tiles) {
        Tiles = new AllTiles();
        App = new BoardView(
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
            
            Tiles.set(sortedTiles);
        }
    });

    socket.on('game:reset', function() {
        $("#overlay-bg").removeClass("show");
        $("#message").removeClass("show");
        Tiles.reset([], {size: 3});
        Tiles.allowClicks = true;
        Tiles.saveGame();
    });

});