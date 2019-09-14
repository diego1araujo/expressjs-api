const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');

const utils = require('../utils');
const User = require('../models/User');

module.exports = {
    login: async (req, res) => {
        const { email, password } = req.body;

        const errors = validationResult(req);

        if (! errors.isEmpty()) {
            return res.status(422).json({
                errors: errors.array(),
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

                const token = await utils.generateToken({ data });

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
