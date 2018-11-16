const faker = require('faker');

const User = require('../models/user');

const usersController = {
    index: async (req, res) => {
        try {
            const options = {
                select: '_id email created_at',
                sort: { created_at: -1 },
                page: parseInt(req.query.page ? req.query.page : 1),
                limit: parseInt(req.query.limit ? req.query.limit : 15),
            };

            const users = await User.paginate({}, options);

            res.status(200).send({
                total: users.total,
                limit: users.limit,
                page: users.page,
                pages: users.pages,
                data: users.docs.map((user) => {
                    return {
                        _id: user._id,
                        email: user.email,
                        created_at: user.created_at,
                        request: {
                            url: `/users/${user._id}`,
                        },
                    };
                }),
            });
        } catch (error) {
            res.status(500).send({
                error,
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
            }

            const newUser = new User({
                email: req.body.email,
                password: req.body.password,
            });

            await newUser.save();

            res.status(201).send({
                message: 'User created successfully',
            });
        } catch (error) {
            res.status(500).send({
                error,
            });
        }
    },

    show: async (req, res) => {
        try {
            const user = await User.findById(req.params.id).select('_id email created_at');

            if (!user) {
                return res.status(404).send({
                    message: 'No valid ID was found',
                });
            }

            res.status(200).json(user);
        } catch (error) {
            res.status(500).send({
                error,
            });
        }
    },

    destroy: async (req, res) => {
        try {
            await User.deleteOne({ _id: req.params.id });

            res.status(204).send();
        } catch (error) {
            res.status(500).send({
                error,
            });
        }
    },

    generateSeed: async (req, res) => {
        const fakeUsers = [];

        // Dummy some fake data
        for (let i = 0; i < 5; i++) {
            const newUser = new User({
                email: faker.internet.email().toLowerCase(),
                password: 'secret',
            });

            const saveUser = await newUser.save();

            fakeUsers.push(saveUser);
        }

        return fakeUsers;
    },

    seed: async (req, res) => {
        await usersController.generateSeed();

        res.status(200).send({
            message: 'User database seeded successfully',
        });
    },
};

module.exports = usersController;
