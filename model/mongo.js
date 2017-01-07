/**
 * Created by morning on 2016/12/26.
 */
var mongoose = require('mongoose');

// 用户模型
var userSchema = mongoose.Schema({
    name: {type: String, unique: true},
    account: {type: String, unique: true},
    password: String
});
exports.User = mongoose.model('User', userSchema);


// 问题模型
var questionSchema = mongoose.Schema({
    //userObjId: mongoose.Schema.Types.ObjectId,
    title: String
});
exports.Question = mongoose.model('Question', questionSchema);