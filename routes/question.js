var express = require('express');
var router = express.Router();
var Question = require('../model/mongo').Question;
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
            return res.render('question', {
                title: question.title,
                answerNum: 0
            });
        })
    }
    else{
        return res.redirect('/');
    }
});

// 处理添加一个问题
router.post('/add', function(req, res, next){
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
        title: req.body.title
    }, function(err, question){
        if(!err){
            console.log('save question success');
            return res.status(200).json({"url": "/question/" + question._id});
        }
    })

})

module.exports = router;
