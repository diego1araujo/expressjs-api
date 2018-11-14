const mongoose = require('mongoose');
const faker = require('faker');

const User = require('../models/user');

const usersController = {
    index: async (req, res) => {
        try {
            const users = await User.find().select('_id email created_at');

            res.status(200).send({
                count: users.length,
                data: users.map(user => {
                    return {
                        _id: user._id,
                        email: user.email,
                        created_at: user.created_at,
                        request: {
                            url: '/users/' + user._id,
                        },
                    }
                }),
            });
        } catch (error) {
            res.status(500).send({
                error: error,
            });
        }
    },

    store: async (req, res) => {
        try {
            const user = await User.find({ email: req.body.email });

            if (user.length > 0) {
                return res.status(409).send({
                    message: 'Email already exists',
                });
            } else {
                const newUser = new User({
                    email: req.body.email,
                    password: req.body.password,
                });

                const saveUser = await newUser.save();

                res.status(201).send({
                    message: 'User created successfully',
                });
            }
        } catch (error) {
            res.status(500).send({
                error: error,
            });
        }
    },

    show: async (req, res) => {
        try {
            const user = await User.findById(req.params.id).select('_id email created_at');

            if (user) {
                res.status(200).json(user);
            } else {
                res.status(404).send({
                    message: 'No valid ID was found',
                });
            }
        } catch (error) {
            res.status(500).send({
                error: error,
            });
        }
    },

    destroy: async (req, res) => {
        try {
            const user = await User.deleteOne({ _id: req.params.id });

            res.status(204).send();
        } catch (error) {
            res.status(500).send({
                error: error,
            });
        }
    },

    generateSeed: async (req, res) => {
        let fakeUsers = [];

        // Dummy some fake data
        for (let i = 0; i < 5; i++) {
            const newUser = new User({
                email: faker.internet.email(),
                password: 'secret',
            });

            const saveUser = await newUser.save();

            fakeUsers.push(saveUser);
        }

        return fakeUsers;
    },

    seed: async (req, res) => {
        await this.generateSeed();

        res.status(200).send({
            message: 'User database seeded successfully',
        });
    },
}

module.exports = usersController;
