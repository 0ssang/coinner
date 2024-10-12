const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');

// src 폴더 안의 config 폴더로 경로 변경
const connectDB = require('./src/config/db'); 

const app = express();

// MongoDB 연결 설정
connectDB(); // db.js 모듈 실행

// 미들웨어 설정
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


// EJS 템플릿 설정 (views 폴더가 src 안에 있을 때)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src', 'views')); // views 폴더 경로 설정

// 라우터 설정
const postRoutes = require('./src/routes/postRoutes'); // postRoutes 경로 수정
app.use('/board', postRoutes); // 게시판 관련 라우터 설정

// 서버 실행
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
