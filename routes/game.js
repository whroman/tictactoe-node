var express = require('express');
var router = express.Router();

router.get('/', routeIndex);
router.get('/:game', routeGame);

function routeIndex(req, res) {
    console.log(res._parsedUrl);
    res.redirect('/game/' + generateGameURL(10));
}

function routeGame(req, res) {
    console.log(req.params);
    if (req.params.game.length === 10) {
        res.render('game');
    } else {
        res.redirect('/');

    }
}

function generateGameURL(len) {
    var str = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    while (len--) {
        str += possible.charAt(Math.floor(Math.random() * possible.length));
    }

    return str;
}


module.exports = router;
