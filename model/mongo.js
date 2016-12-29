/**
 * Created by morning on 2016/12/26.
 */
var mongoose = require('mongoose');

var userSchema = mongoose.Schema({
    name: {type: String, unique: true},
    account: {type: String, unique: true},
    password: String
})

exports.User = mongoose.model('User', userSchema);