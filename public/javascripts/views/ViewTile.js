var TileView = Backbone.View.extend({
    template: _.template($('#tile-template').html()),
    events: {
        "click": "onClick",
    },
    initialize: function() {
        this.listenTo(this.model, "change:hasBeenSelected", this.markTile);
        this.listenTo(this.model, "change:hasBeenSelected", App.Tiles.checkIfEnd);
    },
    render: function() {
        return this.template(this.model.toJSON());
    },
    // Update Model
    onClick: function() {
        this.model.click();
        return this;
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
            App.Board.renderP2Turn();
        } else if (player === 1) {
            this.$el
                .addClass("two")
                .removeClass("one");
            App.Board.renderP1Turn();
        }
        return this;
    },
});