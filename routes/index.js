var express = require('express');
var router = express.Router();

router.get('/', getIndex);

router.get('/:game', getGame);

function getIndex(req, res) {
  console.log(res._parsedUrl)
  res.redirect('/' + buildUrl(10))
}

function getGame(req, res) {
    console.log(req.params)
    res.render('index', { title: req.params.game });
}

function buildUrl(len) {
    var str = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    while (len--) {
        str += possible.charAt(Math.floor(Math.random() * possible.length));
    }

    return str;
}

module.exports = router;
