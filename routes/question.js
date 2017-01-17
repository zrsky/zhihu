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
var User = require('../model/mongo').User;
var fs = require('fs');

// 获取问题页面
router.get('/:id', function(req, res, next) {
    var answered = false;

    if(req.session.user){
        Question.findByIdAndUpdate(req.params.id, {$inc: {viewNum: 1}}, function(err, question){
            if(err){
                console.error('findbyid error! questionid[' +  req.params.id + ']');
            }
            if(question == null){
                // 404 if question is null or undefined.
                return next();
            }
            // 获取问题所有答案详细
            function getAnswers(answers){
                var promises = [];

                for(var loop = 0; loop < answers.length; loop++){
                    var promise = new Promise(function(resolve, reject){
                        Answer.findById(answers[loop], function(err, answer){
                            if(err){
                                reject('');
                            }
                            else{
                                User.findById(answer.userObjId, function(err, user){
                                    if(err){
                                        reject('');
                                    }
                                    else{
                                        if(!answered && answer.userObjId == req.session.user._id){
                                            answered = true;
                                        }
                                        resolve({
                                            content: answer.answer,
                                            upNum: answer.upNum,
                                            date: answer.date.toLocaleString(),
                                            answer_id: answer._id,
                                            user: {
                                                _id: user._id,
                                                name: user.name,
                                                bio: user.bio,
                                                goodAnswer: false,
                                                answerOwner: req.session.user._id == user._id,
                                                profileUrl: user.profileUrl || '/images/system/profile_s.jpg'
                                            }
                                        });
                                    }
                                })
                            }
                        })
                    })
                    promises.push(promise);
                }
                return promises;
            }

            Promise.all(getAnswers(question.lstAnswer)).then(function(datas){
                Question.findOne({_id: req.params.id}).populate('lstFollower').exec(function(err, all){
                    var followed = false;
                    for(var loop = 0; loop < all.lstFollower.length; loop++){
                        if(req.session.user._id == all.lstFollower[loop]._id){
                            followed = true;
                            break;
                        }
                    }
                    return res.render('question', {
                        user: {
                            name: req.session.user.name,
                            profileUrl: req.session.user.profileUrl || '/images/system/profile_l.jpg'
                        },
                        answered: answered,
                        question_id: req.params.id,
                        title: question.title,
                        viewNum: question.viewNum,
                        createDate: question.date.toLocaleString(),
                        answers: datas,
                        more: false,
                        followed: followed,
                        lstFollower: all.lstFollower,
                        answerNum: 0
                    });
                });

            })
        })
    }
    else{
        return res.redirect('/');
    }
});

// 关注问题
router.post('/:question_id/follow', function(req, res, next) {
    var answered = false;
    console.log('enter follow');
    if(req.session.user){
        Question.findByIdAndUpdate(req.params.question_id, {$push:{lstFollower: req.session.user._id}}, function(err, question){
            if(err){
                console.log('follow error!');
                return res.status(200).json({"error": "try again."});
            }
            else{
                return res.status(200).json({"success": "success"});
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
        Question.findByIdAndUpdate(req.params.question_id, {$pop:{lstFollower: req.session.user._id}}, function(err, question){
            if(err){
                console.log('unfollow error!');
                return res.status(200).json({"error": "try again."});
            }
            else{
                return res.status(200).json({"success": "success"});
            }
        })
    }
    else{
        return res.redirect('/');
    }
});

// 处理添加一个问题
router.post('/', function(req, res, next){
    if(!req.session.user) {
        return res.redirect('/');
    }
    User.findById(req.session.user._id, function(err, user){
        if(err){
            console.error('find user id[' +  req.session.user._id + '] error!');
        }
        if(user == null){
            return res.status(200).json({error: "no userid"});
        }
    })

    var title = req.body.title.trim();
    if(title.length == 0){
        return res.status(200);
    }

    Question.create({
        userObjId: req.session.user._id,
        title: title
    }, function(err, question){
        if(!err){
            User.findByIdAndUpdate(req.session.user._id, {$push: {lstQuestion: question._id}}, function(err, User){
                if(!err){
                    return res.status(200).json({"url": "/question/" + question._id});
                }
                else{
                    console.error('add question.id to list failed');
                }
            })
        }
        else{
            console.error('save question error');
        }
    })
})

// 处理添加一个回答
router.post('/:question_id/answer/:answer_id', function(req, res, next){
    if(!req.session.user) {
        // 用户没有登录
        return res.redirect('/');
    }
    console.log('enter add question');
    User.findById(req.session.user._id, function(err, user){
        if(err){
            console.error('find user id[' +  req.session.user._id + '] error!');
        }
        if(user == null){
            return res.status(200).json({error: "no userid"});
        }
    })

    var answer = req.body.answer.trim();
    if(answer.length == 0){
        return res.status(200);
    }

    Answer.findByIdAndUpdate(req.params.answer_id, {$set: {answer: answer, date: Date.now()}}, function(err, answer){
        if(err){
            console.log('add answer_id to question error');
        }
        else{
            return res.status(200).json({"success": "success"});
        }
    })
})

module.exports = router;
