var express = require('express');
var formidable = require('formidable');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
    if(!req.session.user){
        return res.redirect('/');
    }
    res.render('people', {
        name: req.session.user.name,
        profileUrl: req.session.user.profileUrl || '/images/system/profile_l.jpg'
    });
});

//router.post('/', function(req, res, next){
//
//})

module.exports = router;
