const Post = require('../models/post');
const User = require('../models/user');

// 게시글 작성 로직 (메니저 계정 테스트용)
exports.createPost = async (title, content, username) => {
    const manager = await User.findOne({ username });

    if (!manager) {
        throw new Error('Manager not found');
    }

    const newPost = new Post({
        title,
        content,
        author: manager._id
    });

    return await newPost.save();
};

// 게시글 목록 표시
exports.getPosts = async () => {
    const posts = await Post.find().populate('author', 'username').sort({ createdAt: -1 });
    return posts;
};