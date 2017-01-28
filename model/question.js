var Question = require('../model/mongo').Question;
var Answer = require('../model/mongo').Answer;
var AnswerAction = require('../model/mongo').AnswerAction;

module.exports = {
    getQuestionPage: function getQuestionPage(question_id){
        return Question.findById(question_id).populate({
            path: 'lstAnswer',
            options: {
                limit: 5,
                sort: {"_id": -1},
                populate: {path: 'userObjId lstActions'}
            }
        }).populate({
            path: 'lstFollower',
            options: {
                limit: 20
            }
        }).exec()
    },
    getAnswers: function getAnswers(question_id){
        return Question
            .findById(question_id)
            .populate('lstAnswer')
            .exec();
    },
    getFollowers: function getFollowers(question_id){
        return Question
            .findById(question_id)
            .populate('lstFollower')
            .exec();
    },
    addQuestion: function addQuestion(question, user_id){
        return Question.create(question);
    },
    followQuestion: function followQuestion(question_id, user_id){
        return Question.findByIdAndUpdate(question_id, {$push: {lstFollower: user_id}}).exec();
    },
    unfollowQuestion: function unfollowQuestion(question_id, user_id){
        return Question.findByIdAndUpdate(question_id, {$pop: {lstFollower: user_id}}).exec();
    },
    increaseView: function increaseView(question_id){
        return Question
            .findByIdAndUpdate(question_id, {$inc: {viewNum: 1}})
            .exec();
    },
    addAnswer: function addAnswer(answer){
        return Answer.create(answer);
    },
    removeAnswer: function removeAnswer(answer){
        return answer.remove();
    },
    addOneAnswerRecord: function addOneAnswerRecord(question_id, answer_id){
        return Question.findByIdAndUpdate(question_id, {$push: {lstAnswer: answer_id}}).exec();
    },
    removeOneAnswerRecord: function removeOneAnswerRecord(question_id, answer_id){
        return Question.findByIdAndUpdate(question_id, {$pop: {lstAnswer: answer_id}}).exec();
    },
    updateAnswer: function updateAnswer(answer_id, answer){
        return Answer.findByIdAndUpdate(answer_id, {$set: {answer: answer, date: Date.now()}}).exec();
    },
    answerAuthorInfo: function answerAuthorInfo(answer_id){
        return Answer.findById(answer_id).populate('userObjId').exec();
    },
    /* action start */
    answerActions: function answerActions(answer_id){
        return Answer.findById(answer_id).populate('lstActions').exec();
    },
    updateActions: function updateActions(action_id, update){
        return AnswerAction.findByIdAndUpdate(action_id, {$set: update}).exec();
    }
    /* action end */
};