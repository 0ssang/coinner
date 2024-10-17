const User = require('../models/user');

// 사용자 등록
const registerUser = async (req, res) => {
    try{
        const { username, email, password, role } = req.body;

        // 새로운 사용자 생성
        const newUser = new User({
            username,
            email,
            password,
            role
        });

        // MongoDD에 사용자 저장
        await newUser.save();

        res.status(201).json({
            message: '사용자 등록 성공',
            user: newUser
        });
    } catch (error) {
        res.status(500).json({
            message: '사용자 등록 중 오류 발생',
            error: error.message
        });
    }
};

module.exports = {
    registerUser
};