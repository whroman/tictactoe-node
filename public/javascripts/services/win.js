App.Services.win = function(size) {
    var win = {
        gameWon: undefined,
        tallies: {
        // '00-10-20-': 0,
        // '01-11-21-': 0,
        // '02-12-22-': 0,
        // '00-01-02-': 0,
        // '10-11-12-': 0,
        // '20-21-22-': 0,
        // '00-11-22-': 0,
        // '20-11-02-': 0,
        },
        init: function(size) {
            this.gameWon = false;
            var hWins = this.getHorizontalWins(size);
            var vWins = this.getVerticalWins(size);
            var dWins = this.getDiagonalWins(size);

            _.extend(
                this.tallies,
                hWins,
                vWins,
                dWins
            );

            return this;
        },
        update: function(tileKey, tallyBy) {
            _.each(
                this.tallies,
                function(val, key) {
                    if (key.indexOf(tileKey) !== -1) {
                        this.tallies[key] += tallyBy;

                        if (this.tallies[key] === 3 || this.tallies[key] === -3) {
                            this.gameWon = true;
                        }
                    }
                },
                this
            );
        },
        getHorizontalWins: function(size) {
            var wins = {};
            var y = 0;
            var x;
            var key;
            for (y; y < size; y++) {
                key = '';
                for (x = 0; x < size; x++) {
                    key += x + '' + y + '-';
                }
                wins[key] = 0;
            }
            return wins;
        },
        getVerticalWins: function(size) {
            var wins = {};
            var x = 0;
            var y;
            var key;
            for (x; x < size; x++) {
                key = '';
                for (y = 0; y < size; y++) {
                    key += x + '' + y + '-';
                }
                wins[key] = 0;
            }
            return wins;
        },
        getDiagonalWins: function(size) {
            var wins = {};
            var ii;
            var key = '';

            for (ii = 0; ii < size; ii++) {
                key += (ii + '' + ii + '-');
            }
            wins[key] = 0;

            key = '';
            for (ii = 0; ii < size; ii++) {
                var jj = size - 1 - ii;
                key += (ii + '' + jj + '-');
            }
            wins[key] = 0;

            return wins;
        }
    };

    return win.init(size);
};