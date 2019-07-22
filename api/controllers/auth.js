const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/user');

const authController = {
    login: async (req, res) => {
        const email = req.body.email;
        const password = req.body.password;

        req.checkBody('email')
            .notEmpty()
            .withMessage('Email is required')
            .isEmail()
            .withMessage('Email is invalid');

        req.checkBody('password')
            .notEmpty()
            .withMessage('Password is required');

        const errors = req.validationErrors();

        if (errors) {
            return res.status(500).send({
                errors,
            });
        }

        try {
            const user = await User.find({ email: req.body.email });

            if (user.length < 1) {
                return res.status(401).send({
                    message: 'Invalid Credentials',
                });
            }

            const hash = await bcrypt.compareSync(req.body.password, user[0].password);

            if (hash) {
                const data = {
                    id: user[0]._id,
                    email: user[0].email,
                };

                const token = await jwt.sign({ data }, process.env.JWT_KEY, { expiresIn: '5h' });

                return res.status(200).send({
                    message: 'You have successfully authenticated.',
                    token,
                });
            }

            return res.status(401).send({
                message: 'Invalid Credentials',
            });
        } catch (error) {
            res.status(500).send({
                error,
            });
        }
    },
};

module.exports = authController;
