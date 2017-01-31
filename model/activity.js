var UserActivity = require('./mongo.js').UserActivity;

module.exports = {
    activityAddQ: function activityAddQ(user_id, question_id, date){
        return UserActivity.create({
            userObjId: user_id,
            activityType: 'addQuestion',
            date: date,
            documentId: question_id
        })
    },
    activityFollowQ: function activityFollowQ(user_id, question_id, date){
        return UserActivity.create({
            userObjId: user_id,
            activityType: 'followQuestion',
            date: date,
            documentId: question_id
        })
    },
    activityAddA: function activityAddA(user_id, answer_id, date){
        return UserActivity.create({
            userObjId: user_id,
            activityType: 'addAnswer',
            date: date,
            documentId: answer_id
        })
    },
    activityAgreeA: function activityAgreeA(user_id, answer_id, date){
        return UserActivity.create({
            userObjId: user_id,
            activityType: 'agreeAnswer',
            date: date,
            documentId: answer_id
        })
    }
}