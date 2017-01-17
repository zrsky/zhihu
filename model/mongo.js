var mongoose = require('mongoose');

/* 用户模型
* name              昵称
* date              创建时间
* bio               一句话简介
* profileUrl        头像路径，没有上传就是空
* account           登录账号-手机号
* password          登录密码-sha1加密
* lstQuestion       所有提过的问题"_id"列表
* lstAnswers        所有的回答"_id"列表
* */
var userSchema = mongoose.Schema({
    name: {type: String, unique: true},
    date: { type: Date, default: Date.now },
    bio: String,
    profileUrl: {type: String, default: '/images/system/profile_l.jpg'},
    account: {type: String, unique: true},
    password: String,
    lstQuestion: [String],
    lstAnswer: [String]
});
exports.User = mongoose.model('User', userSchema);


/* 问题模型
 * userObjId        答案作者id
 * date             创建时间
 * title            问题
 * lstAnswer        问题所有答案"_id"列表
 * lstFollower      关注着"_id"列表
 * viewNum          被浏览次数
 * */
var questionSchema = mongoose.Schema({
    userObjId: mongoose.Schema.Types.ObjectId,
    date: { type: Date, default: Date.now },
    title: String,
    lstAnswer: [String],
    lstFollower: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
    viewNum: {type: Number, default: 0}
});
exports.Question = mongoose.model('Question', questionSchema);

/* 答案模型
 * userObjId        答案作者"_id"
 * answer           答案内容
 * date             回答时间
 * upNum            赞同数
 * */
var answerSchema = mongoose.Schema({
    userObjId: mongoose.Schema.Types.ObjectId,
    answer: String,
    date: { type: Date, default: Date.now },
    upNum: {type: Number, default: 0}
});
exports.Answer = mongoose.model('Answer', answerSchema);