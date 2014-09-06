var ModelTile = Backbone.Model.extend({
    defaults: function() {
        var order = App.Tiles.nextId();
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
    stamp: function() {
        var stamp = (new Date().getTime());
        this.set('timeStamp', stamp);
    },
    click: function() {
        if (this.get("hasBeenSelected") === false &&  App.Tiles.allowClicks === true) {
            var tile = {
                selectedBy: App.Tiles.currentPlayer,
                hasBeenSelected: true
            };
            this.save(tile);
            App.Tiles.saveGame();
        }
        return this;
    }
});
