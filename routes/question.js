var express = require('express');
var router = express.Router();
var Question = require('../model/mongo').Question;
var fs = require('fs');

/* GET home page. */
router.get('/:id', function(req, res, next) {
    if(req.session.user){
        console.log(req.params.id);
        Question.findById(req.params.id, function(err, question){
            if(err){
                // error
            }
            if(typeof question == undefined){
                // 404
            }
            console.log(question);
            return res.render('question', {
                title: question.title,
                answerNum: 0
            });
        })
    }
    else{
        res.redirect('/');
    }
});

// 处理添加一个问题
router.post('/add', function(req, res, next){
    if(!req.session.user) {
        return res.redirect('/');
    }

    var title = req.body.title.trim();
    if(title.length == 0){
        return res.status(200);
    }

    Question.create({
        //userObjId: req.session.user._id,
        title: req.body.title
    }, function(err, question){
        if(!err){
            console.log('save question success');
            return res.status(200).json({"url": "/question/" + question._id});
        }
    })

})

module.exports = router;
