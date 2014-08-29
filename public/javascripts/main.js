var socket = io();

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
        possibleWins: [],
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
        generateWins: function() {
            this.horizontalWins();
            this.verticalWins();
            this.crossWins();
            return this;
        },
        horizontalWins: function() {
            for (var yy = 0; yy < this.boardSize; yy++) {
                var wins = [];
                for (var xx = 0; xx < this.boardSize; xx++) {
                    wins.push({
                        x: xx,
                        y: yy
                    });
                }
                this.possibleWins.push(wins);
            }

            return this;
        },
        verticalWins: function() {
            for (var xx = 0; xx < this.boardSize; xx++) {
                var wins = [];
                for (var yy = 0; yy < this.boardSize; yy++) {
                    wins.push({
                        x: xx,
                        y: yy
                    });
                }
                this.possibleWins.push(wins);
            }
            return this;
        },
        crossWins: function() {
            var topLeftBottomRight = [],
                bottomLeftTopRight = [];

            for (var size = 0; size < this.boardSize; size++) {
                topLeftBottomRight.push({
                    x: size,
                    y: size
                });
                bottomLeftTopRight.push({
                    x: size,
                    y: this.boardSize - 1 - size
                });
            }
            this.possibleWins.push(topLeftBottomRight);
            this.possibleWins.push(bottomLeftTopRight);
            return this;
        },
        checkIfWin: function() {
            var lastTile = Tiles.getLastTile();
            var playerTiles = Tiles.getSelectedTiles(lastTile);
            var possibleWins = Tiles.possibleWins;
            var playerTileCoords = [];
            var i = 0;

            for (i; i < playerTiles.length; i++) {
                playerTileCoords.push({
                    x: playerTiles[i].get("x"),
                    y: playerTiles[i].get("y")                  
                });
            }

            for (i = 0; i < possibleWins.length; i++) {
                var count = 0,
                    numSelectedTiles = Tiles.getSelectedTiles().length;
                for (var j = 0; j < possibleWins[i].length; j++) {
                    for (var k = 0; k < playerTileCoords.length; k++) {
                        if (possibleWins[i][j].x == playerTileCoords[k].x &&
                            possibleWins[i][j].y == playerTileCoords[k].y) {
                            count++;
                        }
                    }
                }
                if (count == Tiles.boardSize) {
                    lastTile.trigger("win");
                    return true;
                } else if (numSelectedTiles == Tiles.boardSize * Tiles.boardSize) {
                    lastTile.trigger("tie");
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
                id: window.location.pathname
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
                socket.emit('game:reset', window.location.pathname);
            });
            return this;
        },
        render: function(tiles, options) {
            this.$el.empty();   
            Tiles.boardSize = options.size;
            Tiles.generateWins();

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
        id: window.location.pathname,
        tiles: []
    };

    socket.emit('room:join', gameInitialState);

    socket.on('game:saved', function(tiles) {
        if (tiles.length === 9) {
            console.log('game was saved!');
            Tiles.set(tiles);
        }
    });

    socket.on('game:load', function(tiles) {
        if (tiles.length === 9) {
            var sortedTiles = _.sortBy(
                tiles,
                'timeStamp'
            );
            console.log('game was loaded!');
            Tiles = new AllTiles();
            App = new BoardView(
                tiles,
                {
                    size : 3
                }
            );
            Tiles.set(sortedTiles);        
        }
    });

    socket.on('game:reset', function() {
        console.log('game was reset!')
        $("#overlay-bg").removeClass("show");
        $("#message").removeClass("show");
        Tiles.reset([], {size: 3});
        Tiles.allowClicks = true;
        Tiles.saveGame();
    });

});