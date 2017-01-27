var Question = require('../model/mongo').Question;

module.exports = {
    // 获取问题页面
    getQuestionPage: function getQuestionPage(question_id){
        return Question.findById(question_id).populate({
            path: 'lstAnswer',
            options: {
                limit: 5,
                sort: {"_id": -1},
                populate: {path: 'userObjId'}
            }
        }).populate({
            path: 'lstFollower',
            options: {
                limit: 20
            }
        }).exec()
    },
    // todo:0127怎么判断是否已经回答
    findMyAnswer: function findMyAnswer(question_id, user_id){
        return Question.findOne({_id: question_id})
            .populate('lstAnswer')
            .exec();
    }
};