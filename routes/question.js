var express = require('express');
var router = express.Router();
var Question = require('../model/mongo').Question;
var Answer = require('../model/mongo').Answer;
var User = require('../model/mongo').User;
var fs = require('fs');

/* GET home page. */
router.get('/:id', function(req, res, next) {
    if(req.session.user){
        Question.findById(req.params.id, function(err, question){
            if(err){
                console.error('findbyid error! questionid[' +  req.params.id + ']');
            }
            if(question == null){
                // 404 if question is null or undefined.
                return next();
            }
            var answers = [];
            var lstArr = []

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
                                        resolve({
                                            content: answer.answer,
                                            upNum: answer.upNum,
                                            user: {
                                                _id: user._id,
                                                name: user.name,
                                                bio: user.bio || '晨光要努力！',
                                                goodAnswer: false,
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

            Promise.all(getAnswers(question.answers)).then(function(datas){
                return res.render('question', {
                    user: {
                        name: req.session.user.name,
                        profileUrl: req.session.user.profileUrl || '/images/system/profile_l.jpg'
                    },
                    question_id: req.params.id,
                    title: question.title,
                    answers: datas,
                    more: false,
                    answerNum: 0
                });
            })
        })
    }
    else{
        return res.redirect('/');
    }
});

// 处理添加一个问题
router.post('/addq', function(req, res, next){
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
            console.log('save question success');

            return res.status(200).json({"url": "/question/" + question._id});
        }
    })

})

// 处理添加一个问题
router.post('/adda/:question_id', function(req, res, next){
    if(!req.session.user) {
        // 用户没有登录
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

    var answer = req.body.answer.trim();
    if(answer.length == 0){
        return res.status(200);
    }

    Answer.create({
        userObjId: req.session.user._id,
        answer: answer
    }, function(err, answer){
        if(!err){
            Question.findByIdAndUpdate(req.params.question_id, {$push: {answers: answer._id}}, function(err, question){
                if(err){
                    console.log('add answer_id to question error');
                }
                else{
                    console.log(question);
                    return res.status(200).json({"success": "success"});
                }
            })
        }
    })

})

module.exports = router;
