var mongoose = require('mongoose');

/* 用户模型
* name              昵称
* bio               一句话简介
* profileUrl        头像路径，没有上传就是空
* account           登录账号-手机号
* password          登录密码-sha1加密
* */
var userSchema = mongoose.Schema({
    name: {type: String, unique: true},
    bio: String,
    profileUrl: String,
    account: {type: String, unique: true},
    password: String
});
exports.User = mongoose.model('User', userSchema);


/* 问题模型
 * userObjId        答案作者id
 * title            问题
 * answers          答案_id的列表
 * viewNum          被浏览次数
 * */
var questionSchema = mongoose.Schema({
    userObjId: mongoose.Schema.Types.ObjectId,
    answers: [String],
    title: String
});
exports.Question = mongoose.model('Question', questionSchema);

/* 答案模型
 * userObjId        答案作者id
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