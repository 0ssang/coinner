const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const postRoutes = require('./src/routes/postRoutes'); // postRoutes 경로 수정
const homeRoutes = require('./src/routes/homeRoutes');
const authRoutes = require('./src/routes/authRoutes');
const methodOverride = require('method-override');
//고객센터 수정
const supportRoutes = require('./src/routes/supportRoutes');

// 루트 밑에 config 폴더에 db.js 파일 생성
const connectDB = require('./config/db');
const app = express();

// 미들웨어 설정
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));// 정적 파일을 서빙하기 위한 설정
app.use(methodOverride('_method')); // DELETE, PUT 메서드를 사용하기 위한 미들웨어

// EJS 템플릿 설정 (views 폴더가 src 안에 있을 때)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src', 'views')); // views 폴더 경로 설정

// 라우터 설정
app.use('/', homeRoutes); // 홈페이지 관련 라우터 설정
app.use('/board', postRoutes); // 게시판 관련 라우터 설정
app.use('/auth', authRoutes); // 인증/인가 관련 라우터 설정
app.use('/support', supportRoutes); //고객지원 라우터

// DB 연결 완료 후 서버 실행
(async () => {
  try {
    // MongoDB 연결
    await connectDB();

    // 연결 성공 후 서버 시작
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
      console.log(`서버가 http://localhost:${port} 에서 실행 중입니다.`);
    });
  } catch (error) {
    console.error('서버 시작 중 오류 발생:', error);
    process.exit(1);
  }
})();

