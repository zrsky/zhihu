var express = require('express');
var router = express.Router();
var peopleModel = require('../model/people');
var questionModel = require('../model/question');
var sha1 = require('sha1');
var fs = require('fs');
var dateFormat = require('../lib/commFunc').dateFormat;

/* GET home page. */
router.get('/', function(req, res, next) {
    if(!req.session.user){
        return res.render('register');
    }

    var feeds = new Array();
    peopleModel.getFollowingActivities(req.session.user._id).then(function(result){
        var lstActivities = new Array();
        for(var user = 0; user < result.lstFollowing.length; user++){
            for(var loop = 0; loop < result.lstFollowing[user].lstActivity.length; loop++){
                lstActivities.push(result.lstFollowing[user].lstActivity[loop]);
            }
        }
        lstActivities.sort(function(a, b){
            return b._id.toString() > a._id.toString();
        })

        return Promise.all(lstActivities.map(function(activity){
            if(activity.activityType == 'addQuestion' || activity.activityType == 'followQuestion'){
                var oneFeed = {
                    activityId: activity._id,
                    userObjId: activity.userObjId._id,
                    userName: activity.userObjId.name,
                    profileUrl: activity.userObjId.profileUrl || '/images/system/profile_s.jpg',
                    activityType: activity.activityType,
                    date: dateFormat(activity.date)
                }
                feeds.push(oneFeed);
                return questionModel.getOneQuestion(activity.documentId);
            }
            else if(activity.activityType == 'agreeAnswer' || activity.activityType == 'addAnswer'){
                var oneFeed = {
                    activityId: activity._id,
                    userObjId: activity.userObjId._id,
                    userName: activity.userObjId.name,
                    profileUrl: activity.userObjId.profileUrl || '/images/system/profile_s.jpg',
                    activityType: activity.activityType,
                    date: dateFormat(activity.date)
                }
                feeds.push(oneFeed);
                return questionModel.getOneAnswer(activity.documentId);
            }
        }))
    }).then(function(result){
        for(var loop = 0; loop < feeds.length; loop++){
            if(feeds[loop].activityType == 'addQuestion' || feeds[loop].activityType == 'followQuestion'){
                feeds[loop].questionTitle = result[loop].title;
                feeds[loop].answerNum = result[loop].lstAnswer.length;
                feeds[loop].questionUrl = '/question/' + result[loop]._id;
            }
            else if(feeds[loop].activityType == 'agreeAnswer' || feeds[loop].activityType == 'addAnswer'){
                feeds[loop].authorObjId = result[loop].userObjId._id;
                feeds[loop].authorName = result[loop].userObjId.name;
                feeds[loop].answer = result[loop].answer;
                feeds[loop].answerDate = dateFormat(result[loop].date);
                feeds[loop].agreeNum = result[loop].agreeNum;
                feeds[loop].question = result[loop].questionId.title;
                feeds[loop].questionId = result[loop].questionId._id;
            }
        }

        res.render('main', {
            myself:{
                name: req.session.user.name,
                profileUrl: req.session.user.profileUrl || '/images/system/profile_l.jpg',
                _id: req.session.user._id},
            feeds: feeds
        });
    }).catch(function(error){
        console.log(error);
    })
});

module.exports = router;
