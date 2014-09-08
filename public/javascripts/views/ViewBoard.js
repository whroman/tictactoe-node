var BoardView = Backbone.View.extend({
    el: $("#board"),
    collection: undefined,
    $wrapper: $('#board-wrapper'),
    playerOne : $(".player.one .tile"),
    playerTwo : $(".player.two .tile"),
    initialize: function(tiles, options) {
        this.collection = options.collection;
        this.collection.win = App.Services.win(options.size);

        this
            .setCollectionEvents()
            .setDOMEvents()
            .render(tiles, options);

    },
    setCollectionEvents: function() {
        this.listenTo(this.collection, "win", this.win);
        this.listenTo(this.collection, "tie", this.tie);
        this.listenTo(this.collection, "reset", this.render);

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

        if (this.collection.length === 0) {
            this.collection.newGame(options.size);
        }

        if (this.collection.currentPlayer === 0) {
            this.renderP1Turn();
        } else {
            this.renderP2Turn();
        }

        _.each(
            this.collection.models, 
            this.addTile, 
            this
        );
    },
    renderP1Turn: function() {
        this.$wrapper
            .addClass("one")
            .removeClass("two");
    },
    renderP2Turn: function() {
        this.$wrapper
            .addClass("two")
            .removeClass("one");
    },
    addTile: function(tile) {
        var elString = "#tileX" + tile.get("x") + 'Y' + tile.get("y");
        var newTileView = new TileView({
            model: tile,
            parent: this
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
        var tile = this.collection.getLastTile();
        this.collection.endOfGame();
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