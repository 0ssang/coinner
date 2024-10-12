// /src/models/postModel.js
const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    author: { type: String, default: 'anonymous' },
    createdAt: { type: Date, default: Date.now },
    views: { type: Number, default: 0 }
});

module.exports = mongoose.model('Post', postSchema);
