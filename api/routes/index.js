const express = require('express');

const app = express();

app.use('/posts', require('./posts'));
app.use('/users', require('./users'));
app.use('/auth', require('./auth'));

module.exports = app;
