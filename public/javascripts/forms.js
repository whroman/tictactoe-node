App.Forms = {
    init: function(options) {
        $(options.dynamicInputWidth).on('keyup', this.dynamicInputWidth);
    },
    dynamicInputWidth: function(ev) {
        var $this = $(this);
        var val = $this.val();
        if (ev.keyCode === 13) {
            $this.blur();
            console.log('saving player names');
        } else {
            $this.attr('size', val.length);
        }
    }
};