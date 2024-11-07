const supportService = require('../services/supportService');

// Q&A 목록 조회
exports.getQuestions = async (req, res) => {
    try {
        const questions = await supportService.getQuestions();
        res.render('questions', { questions });
    } catch (error) {
        res.status(500).render('errors/500', { message: 'Failed to load questions' });
    }
};

exports.fetchQuestionDetail = async (req, res) => {
    try {
        const question = await supportService.getQuestionById(req.params.id);
        if (!question) {
            return res.status(404).json({ message: '질문을 찾을 수 없습니다.' });
        }
        res.status(200).json({ question });
    } catch (error) {
        console.error('질문 상세 조회 중 오류:', error);
        res.status(500).json({ message: '질문 상세 조회 중 오류가 발생했습니다.' });
    }
};

// 질문 등록 페이지 렌더링
exports.renderCreateQuestionPage = (req, res) => {
    res.render('createQuestion');
};

// 질문 등록
exports.createQuestion = async (req, res) => {
    try {
        await supportService.createQuestion(req.body, req.user._id);
        res.redirect('/support/qna');
    } catch (error) {
        res.status(400).render('errors/400', { message: error.message });
    }
};

// 질문 삭제
exports.deleteQuestion = async (req, res) => {
    const questionId = req.params.questionId;

    try {
        const deletedQuestion = await supportService.deleteQuestion(questionId);
        if (!deletedQuestion) {
            return res.status(404).render('errors/404', { message: '질문을 찾을 수 없습니다.' });
        }
        res.redirect('/support/qna');
    } catch (error) {
        console.error('질문 삭제 중 오류:', error);
        res.status(500).render('errors/500', { message: '질문 삭제 중 오류가 발생했습니다.' });
    }
};

// 답변 등록 (CSR)
exports.createAnswer = async (req, res) => {
    const questionId = req.params.questionId;
    const { content } = req.body;
    const authorId = req.user._id;

    try {
        const answer = await supportService.createAnswer(questionId, content, authorId);
        if (!answer) {
            return res.status(400).json({ message: '이미 답변이 등록된 질문이거나 질문이 존재하지 않습니다.' });
        }
        res.status(201).json({ message: '답변이 등록되었습니다.', answer });
    } catch (error) {
        console.error('답변 등록 중 오류:', error);
        res.status(500).json({ message: '답변 등록 중 오류가 발생했습니다.' });
    }
};

// 답변 수정 (CSR)
exports.updateAnswer = async (req, res) => {
    const answerId = req.params.answerId;
    const { content } = req.body;
    const authorId = req.user._id;

    try {
        const updatedAnswer = await supportService.updateAnswer(answerId, content, authorId);
        if (!updatedAnswer) {
            return res.status(404).json({ message: '답변을 찾을 수 없거나 수정 권한이 없습니다.' });
        }
        res.status(200).json({ message: '답변이 수정되었습니다.', updatedAnswer });
    } catch (error) {
        console.error('답변 수정 중 오류:', error);
        res.status(500).json({ message: '답변 수정 중 오류가 발생했습니다.' });
    }
};

// 답변 삭제 (CSR)
exports.deleteAnswer = async (req, res) => {
    const answerId = req.params.answerId;
    const authorId = req.user._id;

    try {
        const deletedAnswer = await supportService.deleteAnswer(answerId, authorId);
        if (!deletedAnswer) {
            return res.status(404).json({ message: '답변을 찾을 수 없거나 삭제 권한이 없습니다.' });
        }
        res.status(200).json({ message: '답변이 삭제되었습니다.' });
    } catch (error) {
        console.error('답변 삭제 중 오류:', error);
        res.status(500).json({ message: '답변 삭제 중 오류가 발생했습니다.' });
    }
};

// FAQ
// FAQ 목록 페이지
exports.getFAQs = async (req, res) => {
    try {
        const faqs = await supportService.getFAQs();
        res.render('faq', { faqs });
    } catch (error) {
        res.status(500).render('errors/500', { message: 'FAQ 목록을 불러오는 중 오류가 발생했습니다.' });
    }
};

// 생성, 수정, 삭제는 관리자 페이지에서 관리하기.....


// 공지사항