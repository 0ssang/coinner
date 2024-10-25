const authService = require('../services/authService');

// 회원가입 처리
exports.signup = async (req, res) => {
    const { username, email, password } = req.body;

    try {
        const result = await authService.signup(username, email, password);
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// e-mail 인증 처리
exports.verifyEmail = async (req, res) => {
    const token = req.query.token;

    try {
        await authService.verifyEmail(token);
        res.status(200).json({ message: '이메일 인증이 완료되었습니다.' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// 로그인 처리
exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const { accessToken, refreshToken } = await authService.login(email, password);
        res.status(200).json({ accessToken, refreshToken });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Access Token 재발급 처리 (Refresh Token 사용)
exports.refreshToken = async (req, res) => {
    const { refreshToken } = req.body;

    try {
        const newAccessToken = await authService.refreshToken(refreshToken);
        res.status(200).json({ newAccessToken });
    } catch (error) {
        res.status(400).json({ message: '리프레시 토큰이 유효하지 않습니다.' });
    }
};
