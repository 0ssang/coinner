const User = require('../models/user');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const bcrypt = require('bcrypt');

// 비밀번호 정책 강화 (정규식으로 유효성 검사)
const passwordValidator = (password) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/; // 8자 이상, 대소문자, 숫자, 특수문자 포함
    return passwordRegex.test(password);
}

// 회원가입 처리
exports.signup = async (username, email, password) => {
    const session = await User.startSession();
    session.startTransaction();
    try {
        if (!passwordValidator(password)) {
            throw new Error('비밀번호는 최소 8자 이상, 대문자, 소문자, 특수문자를 포함해야 합니다.');
        }

        const existingUser = await User.findOne({ email }).session(session);
        if (existingUser) {
            if (existingUser.isVerified) {
                throw new Error('이미 가입된 이메일입니다.');
            } else {
                throw new Error('이메일이 이미 발송되었습니다. 이메일을 확인해 주세요.');
            }
        }


        // 이메일 전송 성공 시 사용자 정보 저장
        const newUser = new User({ username, email, password });
        await newUser.save({ session });

        // 이메일 인증 토큰 생성
        const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: process.env.EMAIL_ID,
                pass: process.env.EMAIL_PASSWORD
            }
        });

        const verificationLink = `http://localhost:3000/auth/verify-email?token=${token}`;
        const mailOptions = {
            from: process.env.EMAIL_ID,
            to: email,
            subject: '이메일 인증을 완료해주세요.',
            html: `<p>회원가입을 완료하려면 <a href="${verificationLink}">여기</a>를 클릭하세요.</p>`
        };

        // 이메일 전송
        await transporter.sendMail(mailOptions);

        // 트랜잭션 커밋
        await session.commitTransaction();
        session.endSession();

        return { message: '이메일 인증을 위한 메일이 발송되었습니다.' };
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error('이메일 전송 실패:', error);
        throw new Error('이메일 전송에 실패했습니다. 나중에 다시 시도해 주세요.');
    }
};

// e-mail 인증 처리
exports.verifyEmail = async (token) => {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);
    if (!user) {
        throw new Error('유효하지 않은 사용자입니다.');
    }

    if (user.isVerified) {
        throw new Error('이미 인증된 이메일입니다.');
    }

    user.isVerified = true;
    await user.save();
};

// 로그인 처리 및 토큰 발급
exports.login = async (email, password) => {
    const user = await User.findOne({ email });
    if (!user) {
        throw new Error('가입되지 않은 이메일입니다.');
    }

    if (!user.isVerified) {
        throw new Error('이메일 인증이 완료되지 않았습니다.');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
        throw new Error('비밀번호가 일치하지 않습니다.');
    }

    // Access Token 발급 (1시간)
    const accessToken = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Refresh Token 발급 (7일)
    const refreshToken = jwt.sign({ id: user._id }, process.env.REFRESH_SECRET, { expiresIn: '7d' });

    user.refreshToken = refreshToken;
    await user.save();

    return { accessToken, refreshToken };
};

// Refresh Token을 사용한 Access Token 재발급
exports.issueNewToken = async (refreshToken) => {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);
    if (!user || user.refreshToken !== refreshToken) {
        throw new Error('리프레시 토큰이 유효하지 않습니다.');
    }

    // 새로운 Access Token 발급 (1시간)
    const accessToken = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
    return accessToken;
};