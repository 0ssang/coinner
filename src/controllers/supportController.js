const Support = require('../models/support'); // 고객센터 모델
const User = require('../models/user'); // 사용자 모델

// 고객센터 게시물 목록
exports.getSupportList = async (req, res) => {
    try {
        const posts = await Support.find().populate('author', 'username');
        res.render('supportList', { posts });
    } catch (error) {
        console.error(error);
        res.status(500).send('서버 오류');
    }
};

// 고객센터 문의 작성 페이지
exports.getSupportCreate = (req, res) => {
    res.render('createSupport');
};

// 고객센터 문의 작성 처리
exports.createSupportPost = async (req, res) => {
    const { title, content, password } = req.body;
    const post = new Support({
        title,
        content,
        password,
        author: req.user._id,
    });

    try {
        await post.save();
        res.redirect('/support');
    } catch (error) {
        console.error(error);
        res.status(500).send('서버 오류');
    }
};

// 고객센터 게시물 상세보기
exports.getSupportDetail = async (req, res) => {
    const { id } = req.params;

    try {
        const post = await Support.findById(id).populate('author', 'username');
        if (!post) {
            return res.status(404).send('게시물이 없습니다.');
        }
        res.render('supportDetail', { post });
    } catch (error) {
        console.error(error);
        res.status(500).send('서버 오류');
    }
};
