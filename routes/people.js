var express = require('express');
var formidable = require('formidable');
var router = express.Router();
var fs = require('fs');
var path = require('path');
var User = require('../model/mongo').User;

/* GET users listing. */
router.get('/:user_id', function(req, res, next) {
    if(!req.session.user){
        return res.redirect('/');
    }
    // todo: 没有user_id转到404

    User.findById(req.params.user_id, function(err, user){
        if(err){
            return res.status(200).json({"error": "不存在的用户！"});
        }

        res.render('people', {
            isMyself: req.session.user._id == req.params.user_id,
            myself:{
                name: req.session.user.name,
                profileUrl: req.session.user.profileUrl,
                _id: req.session.user._id
            },
            name: user.name,
            profileUrl: user.profileUrl
        });
    })
});

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
        User.findById(req.session.user._id, function(err, user){
            if(err){
                console.log('find user error:' + err);
                return res.status(200).json({"error": "内部错误！"});
            }
            var oldProfileUrl = user.profileUrl;
            var profileUrl = path.join('/images/users/', req.session.user._id, fileName);
            user.profileUrl = profileUrl;
            user.save(function(err){
                if(err){
                    return res.status(200).json({"error": "内部错误！"});
                }
                fs.unlink('./public' + oldProfileUrl);      // 不关心是否失败
                req.session.user.profileUrl = profileUrl;   // 更新session
                return res.status(200).json({"profileUrl": profileUrl});
            })
        })
    })

    form.on('error', function(err){
        console.log('An error occured:' + err);
    })

    //form.on('end', function(){
    //    return res.status(200).json({"profileUrl": "test"});
    //})

    form.parse(req);

})

module.exports = router;
