var express = require('express');
var router = express.Router();

router.get('/', routeIndex);

function routeIndex(req, res) {
    res.render('index');
}

module.exports = router;
