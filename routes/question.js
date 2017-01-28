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
        var answers = result[1].lstAnswer;
        var followers = result[2].lstFollower;
        var answered = false;
        var followed = false;
        var latestAnswers = [];
        for(var loop = 0; loop < question.lstAnswer.length; loop++){
            latestAnswers.push({
                content: question.lstAnswer[loop].answer,
                agreeNum: question.lstAnswer[loop].agreeNum,
                date: dateFormat(question.lstAnswer[loop].date),
                answer_id: question.lstAnswer[loop]._id,
                agree: false,
                disAgree: false,
                thanks: false,
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
        for(var loop = 0; loop < answers.length; loop++){
            if(answers[loop].userObjId == req.session.user._id){
                answered = true;
                break;
            }
        }
        for(var loop = 0; loop < followers.length; loop++){
            if(followers[loop]._id == req.session.user._id){
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
            lstFollower: [],
            answerNum: 0
        });
    })

    //Question.findByIdAndUpdate(req.params.id, {$inc: {viewNum: 1}}, function(err, question){
    //    if(err){
    //        console.error('findbyid error! questionid[' +  req.params.id + ']');
    //    }
    //    if(question == null){
    //        // 404 if question is null or undefined.
    //        return next();
    //    }
    //    // 获取问题所有答案详细
    //    function getAnswers(answers){
    //        var promises = [];
    //
    //        for(var loop = 0; loop < answers.length; loop++){
    //            var promise = new Promise(function(resolve, reject){
    //                Answer.findById(answers[loop]).populate('lstActions').exec(function(err, answer){
    //                    if(err){
    //                        reject('');
    //                    }
    //                    else{
    //                        User.findById(answer.userObjId, function(err, user){
    //                            if(err){
    //                                reject('');
    //                            }
    //                            else{
    //                                if(!answered && answer.userObjId == req.session.user._id){
    //                                    answered = true;
    //                                }
    //                                var agree = false,
    //                                    disAgree = false,
    //                                    thanks = false;
    //                                for(var loop = 0; loop < answer.lstActions.length; loop++){
    //                                    if(answer.lstActions[loop].userObjId == req.session.user._id){
    //                                        // 对次答案有操作
    //                                        agree = answer.lstActions[loop].isAgree;
    //                                        disAgree = answer.lstActions[loop].isDisagree;
    //                                        thanks = answer.lstActions[loop].isThanks;
    //                                        console.log('disagree:' + disAgree + 'agree:' + agree);
    //                                    }
    //                                }
    //                                resolve({
    //                                    content: answer.answer,
    //                                    agreeNum: answer.agreeNum,
    //                                    date: dateFormat(answer.date),
    //                                    answer_id: answer._id,
    //                                    agree: agree,
    //                                    disAgree: disAgree,
    //                                    thanks: thanks,
    //                                    user: {
    //                                        _id: user._id,
    //                                        name: user.name,
    //                                        bio: user.bio,
    //                                        goodAnswer: false,
    //                                        answerOwner: req.session.user._id == user._id,
    //                                        profileUrl: user.profileUrl || '/images/system/profile_s.jpg'
    //                                    }
    //                                });
    //                            }
    //                        })
    //                    }
    //                })
    //            })
    //            promises.push(promise);
    //        }
    //        return promises;
    //    }
    //
    //    Promise.all(getAnswers(question.lstAnswer)).then(function(datas){
    //        Question.findOne({_id: req.params.id}).populate('lstFollower').exec(function(err, all){
    //            var followed = false;
    //            for(var loop = 0; loop < all.lstFollower.length; loop++){
    //                if(req.session.user._id == all.lstFollower[loop]._id){
    //                    followed = true;
    //                    break;
    //                }
    //            }
    //
    //            return res.render('question', {
    //                myself:{
    //                    name: req.session.user.name,
    //                    profileUrl: req.session.user.profileUrl,
    //                    _id: req.session.user._id
    //                },
    //                answered: answered,
    //                question_id: req.params.id,
    //                title: question.title,
    //                viewNum: question.viewNum,
    //                createDate: dateFormat(question.date),
    //                answers: datas,
    //                more: false,
    //                followed: followed,
    //                lstFollower: all.lstFollower,
    //                answerNum: 0
    //            });
    //        });
    //    })
    //})

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

    // todo:怎么两次调用封装在一个model函数调用中？
    var questionUrl = "/question/";
    questionModel.addQuestion({
        userObjId: req.session.user._id,
        title: title
    }).then(function(question){
        questionUrl += question._id;
        return peopleModel.addOneQuestionRecord(req.session.user._id, question._id);
    }).then(function(result){
        return res.status(200).json({"url": questionUrl});
    })
})

// 关注问题
router.post('/:question_id/follow', function(req, res, next) {
    var answered = false;
    if(req.session.user){
        questionModel.followQuestion(req.params.question_id, req.session.user._id).then(function(question){
            if(question){
                return res.status(200).json({"success": "success"});
            }
            else{
                return res.status(200).json({"error": "try again."});
            }
        })
    }
    else{
        return res.redirect('/');
    }
});

// 取消关注问题
router.post('/:question_id/unfollow', function(req, res, next) {
    var answered = false;
    if(req.session.user){
        questionModel.unfollowQuestion(req.params.question_id, req.session.user._id).then(function(question){
            if(question){
                return res.status(200).json({"success": "success"});
            }
            else{
                return res.status(200).json({"error": "try again."});
            }
        })
    }
    else{
        return res.redirect('/');
    }
});

// 添加回答
router.post('/:question_id/answer', function(req, res, next){
    if(!req.session.user) {
        // 用户没有登录
        return res.redirect('/');
    }
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
            answer: content
        })
    ]).then(function(result){
        myself.name = result[0].name;
        myself.bio = result[0].bio;
        myself.profileUrl = result[0].profileUrl;
        answer = result[1];
        return questionModel.addOneAnswerRecord(req.params.question_id, answer._id);
    }).then(function(result) {
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
})

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
        //Answer.findById(req.params.answer_id).populate('userObjId').exec(function(err, answer){
        //    if(err){
        //        console.log('add answer_id to question error');
        //        return res.status(200).json({"error": "error"});
        //    }
        //    if(answer.userObjId._id != req.session.user._id){
        //        return res.status(200).json({"error": "u are not author!"});
        //    }
        //    for(var loop = 0; loop < answer.lstActions.length; loop++){
        //        AnswerAction.remove({_id: answer.lstActions[loop]}, function(err){
        //            console.log('remove table action failed' + err);
        //        })
        //    }
        //    Question.findByIdAndUpdate(req.params.question_id, {$pop:{lstAnswer: req.params.answer_id}}, function(err, question){
        //        if(err){
        //            console.log('update question error');
        //            return res.status(200).json({"error": "u are not author!"});
        //        }
        //        answer.remove(function(err){
        //            if(err){
        //                console.log('update question error');
        //                return res.status(200).json({"error": "u are not author!"});
        //            }
        //
        //            fs.readFile('views/components/answer-edit-wrap-add.ejs', function(err, data){
        //                var html = ejs.render(data.toString(), {
        //                    "name": answer.userObjId.name,
        //                    "profileUrl": answer.userObjId.profileUrl || "/images/system/profile_s.jpg"});
        //
        //                return res.status(200).json({"answerEditWrap": html});
        //            });
        //        });
        //    })
        //})
        return;  // 不能往下走
    }

    var found = false;
    questionModel.answerActions(req.params.answer_id).then(function(answer){
        for(var loop = 0; loop < answer.lstActions.length; loop++) {
            if (answer.lstActions[loop].userObjId == req.session.user._id) {
                found = true;
                if (req.params.action == 'disagree' && answer.lstActions[loop].isAgree) {
                    num = -1;
                }
                AnswerAction.findByIdAndUpdate(answer.lstActions[loop]._id, {$set: update}, function (err, action) {
                    if (err) {
                        console.log('update action failed!');
                    }
                    if (num != 0) {
                        answer.agreeNum += num;
                        answer.save(function (err) {
                            if (err) {
                                console.log('update answer agree num error!');
                            }
                        })
                    }
                    return res.status(200).json({"agreed": "success"});
                })
                break; // no need loop
            }
        }
    })
    //Answer.findById(req.params.answer_id).populate('lstActions').exec(function(err, answer){
    //    if(err){
    //        console.log('add answer_id to question error');
    //        return res.status(200).json({"error": "error"});
    //    }
    //    for(var loop = 0; loop < answer.lstActions.length; loop++){
    //        if(answer.lstActions[loop].userObjId == req.session.user._id){
    //            found = true;
    //            if(req.params.action == 'disagree' && answer.lstActions[loop].isAgree){
    //                num = -1;
    //            }
    //            console.log(update);
    //            AnswerAction.findByIdAndUpdate(answer.lstActions[loop]._id, {$set: update}, function(err, action){
    //                if(err){
    //                    console.log('update action failed!');
    //                }
    //                if(num != 0){
    //                    answer.agreeNum += num;
    //                    answer.save(function(err){
    //                        if(err){
    //                            console.log('update answer agree num error!');
    //                        }
    //                    })
    //                }
    //                return res.status(200).json({"agreed": "success"});
    //            })
    //            break; // no need loop
    //        }
    //    }
    //
    //    if(!found){
    //        // 创建一个action记录
    //        AnswerAction.create({
    //            userObjId: req.session.user._id,
    //            isAgree: update.isAgree || false,
    //            isDisagree: update.isDisagree || false,
    //            isThanks: update.isThanks || false
    //        }, function(err, action){
    //            if(err){
    //                console.log('create answer action error:' + err);
    //            }
    //            else{
    //                answer.agreeNum += num;
    //                answer.lstActions.push(action._id);
    //                answer.save(function(err){
    //                    if(err){
    //                        console.log('update answer agree num error!');
    //                    }
    //                    return res.status(200).json({"agreed": true});
    //                })
    //            }
    //        });
    //    }
    //})
})

module.exports = router;
