const Post = require('../models/post');
const User = require('../models/user');

// 게시글 작성 로직 (메니저 계정 테스트용)
exports.createPost = async (title, content, username) => {
    try {
        // 사용자 찾기
        const user = await User.findOne({ username });

        if (!user) {
            throw new Error('User not found');
        }

        // 새 게시글 생성
        const newPost = new Post({
            title,
            content,
            author: user._id
        });

        // 게시글 저장
        const savePost = await newPost.save();
        if(savePost) {
            // 사용자의 posts 배열에 게시글 id 업데이트
            user.posts.push(newPost._id);
            return await user.save();
        }
    } catch (error) {
        throw new Error(error.message);
    } finally {

    }
};


// 게시글 목록 표시
exports.getPosts = async () => {
    const posts = await Post.find().populate('author', 'username').sort({ createdAt: -1 });
    return posts;
};