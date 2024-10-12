// /src/routes/postRoutes.js
const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');

// 게시글 목록 조회 라우트 (GET 요청)
router.get('/', postController.getPosts);  // /board 경로에서 게시글 목록 보여줌

// 특정 게시글 조회 (게시글 상세보기)
router.get('/:id', postController.getPostById);  // /board/:id 경로에서 게시글 상세 보기

// 게시글 작성 페이지 이동 (GET 요청)
router.get('/create', (req, res) => {
    res.render('createPost');  // 게시글 작성 페이지를 렌더링
});

// 게시글 작성 라우트 (POST 요청)
router.post('/create', postController.createPost);

module.exports = router;
