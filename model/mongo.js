var mongoose = require('mongoose');

/* 用户模型
* name              昵称
* date              创建时间
* bio               一句话简介
* profileUrl        头像路径，没有上传就是空
* account           登录账号-手机号
* password          登录密码-sha1加密
* lstQuestion       所有的提问 "_id"列表
* lstAnswers        所有的回答 "_id"列表
* lstFollower       关注者"_id"列表
* viewNum           被浏览次数
* */
var userSchema = mongoose.Schema({
    name: {type: String, unique: true},
    date: { type: Date, default: Date.now },
    bio: String,
    profileUrl: String,
    account: {type: String, unique: true},
    password: String,
    lstQuestion: [{type: mongoose.Schema.Types.ObjectId, ref: 'Question'}],
    lstAnswer: [{type: mongoose.Schema.Types.ObjectId, ref: 'Answer'}],
    lstFollower: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],     // todo:未实现
    viewNum: {type: Number, default: 0}
});
exports.User = mongoose.model('User', userSchema);


/* 问题模型
 * userObjId        答案作者id
 * date             创建时间
 * title            问题
 * lstAnswer        问题所有答案"_id"列表
 * lstFollower      关注者"_id"列表
 * viewNum          被浏览次数
 * */
var questionSchema = mongoose.Schema({
    userObjId: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    date: { type: Date, default: Date.now },
    title: String,
    lstAnswer: [{type: mongoose.Schema.Types.ObjectId, ref: 'Answer'}],
    lstFollower: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
    viewNum: {type: Number, default: 0}
});
exports.Question = mongoose.model('Question', questionSchema);


/* 答案模型
 * userObjId        答案作者"_id"
 * answer           答案内容
 * date             回答时间
 * lstActions       其他user对此答案点赞，支持，反对的记录
 * agreeNum         赞同数
 * viewNum          被浏览次数
 * */
var answerSchema = mongoose.Schema({
    userObjId: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    answer: String,
    date: { type: Date, default: Date.now },
    questionId: {type: mongoose.Schema.Types.ObjectId, ref: 'Question'},
    lstActions: [{type: mongoose.Schema.Types.ObjectId, ref: 'AnswerAction'}],
    agreeNum: {type: Number, default: 0}
});
exports.Answer = mongoose.model('Answer', answerSchema);


/* 对答案的操作模型
 * userObjId        操作用户"_id"
 * isAgree          是否已赞同
 * isDisAgree       是否已反对
 * isThanks         是否已感谢
 *  */
var answerActionSchema = mongoose.Schema({
    userObjId: {type: mongoose.Schema.Types.ObjectId, unique: true, ref: 'User'},
    isAgree: {type: Boolean, default: false},
    isDisagree: {type: Boolean, default: false},
    isThanks: {type: Boolean, default: false}
});
exports.AnswerAction = mongoose.model('AnswerAction', answerActionSchema);