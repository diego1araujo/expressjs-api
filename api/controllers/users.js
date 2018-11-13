const mongoose = require('mongoose');

const User = require('../models/user');

const usersController = {
    index: (req, res) => {
        User.find()
            .select('_id email created_at')
            .exec()
            .then(results => {
                res.status(200).send({
                    count: results.length,
                    data: results.map(result => {
                        return {
                            _id: result._id,
                            email: result.email,
                            created_at: result.created_at,
                            request: {
                                url: '/users/' + result._id,
                            },
                        }
                    }),
                });
            });
    },

    store: (req, res) => {
        User.find({ email: req.body.email })
            .exec()
            .then(user => {
                if (user.length > 0) {
                    return res.status(409).send({
                        message: 'Email already exists',
                    });
                } else {
                    const user = new User({
                        email: req.body.email,
                        password: req.body.password,
                    });

                    user.save()
                        .then(result => {
                            res.status(201).send({
                                message: 'User created successfully',
                            });
                        }).catch(err => {
                            res.status(500).send({
                                error: err,
                            });
                        });
                }
            });
    },

    show: (req, res) => {
        User.findById(req.params.id)
            .select('_id email created_at')
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

    destroy: (req, res) => {
        User.deleteOne({ _id: req.params.id })
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
        const users = [
            { email: 'user01@email.com' },
            { email: 'user02@email.com' },
            { email: 'user03@email.com' },
            { email: 'user04@email.com' },
            { email: 'user05@email.com' },
        ];

        for (user of users) {
            var newUser = new User(user);
            newUser.password = 'secret';
            newUser.save();
        }

        res.status(200).send({
            message: 'User database seeded successfully',
        });
    },
}

module.exports = usersController;
