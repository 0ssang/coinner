// /src/controllers/postController.js
const Post = require('../models/post');
const postService = require('../services/postService');

// 게시글 목록 표시
exports.getPosts = async (req, res) => {
    const { page = 1, limit = 10, search = "" } = req.query;

    try {
        // 서비스에서 페이지네이션과 게시글 목록 함께 받아오기
        const { posts, pagination } = await postService.getPosts(page, limit, search);

        if (posts.length === 0) {
            return res.render('board', {
                posts: [],
                message: "게시글이 없습니다.",
                currentPage: pagination.currentPage,
                totalPages: pagination.totalPages,
                pages: pagination.pages,
                searchQuery: search
            });
        }

        // 정상적으로 게시글과 페이지네이션 정보 렌더링
        res.render('board', {
            posts,
            currentPage: pagination.currentPage,
            totalPages: pagination.totalPages,
            pages: pagination.pages,
            searchQuery: search
        });

    } catch (error) {
        console.log('게시글 목록 로드 오류: ', error);
        res.status(500).render('errors/500');
    }
};

// 게시글 조회
exports.getPostById = async (req, res) => {
    try {
        const post = await postService.getPostById(req.params.id);

        if (!post) {
            return res.status(404).render('errors/404', { message: "게시글을 찾을 수 없습니다." });
        }

        res.render('postDetail', { post });
    } catch (error) {
        console.log('게시글 조회 오류: ', error);
        res.status(500).render('errors/500');
    }
};

// 게시글 작성 처리
exports.createPost = async (req, res) => {
    const username = req.user.username;
    //const username = "manager1"; // manager1은 임시로 하드코딩
    try {
        const { title, content } = req.body;
        // 서비스에서 게시글 작성 처리
        await postService.createPost(title, content, username);

        res.redirect('/board');
    } catch (error) {
        res.status(500).render('errors/500');
    }
};

// 게시글 작성 페이지 렌더링
exports.renderCreatePost = (req, res) => {
    res.render('createPost');
};

// 게시글 수정 페이지 렌더링
exports.renderEditPost = async (req, res) => {
    const postId = req.params.id;
    try {
        const post = await postService.getPostByIdForEdit(postId);
        console.log("Controller - post:", post);
        if (!post) {
            return res.status(404).render('errors/404', { message: "게시글을 찾을 수 없습니다." });
        }
        res.render('createPost', { post });

    } catch (error) {
        console.error('게시글 수정 페이지 렌더링 오류 : ', error);
        res.status(500).render('errors/500', { message: '게시글 수정 페이지를 로드하는 중 오류가 발생했습니다.' });
    }
};

// 게시글 수정 처리
exports.updatePost = async (req, res) => {
    const postId = req.params.id;
    const { title, content } = req.body;
    try {
        const updatedPost = await postService.updatePost(postId, title, content);
        if (!updatedPost) {
            return res.status(404).render('errors/404', { message: "게시글을 찾을 수 없습니다." });
        }
        res.redirect(`/board/${postId}`);

    } catch (error) {
        console.error('게시글 수정 오류: ', error);
        res.status(500).render('errors/500', { message: '게시글 수정 중 오류가 발생했습니다.' });
    }
};

// 게시글 삭제 처리
exports.deletePost = async (req, res) => {
    const postId = req.params.id;
    try {
        const deleltedPost = await postService.deletePost(postId);
        if (!deleltedPost) {
            return res.status(404).render('errors/404', { message: "게시글을 찾을 수 없습니다." });
        }
        console.log("삭제된 게시글: ", deleltedPost);
        res.redirect('/board');

    } catch (error) {
        console.error('게시글 삭제 중 오류: ', error);
        res.status(500).render('errors/500', { message: '게시글 삭제 중 오류가 발생했습니다.' });
    }
}

// 댓글 작성 처리
exports.createComment = async (req, res) => {
    const postId = req.params.id;
    const { content } = req.body;
    const userId = req.user._id; // 임시로 하드코딩 인증기능 구현 후 req.user._id 로 변경
    try {
        await postService.createComment(postId, userId, content);

        res.redirect(`/board/${postId}`);
    } catch (error) {
        console.error('댓글 작성 중 오류: ', error);
        res.status(500).render('errors/500');
    }
};

// 댓글 수정 처리
exports.updateComment = async (req, res) => {
    const postId = req.params.postId;
    const commentId = req.params.commentId;
    const { content } = req.body;
    const userId = req.user._id; // 임시로 하드코딩 인증기능 구현 후 req.user._id 로 변경

    try {
        const updatedComment = await postService.updateComment(postId, commentId, content, userId);
        if (!updatedComment) {
            return res.status(404).render('errors/404', { message: "댓글을 찾을 수 없습니다." });
        }
        // 수정 성공 시 게시글 상세 페이지로 이동
        res.redirect(`/board/${postId}`);
    } catch (error) {
        console.error('댓글 수정 중 오류: ', error);
        res.status(500).render('errors/500');
    }
};

// 댓글 삭제 처리
exports.deleteComment = async (req, res) => {
    const postId = req.params.postId;
    const commentId = req.params.commentId;
    const userId = req.user._id; // 임시로 하드코딩 인증기능 구현 후 req.user._id 로 변경

    try {
        const deletedComment = await postService.deleteComment(postId, commentId, userId);
        if (!deletedComment) {
            return res.status(404).render('errors/404', { message: "댓글을 찾을 수 없습니다." });
        }
        // 삭제 성공 시 게시글 상세 페이지로 이동
        res.redirect(`/board/${postId}`);
    } catch (error) {
        console.error('댓글 삭제 중 오류: ', error);
        res.status(500).render('errors/500');
    }
};

// 답글 작성 처리
exports.addReply = async (req, res) => {
    const postId = req.params.postId;
    const commentId = req.params.commentId;
    const { content } = req.body;
    const userId = req.user._id; // 임시로 하드코딩 인증기능 구현 후 req.user._id 로 변경

    try {
        await postService.addReply(postId, commentId, userId, content);
        res.redirect(`/board/${postId}`);
    } catch (error) {
        console.error('답글 작성 중 오류: ', error);
        res.status(500).render('errors/500');
    }
};

// 답글 수정 처리
exports.updateReply = async (req, res) => {
    const postId = req.params.postId;
    const commentId = req.params.commentId;
    const replyId = req.params.replyId;
    const { content } = req.body;
    const userId = req.user._id; // 임시로 하드코딩 인증기능 구현 후 req.user._id 로 변경

    try {
        const updatedReply = await postService.updateReply(postId, commentId, replyId, userId, content);
        if (!updatedReply) {
            return res.status(404).render('errors/404', { message: "답글을 찾을 수 없습니다." });
        }
        // 수정 성공 시 게시글 상세 페이지로 이동
        res.redirect(`/board/${postId}`);

    } catch (error) {
        console.error('답글 수정 중 오류: ', error);
        res.status(500).render('errors/500');
    }
};

// 답글 삭제 처리
exports.deleteReply = async (req, res) => {
    const postId = req.params.postId;
    const commentId = req.params.commentId;
    const replyId = req.params.replyId;
    const userId = req.user._id; // 임시로 하드코딩 인증기능 구현 후 req.user._id 로 변경 

    try {
        const replyRemovedComment = await postService.deleteReply(postId, commentId, replyId, userId);
        if (!replyRemovedComment) {
            return res.status(404).render('errors/404', { message: "답글을 찾을 수 없습니다." });
        }
        // 삭제 성공 시 게시글 상세 페이지로 이동
        res.redirect(`/board/${postId}`);
    } catch (error) {
        console.error('답글 삭제 중 오류: ', error);
        res.status(500).render('errors/500');
    }
};
