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
        const post = await Post.findById(postId)
            .populate('author', 'username')
            .populate({
                path: 'comments',
                populate: [
                    { path: 'author', select: 'username' },
                    { path: 'replies.author', select: 'username' }
                ]
            });
        if (!post) {
            return null;
        }

        await post.increaseViews();
        return post;
    } catch (error) {
        throw new Error("게시글 조회 중 오류 발생");
    }
};

// 게시글 조회 (수정을 위한)
exports.getPostByIdForEdit = async (postId) => {
    console.log('postId:', postId);
    try {
        const post = await Post.findById(postId).select('title content author');
        console.log('post:', post);
        if (!post) {
            return null;
        }
        return post;
    } catch (error) {
        throw new Error("게시글 조회 중 오류 발생");
    }
};

// 게시글 수정
exports.updatePost = async (postId, title, content) => {
    try {
        const updatedPost = await Post.findByIdAndUpdate(postId, { title, content }, { new: true });
        return updatedPost;
    } catch (error) {
        throw new Error('게시글 수정 중 오류 발생');
    }
};

// 게시글 삭제
exports.deletePost = async (postId) => {
    try {
        const deletedPost = await Post.findByIdAndDelete(postId);
        if (!deletedPost) {
            return null;
        }
        return deletedPost;
    } catch (error) {
        throw new Error('게시글 삭제 중 오류 발생');
    }
};

// 댓글 작성 (트랜잭션 적용)
exports.createComment = async (postId, userId, content) => {
    console.log(`Service: Creating comment for postId=${postId}, userId=${userId}, content=${content}`);

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const newComment = new Comment({ content, author: userId });
        await newComment.save({ session });

        await Post.findByIdAndUpdate(postId, { $push: { comments: newComment._id } }, { session });

        await session.commitTransaction();
        session.endSession();

        return newComment;
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error('댓글 작성 중 오류 발생:', error);
        throw new Error('댓글 작성 중 오류 발생');
    }
};

// 댓글 수정
exports.updateComment = async (postId, commentId, content, userId) => {
    try {
        // 1. 댓글을 ID로 찾아서 확인
        const comment = await Comment.findOne({ _id: commentId, author: userId });

        // 2. 댓글이 존재하지 않거나 사용자가 작성한 댓글이 아닌 경우 null 반환
        if (!comment) {
            return null;
        }

        // 3. 댓글 내용 업데이트
        comment.content = content;

        // 4. 업데이트된 댓글 저장
        const updatedComment = await comment.save();
        return updatedComment;
    } catch (error) {
        throw new Error('댓글 수정 중 오류 발생');
    }
};

// 댓글 삭제
exports.deleteComment = async (postId, commentId, userId) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // 1. 삭제할 댓글 찾기 (작성자도 확인)
        const comment = await Comment.findOne({ _id: commentId, author: userId }).session(session);
        if (!comment) {
            await session.abortTransaction();
            session.endSession();
            return null;
        }
        // 2. 댓글 삭제
        await Comment.deleteOne({ _id: commentId }).session(session);
        // 3. 게시글의 commnets 배열에서 commentId 제거
        await Post.findByIdAndUpdate(postId, { $pull: { comments: commentId } }, { session });
        // 4. 트랜잭션 커밋
        await session.commitTransaction();
        session.endSession();

        return comment;
    } catch (error) {
        // 트랜잭션 롤백
        await session.abortTransaction();
        session.endSession();
        console.error('댓글 삭제 중 오류 발생:', error);
        throw new Error('댓글 삭제 중 오류 발생');
    }
};

// 답글 작성
exports.addReply = async (postId, commentId, userId, content) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // 1. 댓글 찾기
        const comment = await Comment.findOne({ _id: commentId }).session(session);
        if (!comment) {
            await session.abortTransaction();
            session.endSession();
            return null;
        }
        // 2. 댓글에 답글 추가
        comment.replies.push({
            content: content,
            author: userId,
            createdAt: new Date(), // 타임스탬프는 자동으로 관리되지만 명시적으로 작성
            updatedAt: new Date()
        });
        // 3. 댓글 저장
        await comment.save({ session });

        // 4. 트랜잭션 커밋
        await session.commitTransaction();
        session.endSession();

        return comment;
    } catch (error) {
        // 트랜잭셩 롤백
        await session.abortTransaction();
        session.endSession();
        console.error('답글 작성 중 오류:', error);
        throw new Error('답글 작성 중 오류');
    }
};

// 답글 수정
exports.updateReply = async (postId, commentId, replyId, userId, content) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // 1. 댓글 찾기
        const comment = await Comment.findById(commentId).session(session);
        if (!comment) {
            await session.abortTransaction();
            session.endSession();
            return null;
        }

        // 2. 답글을 찾기 (userId도 확인)
        const reply = comment.replies.id(replyId);
        if (!reply || reply.author.toString() !== userId.toString()) {
            await session.abortTransaction();
            session.endSession();
            return null;
        }
        // 3. 답글 내용 업데이트
        reply.content = content;
        //reply.updatedAt = new Date();

        // 4. 댓글 저장
        await comment.save({ session });

        // 5. 트랜잭션 커밋
        await session.commitTransaction();
        session.endSession();
        console.log('수정된 답글:', reply);
        return reply;
    } catch (error) {
        // 트랜잭션 롤백
        await session.abortTransaction();
        session.endSession();
        console.error('답글 수정 중 오류:', error);
        throw new Error('답글 수정 중 오류');
    }
};

// 답글 삭제
exports.deleteReply = async (postId, commentId, replyId, userId) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // 1. 댓글 찾기
        const comment = await Comment.findById(commentId).session(session);
        if (!comment) {
            await session.abortTransaction();
            session.endSession();
            return null;
        }

        // 2. 답글 삭제 (조건: _id와 author가 일치하는 답글을 삭제)
        await Comment.updateOne(
            { _id: commentId },
            { $pull: { replies: { _id: replyId, author: userId } } },  // 조건에 맞는 답글을 삭제
            { session }
        );

        // 3. 트랜잭션 커밋
        await session.commitTransaction();
        session.endSession();

        return comment;  // 업데이트된 댓글 반환
    } catch (error) {
        // 트랜잭션 롤백
        await session.abortTransaction();
        session.endSession();
        console.error('답글 삭제 중 오류:', error);
        throw new Error('답글 삭제 중 오류');
    }
};