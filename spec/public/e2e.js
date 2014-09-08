describe("Board View and Tiles Collection", function() {
    var Models, ModelsLen;

    var test = 1;
    // Board Tiles
    // 00 10 20
    // 01 11 21
    // 02 12 22
    var Wins = {
        //      0    1    0    1    0
        row1: ['00','11','10','22','20'],
        row2: ['01','00','11','22','21'],
        row3: ['02','00','12','11','22'],
        col1: ['00','22','01','11','02'],
        col2: ['10','22','11','00','12'],
        col3: ['20','00','21','11','22'],
        diag1:['00','10','11','01','22'],
        diag2:['20','00','11','22','02'],
        check: function(key) {
            console.log(App.Board.collection.win.tallies)
            var tiles = this[key];
            var tilesLen = tiles.length;
            var i = 0;

            for (i; i < tilesLen; i++) {
                var tileKey = tiles[i];
                Models[tileKey].click();
                console.log('Testing ' + key, App.Board.collection.win.tallies);
            }

            expect(App.Board.collection.win.gameWon).toEqual(true);
        }
    };

    beforeEach(function() {
        var collection = new CollectionTiles();
        App.Board = new BoardView(
            [],
            {
                size : 3,
                collection: collection
            }
        );
        ModelsLen = App.Board.collection.models.length;
        Models = {};

        while (ModelsLen--) {
            var tile = App.Board.collection.where({id: (ModelsLen + 1)})[0];
            var x = tile.get('x');
            var y = tile.get('y');
            var key = '' + x + '' + y;
            Models[key] = tile;
        }

    });

    it("should recognize a diag1 win", function(){
        Wins.check('diag1');
    });

    it("should recognize a diag2 win", function(){
        Wins.check('diag2');
    });

    it("should recognize a col1 win", function(){
        Wins.check('col1');
    });

    it("should recognize a col2 win", function(){
        Wins.check('col2');
    });

    it("should recognize a col3 win", function(){
        Wins.check('col3');
    });

    it("should recognize a row1 win", function(){
        Wins.check('row1');
    });

    it("should recognize a row2 win", function(){
        Wins.check('row2');
    });

    it("should recognize a row3 win", function(){
        Wins.check('row3');
    });

});