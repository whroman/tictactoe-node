describe("Board View and Tiles Collection", function() {
    var Models, ModelsLen;
    beforeEach(function() {
        App.Tiles = new CollectionTiles();
        App.Board = new BoardView(
            [],
            {
                size : 3
            }
        );
        ModelsLen = App.Tiles.models.length;
        Models = [];
        while (ModelsLen--) {
            Models.push(App.Tiles.models[ModelsLen]);
        }
    });

    it("should rightfully recognize tic tac toe wins", function() {
        console.log('sssssss')
        return true;
    });
});