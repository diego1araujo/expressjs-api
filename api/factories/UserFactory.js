const { factory } = require('factory-girl');

const User = require('../models/User');

factory.define('User', User, {
    email: factory.chance('email', { domain: 'example.com' }),
    password: 'secret',
});

factory.build('User');

module.exports = factory;
