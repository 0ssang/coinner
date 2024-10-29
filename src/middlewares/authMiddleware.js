const jwt = require('jsonwebtoken');
const User = require('../models/user');
const Post = require('../models/post');
const Comment = require('../models/comment');

// 접근 권한이 있는지 확인하는 미들웨어 (Access Token이 있는지 확인)
exports.protect = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: '로그인이 필요합니다.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id).select('-password');
        next();
    } catch (error) {
        return res.status(401).json({ message: '유효하지 않은 토큰입니다.' });
    }
};

// 게시글 작성자인지 확인하는 미들웨어
exports.authorizePostOwner = async (req, res, next) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).render('errors/404', { message: '게시글을 찾을 수 없습니다.' });
        }

        // 게시글 작성자와 현재 로그인한 사용자의 _id 비교
        if (post.author.toString() !== req.user._id.toString()) {
            return res.status(403).render('errors/403', { message: '게시글 작성자만 수정 및 삭제할 수 있습니다.' });
        }

        next();
    } catch (error) {
        return res.status(500).render('errors/500');
    }
}