const express = require('express');
const router = express.Router();
const homeController = require('../controllers/homeController');

// 홈페이지 라우트 (GET 요청)
router.get('/', homeController.getHomePage);

module.exports = router;