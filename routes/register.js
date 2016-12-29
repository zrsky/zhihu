/**
 * Created by morning on 2016/12/26.
 */
var express = require('express');
var router = express.Router();
var formidable = require('formidable');
var form = new formidable.IncomingForm();
var User = require('../model/mongo').User;
var sha1 = require('sha1');


/* GET home page. */
router.get('/', function(req, res, next) {
    console.log(req.xhr);
    res.render('register', {
        phoneNumberExisted: false,
        passwordLengthWrong: false
    });
});

router.post('/', function(req, res, next){
    console.log(req.xhr);
    var phoneExisted = false,
        passwordLenError = false;

    var strResult = {
        message: 'success'
    }
    res.status(200).json(JSON.stringify({success: 'success'}));

    //form.parse(req, function(err, fields, file){
    //    var name = fields['name'],
    //        account = fields['account'],
    //        password = fields['password'];
    //
    //    console.log(name + '[' + account + ']' + password);
    //    User.find({account: account}, function(err, users){
    //        if(err){
    //            console.log('find name error!');
    //        }
    //        console.log(users.length);
    //        if(users.length > 0){
    //            phoneExisted = true;
    //        }
    //        if(password.length < 6 || password.length > 22){
    //            passwordLenError = true;
    //        }
    //        console.log(phoneExisted + ';' + passwordLenError);
    //        if(phoneExisted || passwordLenError){
    //            res.render('register', {
    //                phoneNumberExisted: phoneExisted,
    //                passwordLengthWrong: passwordLenError
    //            });
    //        }
    //        res.redirect('/');
    //        var newUser = new User({
    //            name: name,
    //            account: account,
    //            password: sha1(password)    // 密码加密保存
    //        })
    //    })
    //})
})

module.exports = router;