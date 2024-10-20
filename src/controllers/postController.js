// /src/controllers/postController.js
const Post = require('../models/post');
const postService = require('../services/postService');

// 게시글 목록 표시
exports.getPosts = async (req, res) => {
    const { page = 1, limit = 10, search = "" } = req.query;

    try {
        // 서비스에서 페이지네이션과 게시글 목록 함께 받아오기
        const { posts, pagination } = await postService.getPosts(page, limit, search);

        // // 페이지 범위 확인
        // if(page < 1 || page > pagination.totalPages) {
        //     return res.status(400).render('404', { message: "페이지를 찾을 수 없습니다." });
        // }
        
        // 게시글이 없는 경우
        if(posts.length === 0) {
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
        res.status(500).send('게시글 목록을 불러오는 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요. ');
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
