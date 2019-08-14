require('dotenv').config();

const mongoose = require('mongoose');

const environment = process.env.NODE_ENV;
const config = require('./config')[environment];

mongoose.connect(config.database, {
    useCreateIndex: true,
    useNewUrlParser: true,
});

mongoose.Promise = global.Promise;
