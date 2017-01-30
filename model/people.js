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
        }).populate({
            path: 'lstAnswer',
            options:{
                limit: 3,
                sort: {"_id": -1},
                populate: {path: 'questionId'}
            }
        }).populate({
            path: 'lstActivity',
            options:{
                limit: 3,
                sort: {"_id": -1}
            }
        }).exec();
    },
    increaseView: function increaseView(user_id){
        return User
            .findByIdAndUpdate(user_id, {$inc: {viewNum: 1}})
            .exec();
    },
    createUser: function createUser(user){
        return User.create(user);
    },
    updateProfileUrl: function updateProfileUrl(user_id, url){
        return User.findByIdAndUpdate(user_id, {$set: {profileUrl: url}}).exec();
    },
    /* question start */
    addOneQuestionRecord: function addOneQuestionRecord(user_id, question_id){
        return User.findByIdAndUpdate(user_id, {$push: {lstQuestion: question_id}}).exec();
    },
    removeOneQuestionRecord: function removeOneQuestionRecord(user_id, question_id){
        return User.findByIdAndUpdate(user_id, {$pull: {lstQuestion: question_id}}).exec();
    },
    /* question end */
    /* answer start */
    addOneAnswerRecord: function addOneAnswerRecord(user_id, answer_id){
        return User.findByIdAndUpdate(user_id, {$push: {lstAnswer: answer_id}}).exec();
    },
    removeOneAnswerRecord: function removeOneAnswerRecord(user_id, answer_id){
        return User.findByIdAndUpdate(user_id, {$pull: {lstAnswer: answer_id}}).exec();
    },
    /* answer end */
    /* activity start */
    addOneActivityRecord: function addOneActivityRecord(user_id, activity_id){
        return User.findByIdAndUpdate(user_id, {$push: {lstActivity: activity_id}}).exec();
    },
    removeOneActivityRecord: function removeOneActivityRecord(user_id, activity_id){
        return User.findByIdAndUpdate(user_id, {$pull: {lstActivity: activity_id}}).exec();
    },
    /* activity end */
}

