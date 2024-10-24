// /src/routes/postRoutes.js
const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const { protect } = require('../middlewares/authMiddleware'); // 인증 미들웨어 가져오기

// 게시글 목록 조회 (GET 요청)
router.get('/', postController.getPosts);  // /board 경로에서 게시글 목록 보여줌

// 게시글 작성 페이지 이동 (GET 요청)
router.get('/new', protect, postController.renderCreatePost);

// 특정 게시글 조회 (GET 요청)
router.get('/:id', postController.getPostById);  // 위의 라우터와 중복될 위험이 있으므로 순서 중요!! (/new보다 아래에 있어야 함)

// 게시글 작성 (POST 요청)
router.post('/', protect, postController.createPost);

// 게시글 수정 페이지 이동 (GET 요청)
router.get('/:id/edit', protect, postController.renderEditPost);

// 게시글 수정 (PUT 요청)
router.put('/:id', protect, postController.updatePost);

// 게시글 삭제 (DELETE 요청)
router.delete('/:id', protect, postController.deletePost);

// 댓글 작성(POST 요청)
router.post('/:id/comments', protect, postController.createComment);

// 댓글 수정 (PUT 요청)
router.put('/:postId/comments/:commentId', protect, postController.updateComment);

// 댓글 삭제 (DELETE 요청)
router.delete('/:postId/comments/:commentId', protect, postController.deleteComment);

// 답글 작성 (POST 요청)
router.post('/:postId/comments/:commentId/replies', protect, postController.addReply);

// 답글 수정 (PUT 요청)
router.put('/:postId/comments/:commentId/replies/:replyId', protect, postController.updateReply);

// 답글 삭제 (DELETE 요청)
router.delete('/:postId/comments/:commentId/replies/:replyId', protect, postController.deleteReply);

module.exports = router;
