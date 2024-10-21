const mongoose = require('mongoose');
const Post = require('../models/post');
const User = require('../models/user');
const Comment = require('../models/comment');
const paginate = require('../utils/pagination');


// 게시글 작성(트랜잭션 적용)
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
        await newPost.save({ session });
        // 사용자의 posts 필드에 게시글 id 추가
        user.posts.push(newPost._id);
        // 사용자 업데이트 저장
        await user.save({ session });
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


// 게시글 목록 표시 (검색 및 페이지네이션)
exports.getPosts = async (page = 1, limit = 10, searchQuery = "") => {
    const skip = (page - 1) * limit;

    // 검색 조건
    const searchCondition = searchQuery
        ? { $text: { $search: searchQuery } }
        : {};

    // 총 게시글 수 계산
    const totalPosts = await Post.countDocuments(searchCondition);

    // 페이지네이션 적용하여 게시글 가져오기
    const posts = await Post.find(searchCondition)
        .populate('author', 'username')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    // 페이지네이션 정보 계산
    const pagination = paginate(totalPosts, parseInt(page), parseInt(limit));

    return {
        posts,
        pagination
    };
};


// 게시글 상세 보기
exports.getPostById = async (postId) => {
    // 게시글과 댓글, 답글 정보를 가져옴
    try {
        console.log('postId:', postId);
        const post = await Post.findById(postId)
            .populate('author', 'username')
            .populate({
                path: 'comments',
                populate: [
                    { path: 'author', select: 'username' },
                    { path: 'replies.author', select: 'username' }
                ]
            });
        console.log("post:", post);
        if (!post) {
            return null;
        }

        await post.increaseViews();
        return post;
    } catch (error) {
        throw new Error("게시글 조회 중 오류 발생");
    }
};