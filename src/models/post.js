const mongoose = require('mongoose');
const Schema = mongoose.Schema;

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

// // 게시글이 저장되기 전에 현재 시간으로 업데이트 ==> timestamps 옵션으로 대체
// PostSchema.pre('save', async function (next) {
//     this.updatedAt = Date.now();
//     next();
// });

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

module.exports = mongoose.model('Post', PostSchema);