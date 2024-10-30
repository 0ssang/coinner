const authService = require('../services/authService');

// 회원가입 페이지 렌더링
exports.renderSignup = (req, res) => {
    try {
        res.render('register');
    } catch (error) {
        res.status(404).render('errors/404', { message: error.message });
    }
}

// 로그인 페이지 렌더링
exports.renderLogin = (req, res) => {
    try {
        res.render('login');
    } catch (error) {
        res.status(404).render('errors/404', { message: error.message });
    }
}

// 회원가입 처리
exports.signup = async (req, res) => {
    const { username, email, password } = req.body;

    try {
        const result = await authService.signup(username, email, password);
        res.status(200).json(result);
    } catch (error) {
        res.status(400).render('errors/400', { message: error.message });
    }
};

// e-mail 인증 처리
exports.verifyEmail = async (req, res) => {
    const token = req.query.token;

    try {
        await authService.verifyEmail(token);
        res.status(200).json({ message: '이메일 인증이 완료되었습니다.' });
    } catch (error) {
        res.status(400).render('errors/400', { message: error.message });
    }
};

// 로그인 처리
exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const { accessToken, refreshToken } = await authService.login(email, password);

        // refresh token을 httpOnly 쿠키로 설정하여 안전하게 저장
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7일
        });

        // 로그인 성공 시 accessToken을 클라이언트에 전송하고, 홈 페이지로 리다이렉트
        res.status(200).json({ accessToken, redirectUrl: '/home' });
    } catch (error) {
        res.status(400).render('errors/400', { message: error.message });
    }
};

// Access Token 재발급 처리 (Refresh Token 사용)
exports.refreshToken = async (req, res) => {
    // refreshToken을 httpOnly 쿠키에서 가져옴
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
        return res.status(401).json({ message: '리프레시 토큰이 필요합니다.' });
    }

    try {
        const newAccessToken = await authService.refreshToken(refreshToken);
        res.status(200).json({ newAccessToken });
    } catch (error) {
        res.status(400).render('errors/400', { message: '리프레시 토큰이 유효하지 않습니다.' });
    }
};
