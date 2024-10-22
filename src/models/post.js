const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Comment = require('./comment');
const User = require('./user');

const PostSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    content: {
        type: String,
        required: true
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    views: {
        type: Number,
        default: 0
    },
    likes: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    comments: [{
        type: Schema.Types.ObjectId,
        ref: 'Comment'
    }]
}, {
    timestamps: true // 자동으로 createdAt과 updatedAt 필드 생성 및 관리
});

// 조회수 증가 메서드
PostSchema.methods.increaseViews = async function () {
    this.views += 1;
    await this.save();
    return this;
};

// 좋아요 추가 메서드
PostSchema.methods.addLike = async function (userId) {
    if (!this.likes.includes(userId)) {
        this.likes.push(userId);
        await this.save();
        return this;
    }
    return this;
}

// 좋아요 취소 메서드
PostSchema.methods.removeLike = async function (userId) {
    const index = this.likes.indexOf(userId);
    if (index > -1) {
        // 좋아요 리스트에서 제거
        this.likes.splice(index, 1);
        await this.save();
        return this;
    }
    return this;
}

// 텍스트 인덱스 생성
PostSchema.index({ title: 'text', content: 'text' });

// 게시글 삭세 전 댓글 및 user.posts 필드에서 게시글 id 제거
PostSchema.pre('findOneAndDelete', async function (next) {
    const postId = this.getQuery()._id;
    try {
        await Comment.deleteMany({ postId: postId });
        await User.updateOne(
            { _id: this.author },
            { $pull: { posts: this._id } }
        );

        next();
    } catch (error) {
        next(error);
    }
})

module.exports = mongoose.model('Post', PostSchema);