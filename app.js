const express = require('express');
const app = express();
const mongoose = require('mongoose');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const cors = require('cors');

const postRoutes = require('./api/routes/posts');
const userRoutes = require('./api/routes/users');
const authRoutes = require('./api/routes/auth');

require('dotenv').config();

mongoose.connect('mongodb://localhost:27017/' + process.env.MONGO_DB, {
    useCreateIndex: true,
    useNewUrlParser: true,
});

mongoose.Promise = global.Promise;

if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('dev'));
}

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use(cors());

// Routes
app.use('/posts', postRoutes);
app.use('/users', userRoutes);
app.use('/auth', authRoutes);

// Errors
app.all('*', (req, res) => {
    res.status(404).json({
        message: '404 Not Found',
    });
});

app.use((req, res, next) => {
    const error = new Error('Not Found');
    error.status = 404;
    next(error);
});

app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message,
        },
    });
});

module.exports = app;
