var App = {};

function getGameID() {
    var pathname = window.location.pathname.split('/');
    var gameID = pathname[pathname.length - 1];
    return gameID;
}

function toggleOnClick(attrSel) {
    $('[' + attrSel + ']').on("click", function() {
        var $this = $(this);
        var targetSel = $this.attr(attrSel);
        var $target = $(targetSel);
        var targetIsHidden = $target.css('display') === 'none';
        if (targetIsHidden) {
            $target.show();
        } else {
            $target.hide();
        }
    });
}


$(function() {
    var FormOptions = {
        input: '#info input[type="text"]'
    };

    var gameInitialState = {
        id: getGameID(),
        tiles: []
    };

    toggleOnClick('toggle-on-click');

    App.Forms.init(FormOptions);

    if ($('#board').length !== 0) {
        Sockets.io.emit('room:join', gameInitialState);

        Sockets.io.on('game:saved', Sockets.onGameSaved);

        Sockets.io.on('game:load', Sockets.onGameLoad);

        Sockets.io.on('game:reset', Sockets.onGameReset);

        Sockets.io.on('game:playerUpdated', Sockets.onGamePlayerUpdated); 
    }
});