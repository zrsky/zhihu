var express = require('express');
var router = express.Router();
var User = require('../model/mongo').User;
var peopleModel = require('../model/people');
var sha1 = require('sha1');
var fs = require('fs');
var validatemobile = require('../lib/commFunc').validatemobile;

/* GET home page. */
router.get('/', function(req, res, next) {
    if(!req.session.user){
        res.render('register');
    }

    var lstActivities = new Array();
    peopleModel.getFollowingActivities(req.session.user._id).then(function(result){
        for(var user = 0; user < result.lstFollowing.length; user++){
            for(var loop = 0; loop < result.lstFollowing[user].lstActivity.length; loop++){
                lstActivities.push(result.lstFollowing[user].lstActivity[loop]);
            }
        }
        lstActivities.sort(function(a, b){
            return parseInt(b._id) - parseInt(a._id);
        })

        console.log("all:" + lstActivities);
        res.render('main', {
            myself:{
                name: req.session.user.name,
                profileUrl: req.session.user.profileUrl || '/images/system/profile_l.jpg',
                _id: req.session.user._id}
        });

    })
});

module.exports = router;
