var mongoose = require('mongoose');

// 用户模型
var userSchema = mongoose.Schema({
    name: {type: String, unique: true},
    bio: String,
    account: {type: String, unique: true},
    password: String
});
exports.User = mongoose.model('User', userSchema);


// 问题模型
var questionSchema = mongoose.Schema({
    userObjId: mongoose.Schema.Types.ObjectId,
    answers: [String],
    title: String
});
exports.Question = mongoose.model('Question', questionSchema);

// 答案模型
var answerSchema = mongoose.Schema({
    userObjId: mongoose.Schema.Types.ObjectId,
    answer: String
});
exports.Answer = mongoose.model('Answer', answerSchema);