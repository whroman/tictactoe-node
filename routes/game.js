var express = require('express');
var router = express.Router();

router.get('/:game', getGame);

function getGame(req, res) {
    console.log(req.params)
    res.render('root', { title: req.params.game });
}

module.exports = router;
