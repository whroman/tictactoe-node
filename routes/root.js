var express = require('express');
var router = express.Router();

router.get('/', routeRoot);

function routeRoot(req, res) {
    console.log(res._parsedUrl)
    // res.render('index', { title: 'asdf' });
    res.redirect('/game/' + getGameURL(10))
}

function getGameURL(len) {
    var str = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    // return "AAAAAAAAAA"; // For testing

    while (len--) {
        str += possible.charAt(Math.floor(Math.random() * possible.length));
    }

    return str;
}

module.exports = router;
