const { validationResult } = require('express-validator');

const User = require('../models/User');
const UserFactory = require('../factories/UserFactory');

module.exports = {
    index: async (req, res) => {
        const { page = 1, limit = 10 } = req.query;

        const options = {
            select: '_id email createdAt',
            sort: { createdAt: -1 },
            page,
            limit,
        };

        try {
            const users = await User.paginate({}, options);

            return res.status(200).json({
                total: users.totalDocs,
                limit: users.limit,
                page: users.page,
                pages: users.totalPages,
                data: users.docs.map(user => ({
                    _id: user._id,
                    email: user.email,
                    createdAt: user.createdAt,
                    request: {
                        url: `/users/${user._id}`,
                    },
                })),
            });
        } catch (error) {
            return res.status(500).json({
                error,
            });
        }
    },

    store: async (req, res) => {
        const { email } = req.body;

        const errors = validationResult(req);

        if (! errors.isEmpty()) {
            return res.status(422).json({
                errors: errors.array(),
            });
        }

        try {
            const userExists = await User.find({ email });

            if (userExists.length > 0) {
                return res.status(409).json({
                    message: 'Email already exists',
                });
            }

            const user = await User.create(req.body);

            return res.status(201).json({
                message: 'User created successfully',
                data: {
                    _id: user._id,
                    email: user.email,
                    request: {
                        url: `/users/${user._id}`,
                    },
                },
            });
        } catch (error) {
            return res.status(500).json({
                error,
            });
        }
    },

    show: async (req, res) => {
        try {
            const user = await User.findById(req.params.id).select('_id email createdAt');

            return res.status(200).json(user);
        } catch (error) {
            return res.status(500).json({
                error,
            });
        }
    },

    destroy: async (req, res) => {
        try {
            await User.deleteOne({ _id: req.params.id });

            return res.status(204).send();
        } catch (error) {
            return res.status(500).json({
                error,
            });
        }
    },

    seed: async (req, res) => {
        await UserFactory.createMany('User', 10);

        return res.status(200).json({
            message: 'User database seeded successfully',
        });
    },
};
