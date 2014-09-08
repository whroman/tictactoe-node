var ModelTile = Backbone.Model.extend({
    defaults: function() {
        var order = this.collection.nextId();
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
        if (this.get("hasBeenSelected") === false &&  this.collection.allowClicks === true) {
            var tile = {
                selectedBy: this.collection.currentPlayer,
                hasBeenSelected: true
            };
            this.save(tile);
            this.collection.saveGame();
        }
        return this;
    }
});
