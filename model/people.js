var User = require('./mongo.js').User;

module.exports = {
    getUserByAccount: function getUserByAccount(account){
      return User.findOne({account: account}).exec();
    },
    getUserPage: function getUserPage(_id){
        return User.findById(_id).populate({
            path: 'lstQuestion',
            options:{
                limit: 3,
                sort: {"_id": -1}
            }
        }).exec();
    },
    createUser: function createUser(user){
        return User.create(user);
    },
    updateProfileUrl: function updateProfileUrl(_id, url){
        return User.findByIdAndUpdate(_id, {$set: {profileUrl: url}}).exec();
    }
}

