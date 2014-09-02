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
    x : "", 
    y : "",
    stamp: function() {
        var stamp = (new Date().getTime());
        this.set('timeStamp', stamp);
    }
});
