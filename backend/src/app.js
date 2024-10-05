const express = require('express');
const mongoose = require('mongoose');
const app = express();
const port = 3000;

// Routes
const routes = require('./routers');
app.use('/', routes);

mongoose.connect('mongodb://dev:12345@mongo:27017/coinner', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

app.listen(port, () => {
  console.log(`App running at http://localhost:${port}`);
});