const mongoose = require('mongoose');
const Post = require('../models/post');
const User = require('../models/user');

// 게시글 작성 로직 (트랜잭션 적용)
exports.createPost = async (title, content, username) => {
    // MongoDB 세션 시작
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // 사용자 찾기
        const user = await User.findOne({ username }).session(session);
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
        await newPost.save({ session }); // 트랜잭션 내에서 저장

        // 사용자의 posts 필드에 게시글 id 추가
        user.posts.push(newPost._id);

        // 사용자 업데이트 저장
        await user.save({ session }); // 트랜잭션 내에서 저장
        
        // 트랜잭션 커밋 (성공적으로 완료)
        await session.commitTransaction();

        return newPost;
    } catch (error) {
        // 트랜잭션 롤백 (오류 발생 시)
        await session.abortTransaction();
        throw new Error(error.message);
    } finally {
        // 세션 종료
        session.endSession();
    }
};


// 게시글 목록 표시
exports.getPosts = async () => {
    const posts = await Post.find().populate('author', 'username').sort({ createdAt: -1 });
    return posts;
};