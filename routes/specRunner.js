var express = require('express');
var router = express.Router();

router.get('/', routeSpecRunner);

function routeSpecRunner(req, res) {
    res.render('specRunner');
}

module.exports = router;
