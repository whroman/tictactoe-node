var TileView = Backbone.View.extend({
    template: _.template($('#tile-template').html()),
    events: {
        "click": "tileClick",
    },
    initialize: function() {
        this.listenTo(this.model, "change:hasBeenSelected", this.markTile);
        this.listenTo(this.model, "change:hasBeenSelected", App.Tiles.checkIfWin);
    },
    render: function() {
        return this.template(this.model.toJSON());
    },
    // Update Model
    tileClick: function() {
        if (this.model.get("hasBeenSelected") === false &&  App.Tiles.allowClicks === true) {
            var tile = {
                selectedBy: App.Tiles.currentPlayer,
                hasBeenSelected: true
            };
            this.model.save(tile);
            App.Tiles.saveGame();
        }
    },
    // Update View
    markTile: function() {
        var player = this.model.get('selectedBy');
        this.model.stamp();
        var nextPlayer = player === 0 ? 1 : 0;
        App.Tiles.currentPlayer = nextPlayer;
        if (player === 0) {
            this.$el
                .addClass("one")
                .removeClass("two");
            App.Board.playerOne
                .removeClass("one");
            App.Board.playerTwo
                .addClass("two");
            App.Board.$el
                .addClass("two")
                .removeClass("one");
        } else if (player === 1) {
            this.$el
                .addClass("two")
                .removeClass("one");
            App.Board.playerTwo
                .removeClass("two");
            App.Board.playerOne
                .addClass("one");
            App.Board.$el
                .addClass("one")
                .removeClass("two");
        }
    },
});