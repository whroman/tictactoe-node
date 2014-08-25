var express = require('express');
var router = express.Router();

router.get('/:game', routeGame);

function routeGame(req, res) {
    console.log(req.params)
    if (req.params.game.length === 10) {
        res.render('root');
    } else {
        res.redirect('/');

    }
}

module.exports = router;
