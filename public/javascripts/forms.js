App.Forms = {
    init: function(options) {
        if (options) {
            this.$input = this.$input
                .add(options.input);
        }

        this.$input
            .on('keyup', this.dynamicWidth)
            .on('click', function() {
                this.select();
            });
    },
    $input: $(),
    dynamicWidth: function(ev) {
        var $this = $(this);
        var val = $this.val();
        var size = Math.floor(val.length * 1.7);
        if (ev.keyCode === 13) {
            var playerUpdate = {
                id: getGameID(),
                key: $this.attr('for'),
                val: val
            };
            $this.blur();
            Sockets.io.emit('game:playerUpdate', playerUpdate);
        } else {
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