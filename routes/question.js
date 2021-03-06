/*
路由
* post('/')                                     发布问题
* post('/:puestion_id')                         修改问题
* get('/:puestion_id')                          获取问题页面
* post('/:puestion_id/answer')                  发布答案
* post('/:puestion_id/answer/:answer_id')       修改答案
* */
var express = require('express');
var router = express.Router();
var Question = require('../model/mongo').Question;
var Answer = require('../model/mongo').Answer;
var AnswerAction = require('../model/mongo').AnswerAction;
var User = require('../model/mongo').User;
var questionModel = require('../model/question');
var peopleModel = require('../model/people');
var activityModel = require('../model/activity');
var fs = require('fs');
var ejs = require('ejs');
var dateFormat = require('../lib/commFunc.js').dateFormat;

// 获取问题
router.get('/:id', function(req, res, next) {
    if(!req.session.user){
        return res.redirect('/');
    }

    Promise.all([
        questionModel.getQuestionPage(req.params.id),
        questionModel.getAnswers(req.params.id),
        questionModel.getFollowers(req.params.id),
        questionModel.increaseView(req.params.id)
    ]).then(function(result){
        var question = result[0];
        var allAnswers = result[1].lstAnswer;
        var allFollowers = result[2].lstFollower;
        var answered = false;
        var followed = false;
        var latestAnswers = [];
        var latestFollowers = [];
        for(var loop = 0; loop < question.lstAnswer.length; loop++){
            var agree = false,
                disagree = false,
                thanks = false;
            for(var l = 0; l < question.lstAnswer[loop].lstActions.length; l++){
                if(question.lstAnswer[loop].lstActions[l].userObjId == req.session.user._id){
                    agree = question.lstAnswer[loop].lstActions[l].isAgree;
                    disagree = question.lstAnswer[loop].lstActions[l].isDisagree;
                    thanks = question.lstAnswer[loop].lstActions[l].isThanks;
                    break;
                }
            }
            latestAnswers.push({
                content: question.lstAnswer[loop].answer,
                agreeNum: question.lstAnswer[loop].agreeNum,
                date: dateFormat(question.lstAnswer[loop].date),
                answer_id: question.lstAnswer[loop]._id,
                agree: agree,
                disAgree: disagree,
                thanks: thanks,
                author: {
                    _id: question.lstAnswer[loop].userObjId._id,
                    name: question.lstAnswer[loop].userObjId.name,
                    bio: question.lstAnswer[loop].userObjId.bio,
                    goodAnswer: false,
                    answerOwner: req.session.user._id == question.lstAnswer[loop].userObjId._id,
                    profileUrl: question.lstAnswer[loop].userObjId.profileUrl || '/images/system/profile_s.jpg'
                }
            })
        }
        for(var loop = 0; loop < question.lstFollower.length; loop++) {
            latestFollowers.push({
                _id: question.lstFollower[loop]._id,
                profileUrl: question.lstFollower[loop].profileUrl || '/images/system/profile_s.jpg'
            })
        }
        for(var loop = 0; loop < allAnswers.length; loop++){
            if(allAnswers[loop].userObjId == req.session.user._id){
                answered = true;
                break;
            }
        }
        for(var loop = 0; loop < allFollowers.length; loop++){
            if(allFollowers[loop]._id == req.session.user._id){
                followed = true;
                break;
            }
        }

        return res.render('question', {
            myself:{
                name: req.session.user.name,
                profileUrl: req.session.user.profileUrl || '/images/system/profile_l.jpg',
                _id: req.session.user._id
            },
            answered: answered,
            question_id: req.params.id,
            title: question.title,
            viewNum: question.viewNum,
            createDate: dateFormat(question.date),
            answers: latestAnswers,
            more: false,
            followed: followed,
            lstFollower: latestFollowers,
            answerNum: 0
        });
    })
});

// 添加问题
router.post('/', function(req, res, next){
    if(!req.session.user) {
        return res.redirect('/');
    }

    var title = req.body.title.trim();
    if(title.length == 0){
        return res.status(200);
    }

    // todo:能否将两次调用封装在一个model函数调用中？
    var info = {
        url: "/question/",
        date: null
    }
    questionModel.addQuestion({
        userObjId: req.session.user._id,
        title: title
    }).then(function(question){
        info.url += question._id;
        info.date = question.date;
        console.log('question:' + info);
        return Promise.all([
            peopleModel.addOneQuestionRecord(req.session.user._id, question._id),
            activityModel.activityAddQ(req.session.user._id, question._id, question.date)
        ])
    }).then(function(result){
        return peopleModel.addOneActivityRecord(req.session.user._id, result[1]._id);
    }).then(function(result){
        return res.status(200).json({"url": info.url});
    })
})

// 关注，取消关注问题，添加问题回答
router.post('/:question_id/:action', function(req, res, next) {
    if(!req.session.user){
        return res.redirect('/');
    }
    if(req.params.action == 'follow'){
        questionModel.followQuestion(req.params.question_id, req.session.user._id).then(function(question){
            return activityModel.activityFollowQ(req.session.user._id, question._id);
        }).then(function(activity){
            return peopleModel.addOneActivityRecord(req.session.user._id, activity._id);
        }).then(function(result){
            return res.status(200).json({"success": "success"});
        }).catch(next);
    }
    else if(req.params.action == 'unfollow'){
        questionModel.unfollowQuestion(req.params.question_id, req.session.user._id).then(function(question){
            if(question){
                return res.status(200).json({"success": "success"});
            }
            else{
                return res.status(200).json({"error": "try again."});
            }
        })
    }
    else if(req.params.action == 'addAnswer'){
        var content = req.body.answer.trim();
        var myself = {};    // 自己信息
        var answer = {};
        if(content.length == 0){
            return res.status(200);
        }

        Promise.all([
            peopleModel.getUserByAccount(req.session.user.account),
            questionModel.addAnswer({
                userObjId: req.session.user._id,
                questionId: req.params.question_id,
                answer: content
            })
        ]).then(function(result){
            myself.name = result[0].name;
            myself.bio = result[0].bio;
            myself.profileUrl = result[0].profileUrl;
            answer = result[1];
            return Promise.all([
                questionModel.addOneAnswerRecord(req.params.question_id, answer._id),
                peopleModel.addOneAnswerRecord(req.session.user._id, answer._id),
                activityModel.activityAddA(req.session.user._id, answer._id, answer.date)
            ])
        }).then(function(result) {
            return peopleModel.addOneActivityRecord(req.session.user._id, result[2]._id)
        }).then(function(result){
            ejs.renderFile('views/components/oneanswer.ejs', {
                answerUrl: '/question/' + req.params.question_id + '/answer/' + answer._id,
                content: answer.answer,
                agreeNum: 0,
                agree: false,
                disagree: false,
                thanks: false,
                date: dateFormat(answer.date),
                bestAnswer: false,
                bio: myself.bio,
                name: myself.name,
                answerOwner: true,
                profileUrl: myself.profileUrl
            }, function (err, html) {
                return res.status(200).json({"myAnswer": html});
            });
        });
    }
    else{
        console.log('enter else');
        return res.status(200).json({"error": "try again."});
    }
});

// 修改回答
router.post('/:question_id/answer/:answer_id', function(req, res, next){
    if(!req.session.user) {
        // 用户没有登录
        return res.redirect('/');
    }

    var answer = req.body.answer.trim();
    if(answer.length == 0){
        return res.status(200);
    }
    questionModel.updateAnswer(req.params.answer_id, answer).then(function(answer){
        return res.status(200).json({"success": "success"});
    }).catch(next);

})

// 支持，反对，感谢，删除回答
router.post('/:question_id/answer/:answer_id/:action', function(req, res, next){
    if(!req.session.user) {
        // 用户没有登录
        return res.redirect('/');
    }
    console.log('enter answer action:' + req.params.action);
    var update,
        num;
    if(req.params.action == 'agree') {
        update = {
            isAgree: true,
            isDisagree: false,
            isThanks: false
        };
        num = 1;
    }
    else if(req.params.action == 'cancelAgree'){
        update = {
            isAgree: false,
            isDisagree: false,
            isThanks: false
        };
        num = -1;
    }
    else if(req.params.action == 'disagree'){
        update = {
            isAgree: false,
            isDisagree: true,
            isThanks: false
        };
        num = 0;    // 回答的赞同数时候减少这里无法判断，需要看是否点过赞同
    }
    else if(req.params.action == 'cancelDisagree'){
        update = {
            isAgree: false,
            isDisagree: false,
            isThanks: false
        };
        num = 0;
    }
    else if(req.params.action == 'thanks'){
        update = {
            isThanks: true
        };
        num = 0;    // 回答的赞同数时候减少这里无法判断，需要看是否点过赞同
    }
    else if(req.params.action == 'cancelThanks'){
        update = {
            isThanks: false
        };
        num = 0;
    }
    else if(req.params.action == 'delete'){
        questionModel.answerAuthorInfo(req.params.answer_id).then(function(answer){
            if(answer.userObjId._id != req.session.user._id){
                return res.status(200).json({"error": "u are not author!"});
            }
            return Promise.all([
                questionModel.removeOneAnswerRecord(req.params.question_id, req.params.answer_id),
                peopleModel.removeOneAnswerRecord(req.session.user._id, req.params.answer_id),
                questionModel.removeAnswer(answer)
            ])
        }).then(function(result){
            fs.readFile('views/components/answer-edit-wrap-add.ejs', function(err, data){
                var html = ejs.render(data.toString(), {
                    "name": result[0].userObjId.name,
                    "profileUrl": result[0].userObjId.profileUrl || "/images/system/profile_s.jpg"});

                return res.status(200).json({"answerEditWrap": html});
            });
        })

        /* 不能往下走 */
        return;
    }


    var found = false;
    questionModel.answerActions(req.params.answer_id).then(function(answer){
        for(var loop = 0; loop < answer.lstActions.length; loop++) {
            if (answer.lstActions[loop].userObjId == req.session.user._id) {
                found = true;
                if (req.params.action == 'disagree' && answer.lstActions[loop].isAgree) {
                    num = -1;
                }
                Promise.all([
                    questionModel.updateActions(answer.lstActions[loop]._id, update),
                    questionModel.updateAnswerAgreeNum(answer._id, num)
                ]).then(function(result){
                    // 保存赞同时的动态
                    if(req.params.action == 'agree'){
                        return activityModel.activityAgreeA(req.session.user._id, req.params.answer_id);
                    }
                    else{
                        return res.status(200).json({"agreed": "success"});
                    }
                }).then(function(result){
                    return peopleModel.addOneActivityRecord(req.session.user._id, result._id);
                }).then(function(result){
                    return res.status(200).json({"agreed": "success"});
                })

                /* 不能往下走 */
                return;
            }
        }

        if(!found){
            questionModel.addActions({
                userObjId: req.session.user._id,
                isAgree: update.isAgree || false,
                isDisagree: update.isDisagree || false,
                isThanks: update.isThanks || false
            }).then(function(action){
                return Promise.all([
                    questionModel.addOneActionRecord(answer._id, action._id),
                    questionModel.updateAnswerAgreeNum(answer._id, num)
                ])
            }).then(function(result){
                if(req.params.action == 'agree'){
                    return activityModel.activityAgreeA(req.session.user._id, req.params.answer_id);
                }
                else{
                    return res.status(200).json({"agreed": "success"});
                }
            }).then(function(result){
                return peopleModel.addOneActivityRecord(req.session.user._id, result._id);
            }).then(function(result){
                return res.status(200).json({"agreed": "success"});
            })
        }
    })
})

module.exports = router;
