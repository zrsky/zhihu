var express = require('express');
var router = express.Router();
var User = require('../model/mongo').User;
var sha1 = require('sha1');
var fs = require('fs');
var validatemobile = require('../lib/commFunc').validatemobile;

/* GET home page. */
router.get('/', function(req, res, next) {
    if(req.session.user){
        res.render('main', {user: req.session.user});
    }
    else{
        // 之前没有登录过，返回登录页面
        res.render('register');
    }
});

// 处理注册消息
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
    };

    User.find({account: account}, function(err, users){
        if(err){
            // 内部出错；
        }
        if(users.length > 0){
            return res.status(200).json({accountExist: true});
        }
        else if(!validatemobile(account)){
            return res.status(200).json({phoneError: true});
        }
        else if(password.length < 6 || password.length > 22){
            return res.status(200).json({pwdLenError: true});
        }
        else{
            User.create({
                name: name,
                account: account,
                password: sha1(password)    // 密码加密保存
            }, function(err, user){
                if(!err){
                    req.session.user = user;
                    mkUserDir(user._id);
                    return res.status(200).json({"url": "/"});
                }
            })
        }
    })
})

// 处理登录消息
router.post('/login', function(req, res, next){
    var account = req.body.account,
        password = req.body.password;

    User.find({account: account}, function(err, users){
        if(err){
        }
    })

    User.find({account: account}, function(err, users){
        if(err){
            // 内部出错；
        }
        if(users.length == 0){
            return res.status(200).json({accountNotExist: true});
        }
        else if(users.length == 1){
            if(sha1(password) == users[0].password){
                req.session.user = users[0];
                return res.status(200).json({"url": "/"});
            }
            else{
                return res.status(200).json({accountPwdError: true});
            }
        }
    })
})

module.exports = router;
