const { factory } = require('factory-girl');

const Post = require('../models/Post');

factory.define('Post', Post, {
    title: factory.chance('sentence'),
    body: factory.chance('paragraph'),
});

factory.build('Post');

module.exports = factory;
