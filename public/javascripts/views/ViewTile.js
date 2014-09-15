var TileView = Backbone.View.extend({
    template: _.template($('#tile-template').html()),
    events: {
        "click": "onClick",
    },
    initialize: function(options) {
        this.parent = options.parent;
        this.listenTo(this.model, "change:hasBeenSelected", this.markTile);
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
        console.log(this.model);
        var player = this.model.get('selectedBy');
        this.model.stamp();
        var nextPlayer = player === 0 ? 1 : 0;
        this.model.collection.currentPlayer = nextPlayer;
        if (player === 0) {
            this.$el
                .addClass("one")
                .removeClass("two");
            this.parent.renderP2Turn();
        } else if (player === 1) {
            this.$el
                .addClass("two")
                .removeClass("one");
            this.parent.renderP1Turn();
        }

        this.model.collection.checkIfEnd();

        return this;
    },
});