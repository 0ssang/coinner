const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const postRoutes = require('./src/routes/postRoutes'); // postRoutes 경로 수정
const homeRoutes = require('./src/routes/homeRoutes');
const userRoutes = require('./src/routes/userRoutes');

// 루트 밑에 config 폴더에 db.js 파일 생성
const connectDB = require('./config/db');

const app = express();

// MongoDB 연결 설정
connectDB(); // db.js 모듈 실행

// 미들웨어 설정
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
// 정적 파일을 서빙하기 위한 설정
app.use(express.static(path.join(__dirname, 'public')));

// EJS 템플릿 설정 (views 폴더가 src 안에 있을 때)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src', 'views')); // views 폴더 경로 설정

// 라우터 설정
app.use('/', homeRoutes); // 홈페이지 관련 라우터 설정
app.use('/board', postRoutes); // 게시판 관련 라우터 설정
app.use('/users', userRoutes); // 사용자 관련 라우터 설정

// 서버 실행
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
