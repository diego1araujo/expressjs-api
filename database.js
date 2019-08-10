const mongoose = require('mongoose');

require('dotenv').config();

const { NODE_ENV, DB_URI, DB_URI_TEST } = process.env;

mongoose.connect(NODE_ENV === 'test' ? DB_URI_TEST : DB_URI, {
    useCreateIndex: true,
    useNewUrlParser: true,
});

mongoose.Promise = global.Promise;
