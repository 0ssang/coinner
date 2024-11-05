const express = require('express');
const supportController = require('../controllers/supportController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

// Q&A 라우터
router.get('/qna', supportController.getQuestions);                          // 질문 목록
router.get('/qna/new', protect, supportController.renderCreateQuestionPage); // 질문 작성 폼 렌더링
router.get('/qna/:id', supportController.fetchQuestionDetail);               // 질문 내용 & 답변 내용 조회 (axios 요청 - 클라에서 비동기처리)
router.post('/qna', protect, supportController.createQuestion);              // 질문 등록
router.delete('/qna/:id', protect, supportController.deleteQuestion);        // 질문 삭제
router.post('/qna/:id/answer', protect, supportController.createAnswer);     // 답변 등록 (axios - 클라에서 비동기 요청)
router.put('/qna/:id/answer', protect, supportController.updateAnswer);      // 답변 내용 수정
router.delete('/qna/:id/answer', protect, supportController.deleteAnswer);   // 답변 내용 삭제

// FAQ 라우터


// 공지사항 라우터


module.exports = router;
