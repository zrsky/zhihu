var UserActivity = require('./mongo.js').UserActivity;

module.exports = {
    activityAddQ: function activityAddQ(user_id, question_id, date){
        return UserActivity.create({
            userObjId: user_id,
            activityType: 'addQuestion',
            date: date,
            questionId: question_id
        })
    }
}