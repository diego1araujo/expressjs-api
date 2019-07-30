const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/User');

module.exports = {
    login: async (req, res) => {
        const { email, password } = req.body;

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
            return res.status(500).json({
                errors,
            });
        }

        try {
            const user = await User.find({ email });

            if (user.length < 1) {
                return res.status(401).json({
                    message: 'Invalid Credentials',
                });
            }

            const hash = await bcrypt.compareSync(password, user[0].password);

            if (hash) {
                const data = {
                    id: user[0]._id,
                    email: user[0].email,
                };

                const token = await jwt.sign({ data }, process.env.JWT_KEY, { expiresIn: '5h' });

                return res.status(200).json({
                    message: 'You have successfully authenticated.',
                    token,
                });
            }

            return res.status(401).json({
                message: 'Invalid Credentials',
            });
        } catch (error) {
            return res.status(500).json({
                error,
            });
        }
    },
};
