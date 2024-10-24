const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');

// 회원가입 (POST 요청)
router.post('/signup', authController.signup);

// e-mail 인증 (GET 요청)
router.get('/verify-email', authController.verifyEmail);

// 로그인 (POST 요청)
router.post('/login', authController.login);

module.exports = router;