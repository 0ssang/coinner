// /src/routes/postRoutes.js
const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');

// 게시글 목록 조회 라우트 (GET 요청)
router.get('/', postController.getPosts);  // /board 경로에서 게시글 목록 보여줌

// 게시글 작성 페이지 이동 (GET 요청)
router.get('/new', postController.renderCreatePost);

// 특정 게시글 조회 (게시글 상세보기)
router.get('/:id', postController.getPostById);  // 위의 라우터와 중복될 위험이 있으므로 순서 중요!! (/new보다 아래에 있어야 함)

// 게시글 작성 라우트 (POST 요청)
router.post('/', postController.createPost);

module.exports = router;
