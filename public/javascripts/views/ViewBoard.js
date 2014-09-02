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
        this.listenTo(App.Tiles, "win", this.win);
        this.listenTo(App.Tiles, "tie", this.tie);
        this.listenTo(App.Tiles, "reset", this.render);

        return this;
    },
    setDOMEvents: function() {
        $("#overlay-bg").on("click", function() {
            $(this).removeClass("show");
            $("#message").removeClass("show");
        });
        $(".new-game").on("click", function() {                
            Sockets.io.emit('game:reset', getGameID());
        });
        return this;
    },
    render: function(tiles, options) {
        this.$el.empty();   
        App.Tiles.boardSize = options.size;

        if (App.Tiles.length === 0) {
            App.Tiles.newGame(options.size);
        }

        if (App.Tiles.currentPlayer === 0) {
            this.renderP1Turn();
        } else {
            this.renderP2Turn();
        }

        _.each(App.Tiles.models, this.addTile, this);
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
        var tile = App.Tiles.getLastTile();
        App.Tiles.endOfGame();
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