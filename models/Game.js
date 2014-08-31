function createModel(mongoose) {
    var GameSchema = new mongoose.Schema({
        id: String,
        tiles: Array,
        lastModified: {
            type: Number,
            default: function() {
                return (new Date().getTime());
            } 
        }
    });

    var GameModel = mongoose.model('Game', GameSchema);

    return GameModel;
}

module.exports = createModel;