// /src/routes/postRoutes.js
const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');

// 게시글 목록 조회 (GET 요청)
router.get('/', postController.getPosts);  // /board 경로에서 게시글 목록 보여줌

// 게시글 작성 페이지 이동 (GET 요청)
router.get('/new', postController.renderCreatePost);

// 특정 게시글 조회 (게시글 상세보기)
router.get('/:id', postController.getPostById);  // 위의 라우터와 중복될 위험이 있으므로 순서 중요!! (/new보다 아래에 있어야 함)

// 게시글 작성 (POST 요청)
router.post('/', postController.createPost);

// 게시글 수정 페이지 이동 (GET 요청)
router.get('/:id/edit', postController.renderEditPost);

// 게시글 수정 (PUT 요청)
router.put('/:id', postController.updatePost);

// 게시글 삭제 (DELETE 요청)
router.delete('/:id', postController.deletePost);

// 댓글 작성(POST 요청)
router.post('/:id/comments', postController.createComment);

// 댓글 수정 (PUT 요청)
router.put('/:postId/comments/:commentId', postController.updateComment);

// 댓글 삭제 (DELETE 요청)
//router.delete('/:postId/comments/:commentId', postController.deleteComment);

module.exports = router;
