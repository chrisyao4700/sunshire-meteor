var express = require('express');
var router = express.Router();


router.get('/', function (req, res, next) {
    res.render('services', {
        title: 'Sunshire Meteor',
        pageName: 'Services'
    });
});
module.exports = router;