var express = require('express');
var router = express.Router();
var User = require('../model/mongo').User;
var sha1 = require('sha1');
var fs = require('fs');
var validatemobile = require('../lib/commFunc').validatemobile;

/* GET home page. */
router.get('/', function(req, res, next) {
    if(req.session.user){
        res.render('main', {
            myself:{
                name: req.session.user.name,
                profileUrl: req.session.user.profileUrl || '/images/system/profile_l.jpg',
                _id: req.session.user._id}
        });
    }
    else{
        // 之前没有登录过，返回登录页面
        res.render('register');
    }
});

module.exports = router;
