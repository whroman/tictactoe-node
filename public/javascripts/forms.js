App.Forms = {
    init: function(options) {
        $(options.dynamicInputWidth).on('keyup', this.dynamicInputWidth);
    },
    dynamicInputWidth: function(ev) {
        var $this = $(this);
        var val = $this.val();
        if (ev.keyCode === 13) {
            var playerUpdate = {
                key: $this.attr('for'),
                val: val
            };
            $this.blur();
            Sockets.io.emit('game:playerUpdate', playerUpdate);
        } else {
            $this.attr('size', val.length);
        }
    }
};