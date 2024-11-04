const express = require('express');
const { 
    getSupportList, 
    getSupportCreate, 
    createSupportPost, 
    getSupportDetail 
} = require('../controllers/supportController');
const { authenticate } = require('../middlewares/authMiddleware');

const router = express.Router();

// 고객센터 게시물 목록
router.get('/', authenticate, getSupportList);

// 고객센터 문의 작성 페이지
router.get('/create', authenticate, getSupportCreate);

// 고객센터 문의 작성 처리
router.post('/create', authenticate, createSupportPost);

// 고객센터 게시물 상세보기
router.get('/:id', authenticate, getSupportDetail);

module.exports = router;
