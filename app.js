const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const cors = require('cors');
const bodyParser = require('body-parser');
const validator = require('express-validator');

const app = express();

require('dotenv').config();

const { NODE_ENV, DB_URI, DB_URI_TEST } = process.env;

mongoose.connect(NODE_ENV === 'test' ? DB_URI_TEST : DB_URI, {
    useCreateIndex: true,
    useNewUrlParser: true,
});

mongoose.Promise = global.Promise;

if (NODE_ENV === 'dev') app.use(morgan('dev'));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(cors());

app.use(validator());

// Routes
app.use('/api', require('./api/routes/'));

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

app.use((error, req, res) => {
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message,
        },
    });
});

module.exports = app;
