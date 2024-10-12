const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    const dbHost = process.env.DB_HOST;        // 환경 변수에서 호스트 가져오기
    const dbUser = process.env.DB_USER;        // 환경 변수에서 사용자 가져오기
    const dbPassword = process.env.DB_PASSWORD; // 환경 변수에서 비밀번호 가져오기

    // MongoDB URI가 올바르게 설정되어 있는지 확인
    if (!dbHost || !dbUser || !dbPassword) {
      throw new Error("환경 변수가 올바르게 설정되지 않았습니다.");
    }

    const uri = `mongodb+srv://${dbUser}:${dbPassword}@${dbHost}`;

    await mongoose.connect(uri);  // useNewUrlParser와 useUnifiedTopology는 더 이상 필요 없음
    console.log('MongoDB 연결 성공');
  } catch (error) {
    console.error('MongoDB 연결 실패:', error);
    process.exit(1); // 오류 발생 시 서버 종료
  }
};

module.exports = connectDB;
