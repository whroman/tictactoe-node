var express = require('express');
var router = express.Router();



router.get('/', function (req, res) {
    console.log(req.params)
    res.render('index', { title: req.params.game });
});

module.exports = router;
