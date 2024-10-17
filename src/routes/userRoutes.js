const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// 회원가입 POST 요청 처리
router.post('/register', userController.register);

module.exports = router;