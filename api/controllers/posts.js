const mongoose = require('mongoose');

const Post = require('../models/post');

const postsController = {
    index: (req, res) => {
        Post.find()
            .select('_id title created_at')
            .exec()
            .then(results => {
                res.status(200).send({
                    count: results.length,
                    data: results.map(result => {
                        return {
                            _id: result._id,
                            title: result.title,
                            created_at: result.created_at,
                            request: {
                                url: '/posts/' + result._id,
                            },
                        }
                    }),
                });
            }).catch(err => {
                res.status(500).send({
                    error: err,
                });
            });
    },

    store: (req, res) => {
        const post = new Post({
            title: req.body.title,
            body: req.body.body,
        });

        post.save()
            .then(result => {
                res.status(201).send({
                    message: 'Post created successfully',
                    data: {
                        _id: result._id,
                        title: result.title,
                        body: result.body,
                        created_at: result.created_at,
                        request: {
                            url: '/posts/' + result._id,
                        },
                    },
                });
            }).catch(err => {
                res.status(500).json({
                    error: err,
                });
            });
    },

    show: (req, res) => {
        Post.findById(req.params.id)
            .exec()
            .then(result => {
                if (result) {
                    res.status(200).json(result);
                } else {
                    res.status(404).send({
                        message: 'No valid ID was found',
                    });
                }
            }).catch(err => {
                res.status(500).send({
                    error: err,
                });
            });
    },

    update: (req, res) => {
        const updateOps = {};

        for (const [key, value] of Object.entries(req.body)) {
            updateOps[key] = value;
        }

        if (Object.keys(updateOps).length === 0) {
            return res.status(500).send({
                error: 'Empty fields',
            });
        }

        Post.updateOne(
            { _id: req.params.id },
            { $set: updateOps },
        ).exec()
        .then(result => {
            res.status(200).send({
                message: 'Post updated successfully',
                request: {
                    url: '/posts/' + req.params.id,
                },
            });
        }).catch(err => {
            res.status(500).send({
                error: err,
            });
        });
    },

    destroy: (req, res) => {
        Post.deleteOne({ _id: req.params.id })
            .exec()
            .then(result => {
                res.status(204).send();
            }).catch(err => {
                res.status(500).send({
                    error: err,
                });
            });
    },

    seed: (req, res) => {
        const posts = [
            { title: 'Lorem ipsum 01', body: 'Lorem ipsum dolor sit amet 01', },
            { title: 'Lorem ipsum 02', body: 'Lorem ipsum dolor sit amet 02', },
            { title: 'Lorem ipsum 03', body: 'Lorem ipsum dolor sit amet 03', },
            { title: 'Lorem ipsum 04', body: 'Lorem ipsum dolor sit amet 04', },
            { title: 'Lorem ipsum 05', body: 'Lorem ipsum dolor sit amet 05', },
        ];

        for (post of posts) {
            var newPost = new Post(post);
            newPost.save();
        }

        res.status(200).send({
            message: 'Post database seeded successfully',
        });
    },
}

module.exports = postsController;
