const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    posts: [{
        type: Schema.Types.ObjectId,
        ref: 'Post'
    }]

});

// 비밀번호를 저장하기 전에 해시 처리하는 미들웨어
UserSchema.pre('save', async function (next) {
    try {
        // 비밀번호가 새롭게 저장되거나 수정될 때만 해시 처리
        if (this.isModified('password') || this.isNew) {
            // 솔트값 생성
            const salt = await bcrypt.genSalt(10);
            // 해시 처리
            const hashedPassword = await bcrypt.hash(this.password, salt);
            // 비밀번호를 해시로 교체
            this.password = hashedPassword;
        }
        next();
    } catch (error) {
        next(error);
    }
});

// 입력된 비밀번호가 데이터베이스에 저장된 해시된 비밀번호와 일치하는지 비교
UserSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);