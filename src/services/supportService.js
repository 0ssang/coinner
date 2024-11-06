const Question = require('../models/question');
const mongoose = require('mongoose');

// Q&A 목록 조회
exports.getQuestions = async () => {
    try {
        const questions = await Question.find().select("title category createdAt").sort({ createdAt: -1 });
        return questions;
    } catch (error) {
        throw new Error("질문 목록 조회 중 오류 발생");
    }
};

// 특정 질문 데이터 조회
exports.getQuestionById = async (questionId) => {
    try {
        const question = await Question.findById(questionId).populate('author', 'username').populate('answer.author', 'username');
        return question;
    } catch (error) {
        throw new Error('질문 조회 중 오류 발생');
    }
};

// 질문 생성
exports.createQuestion = async (questionData, authorId) => {
    try {
        const newQuestion = new Question({ ...questionData, author: authorId });
        await newQuestion.save();
        return newQuestion;
    } catch (error) {
        throw new Error('질문 생성 중 오류 발생');
    }
};

// 질문 삭제
exports.deleteQuestion = async (questionId) => {
    try {
        const deletedQuestion = await Question.findByIdAndDelete(questionId);
        return deletedQuestion;
    } catch (error) {
        throw new Error("질문 삭제 중 오류 발생");
    }
};

// 답변 생성
exports.createAnswer = async (questionId, content, authorId) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const question = await Question.findById(questionId).session(session);

        if (!question) {
            throw new Error('질문을 찾을 수 없습니다.');
        }

        if (question.answer) {
            throw new Error('이미 답변이 등록된 질문입니다.');
        }

        // 답변 생성 및 추가
        question.answer = { content, author: authorId };
        await question.save({ session });

        // 트랜잭션 커밋
        await session.commitTransaction();

        return question.answer;
    } catch (error) {
        // 트랜잭션 롤백
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
};

// 답변 수정
exports.updateAnswer = async (answerId, content, authorId) => {
    try {
        const question = await Question.findOneAndUpdate(
            { "answer._id": answerId, "answer.author": authorId },
            { "answer.content": content },
            { new: true }
        );

        // question 객체가 존재하고, answer 필드가 있는 경우 반환
        return question && question.answer ? question.answer : null;
    } catch (error) {
        throw new Error('답변 수정 중 오류 발생');
    }
};

// 답변 삭제
exports.deleteAnswer = async (answerId, authorId) => {
    try {
        const result = await Question.updateOne(
            { "answer._id": answerId, "answer_author": authorId },
            { $unset: { answer: "" } }
        );

        return result.nModified > 0;
    } catch (error) {
        throw new Error('답변 삭제 중 오류')
    }
};