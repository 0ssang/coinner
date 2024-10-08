const mongoose = require('mongoose');
const express = require('express');
require('dotenv').config();

const app = express();

app.use(express.json());
// JSON 형태의 요청 body를 파싱하기 위해 express.json() 미들웨어 사용 

app.use(express.urlencoded({ extended: false }));


const dbHost = process.env.DB_HOST;
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASSWORD;
const port = process.env.PORT;

const uri = `mongodb+srv://${dbUser}:${dbPassword}@${dbHost}`;

mongoose.connect(uri).then(() => {
  console.log('Connected to MongoDB');
  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
  });
});