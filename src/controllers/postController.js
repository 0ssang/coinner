// /src/controllers/postController.js
const Post = require('../models/post');
const postService = require('../services/postService');

// 게시글 목록 표시
exports.getPosts = async (req, res) => {
    try {
        const posts = await postService.getPosts();
        res.render('board', { posts });
    } catch (error) {
        res.status(500).send('게시글 목록을 불러오는 중 오류 발생');
    }
};

// 게시글 상세 보기
exports.getPostById = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).send('게시글을 찾을 수 없습니다.');
        }
        res.render('postDetail', { post });
    } catch (error) {
        res.status(500).send('게시글을 불러오는 중 오류 발생');
    }
};

// 게시글 작성 처리
exports.createPost = async (req, res) => {
    // const username = req.user.username
    const username = "manager1"; // manager1은 임시로 하드코딩
    try {
        const { title, content } = req.body;
        // 서비스에서 게시글 작성 처리
        await postService.createPost(title, content, username);

        res.redirect('/board');
    } catch (error) {
        res.status(500).send('게시글 작성 중 오류 발생');
    }
};
