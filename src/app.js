const mongoose = require('mongoose');
const express = require('express');

const app = express();

app.use(express.json());
// JSON 형태의 요청 body를 파싱하기 위해 express.json() 미들웨어 사용 

app.use(express.urlencoded({ extended: false }));

// 인코딩 된 request의 payload를 파싱해주는 미들웨어다.

const port = 3000;
const uri = "mongodb+srv://detective:ysh31228*@cluster0.4huxy.mongodb.net/coinner?retryWrites=true&w=majority&appName=Cluster0";
mongoose.connect(uri).then(() => {
  console.log('Connected to MongoDB');
  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
  });
});