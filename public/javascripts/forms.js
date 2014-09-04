App.Forms = {
    init: function(options) {
        if (options) {
            this.$input = this.$input
                .add(options.input);
        }

        this.$input.on({
            'keyup': App.Forms.eventCB.keyup,
            'click': App.Forms.eventCB.click,
            'blur': App.Forms.savePlayer
        });
    },
    eventCB: {
        keyup: function(ev) {
            App.Forms.dynamicWidth
                .bind(this)(ev);
            App.Forms.savePlayer
                .bind(this)();
        },
        click: function(){
            this.select();
        }
    },
    $input: $(),
    savePlayer: function() {
        var $this = $(this);
        var key = $this.attr('for');
        var val = $this.val();
        var playerObj = {
            id: getGameID(),
            tiles: App.Tiles.models,
            key: key,
            val: val
        };
        Sockets.io.emit('game:playerUpdate', playerObj);
    },
    dynamicWidth: function(ev) {
        var $this = $(this);
        if (ev.keyCode === 13) {
            $this.blur();
        } else {
            var size = Math.floor($this.val().length * 1.7);
            $this.attr('size', size);
        }
    },
    loadValues: function(inputSels) {
        for (var sel in inputSels) {
            var val = inputSels[sel];
            $('#info input[for="' + sel + '"]').val(val);
        }
    }

};