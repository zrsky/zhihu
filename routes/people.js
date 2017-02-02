var express = require('express');
var formidable = require('formidable');
var router = express.Router();
var fs = require('fs');
var sha1 = require('sha1');
var path = require('path');
var userModel = require('../model/people');
var questionModel = require('../model/question');
var validatemobile = require('../lib/commFunc').validatemobile;
var dateFormat = require('../lib/commFunc').dateFormat;

// 个人页面
router.get('/:user_id', function(req, res, next) {
    if(!req.session.user){
        return res.redirect('/');
    }
    var latestQuestions = [];
    var latestAnswers = [];
    var latestActivities = [];
    var user = [];
    var followed = false;
    Promise.all([
        userModel.getUserPage(req.params.user_id),
        userModel.increaseView(req.params.user_id)
    ]).then(function(result){
        user = result[0];
        for(var loop = 0; loop < user.lstQuestion.length; loop++){
            latestQuestions.push({
                title: user.lstQuestion[loop].title,
                url: '/question/' + user.lstQuestion[loop]._id,
                viewNum: user.lstQuestion[loop].viewNum,
                answerNum: user.lstQuestion[loop].lstAnswer.length,
                followNum: user.lstQuestion[loop].lstFollower.length
            })
        }
        for(var loop = 0; loop < user.lstAnswer.length; loop++){
            latestAnswers.push({
                agreeNum: user.lstAnswer[loop].agreeNum,
                question: user.lstAnswer[loop].questionId.title,
                url: '/question/' + user.lstAnswer[loop].questionId._id,
                answer: user.lstAnswer[loop].answer
            })
        }
        if(user.lstFollower.indexOf(req.session.user._id) != -1){
            followed = true;
        }

        return Promise.all(user.lstActivity.map(function(activity){
            var info = {
                userObjId: activity.userObjId._id,
                userName: activity.userObjId.name,
                activityType: activity.activityType,
                date: dateFormat(activity.date)
            }
            latestActivities.push(info);

            if(activity.activityType == 'addQuestion' || activity.activityType == 'followQuestion'){
                return questionModel.getOneQuestion(activity.documentId);
            }
            else if(activity.activityType == 'addAnswer' || activity.activityType == 'agreeAnswer'){
                return questionModel.getOneAnswer(activity.documentId);
            }
        }))
    }).then(function(result){
        for(var loop = 0; loop < latestActivities.length; loop++){
            if(latestActivities[loop].activityType == 'addQuestion' || latestActivities[loop].activityType == 'followQuestion'){
                // 问题相关，则附加一个问题
                latestActivities[loop].questionTitle = result[loop].title;
                latestActivities[loop].questionUrl = '/question/' + result[loop]._id;
            }
            else if(latestActivities[loop].activityType == 'addAnswer' || latestActivities[loop].activityType == 'agreeAnswer'){
                latestActivities[loop].authorObjId = result[loop].userObjId._id;
                latestActivities[loop].authorName = result[loop].userObjId.name;
                latestActivities[loop].answer = result[loop].answer;
                latestActivities[loop].answerDate = dateFormat(result[loop].date);
                latestActivities[loop].agreeNum = result[loop].agreeNum;
                latestActivities[loop].question = result[loop].questionId.title;
                latestActivities[loop].questionId = result[loop].questionId._id;
            }
        }
        res.render('people', {
            isMyself: req.session.user._id == req.params.user_id,
            myself:{
                name: req.session.user.name,
                profileUrl: req.session.user.profileUrl || '/images/system/profile_l.jpg',
                _id: req.session.user._id
            },
            name: user.name,
            id: req.params.user_id,
            followed: followed,
            profileUrl: user.profileUrl || '/images/system/profile_l.jpg',
            latestQuestions: latestQuestions,
            latestAnswers: latestAnswers,
            latestActivities: latestActivities,
            questionNum: user.lstQuestion.length,
            answerNum: user.lstAnswer.length,
            viewNum: user.viewNum,
            followerNum: user.lstFollower.length,
            followingNum: user.lstFollowing.length
        });
    }).catch(next);
});

// 更换头像
router.post('/upload', function(req, res, next){
    if(!req.session.user){
        return res.redirect('/');
    }

    var form = new formidable.IncomingForm();
    form.keepExtensions = true;
    form.uploadDir = './tmp/uploads';

    form.on('file', function(field, file){
        var fileName = '',      // 图片用时间戳重命名
            extName = '';       // 后缀
        switch (file.type) {
            case 'image/jpeg':
                extName = 'jpg';
                break;
            case 'image/png':
                extName = 'png';
                break;
        }
        if(extName.length == 0){
            return res.status(200).json({"error": "只支持png和jpg格式图片"});
        }
        fileName = new Date().getTime() + '.' + extName;
        fs.rename(file.path, path.join('./public/images/users/', req.session.user._id, fileName));

        var profileUrl = path.join('/images/users/', req.session.user._id, fileName);
        var oldProfileUrl = req.session.user.profileUrl;
        userModel.updateProfileUrl(req.session.user._id, profileUrl).then(function(user){
            if(oldProfileUrl.length > 0){
                fs.unlink('./public' + oldProfileUrl);
            }
            req.session.user.profileUrl = profileUrl;
            return res.status(200).json({"profileUrl": profileUrl});
        }).catch(next);
    })

    form.on('error', function(err){
        console.log('An error occured:' + err);
    })

    form.parse(req);
})

// 关注用户
router.post('/:user_id/follow', function(req, res, next){
    if(req.params.user_id == req.session.user._id){
        return res.status(200).json({"error": "cannot follow self"});
    }

    Promise.all([
        userModel.addOneFollower(req.params.user_id, req.session.user._id),
        userModel.addOneFollowing(req.session.user._id, req.params.user_id)
    ]).then(function(result){
        return res.status(200).json({"success": "success"});
    }).catch(function(err){
        return res.status(200).json({"error": "error"});
    })
})
// 取消关注用户
router.post('/:user_id/unfollow', function(req, res, next){
    if(req.params.user_id == req.session.user._id){
        return res.status(200).json({"error": "cannot follow self"});
    }

    Promise.all([
        userModel.removeOneFollower(req.params.user_id, req.session.user._id),
        userModel.removeOneFollowing(req.session.user._id, req.params.user_id)
    ]).then(function(result){
        return res.status(200).json({"success": "success"});
    }).catch(function(err){
        return res.status(200).json({"error": "error"});
    })
})

// 用户注册
router.post('/register', function(req, res, next){
    var name = req.body.name,
        account = req.body.account,
        password = req.body.password;

    // 用"user._id"在users下为每个用户创建一个文件夹
    function mkUserDir(dirname){
        if(!fs.existsSync("public/images/users/" + dirname)){
            fs.mkdirSync("public/images/users/" + dirname);
        }
        else{
            // 文件夹已经存在了，一般不太可能
            console.warn("dir:" + dirname + "is existed!");
        }
    }

    if(!validatemobile(account)){
        return res.status(200).json({phoneError: true});
    }
    else if(password.length < 6 || password.length > 22){
        return res.status(200).json({pwdLenError: true});
    }

    var user = {
        name: name,
        account: account,
        password: sha1(password)
    };
    userModel.createUser(user).then(function(user){
        req.session.user = user;
        mkUserDir(user._id);
        return res.status(200).json({"url": "/"});
    }).catch(function(e){
        if(e.message.match('E11000 duplicate key')){
            return res.status(200).json({accountExist: true});
        }
        return res.redirect('/');
    });
})

router.post('/login', function(req, res, next){
    var account = req.body.account,
        password = req.body.password;

    userModel.getUserByAccount(account).then(function(user){
        if(!user){
            return res.status(200).json({accountNotExist: true});
        }
        else if(sha1(password) != user.password){
            return res.status(200).json({accountPwdError: true});
        }
        else{
            req.session.user = user;
            return res.status(200).json({"url": "/"});
        }
    })
})

router.post('/logout', function(req, res, next){
    req.session.user = null;
    return res.status(200).json({"url": "/"});
})

module.exports = router;
