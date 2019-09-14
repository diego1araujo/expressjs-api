const express = require('express');
const morgan = require('morgan');
const cors = require('cors');

const app = express();

// Database
require('./api/database');

if (process.env.NODE_ENV === 'dev') app.use(morgan('dev'));
app.use(express.json());
app.use(cors());

// Routes
app.use('/api', require('./api/routes/'));

// Errors
require('./api/errors');

module.exports = app;
