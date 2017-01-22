var express = require('express');
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

module.exports = router;
