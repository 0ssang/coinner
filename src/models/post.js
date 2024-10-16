const mongoose = require('mongoose');
const { create } = require('./postModel');
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
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    comments: [{
        type: Schema.Types.ObjectId,
        ref: 'Comment'
    }]
});

// 게시글이 저장되기 전에 현재 시간으로 업데이트
PostSchema.pre('save', async function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Post', PostSchema);