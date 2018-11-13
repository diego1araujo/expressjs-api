const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/user');

const authController = {
    login: (req, res) => {
        if (req.body.email === undefined || req.body.email == ''
            || req.body.password === undefined || req.body.password == '') {
            return res.status(500).send({
                error: {
                    message: 'Empty fields',
                },
            });
        }

        User.find({ email: req.body.email })
            .exec()
            .then(user => {
                if (user.length < 1) {
                    return res.status(401).send({
                        message: 'Invalid Credentials',
                    });
                } else {
                    bcrypt.compare(req.body.password, user[0].password, (err, result) => {
                        if (result) {
                            const payload = {
                                userId: user[0]._id,
                                email: user[0].email,
                            };

                            const expires = {
                                expiresIn: '5h',
                            };

                            const token = jwt.sign(payload, process.env.JWT_KEY, expires);

                            return res.status(200).send({
                                message: 'Auth successful',
                                token: token,
                            });
                        } else {
                            return res.status(401).send({
                                message: 'Invalid Credentials',
                            });
                        }
                    });
                }
            }).catch(err => {
                res.status(500).send({
                    error: err,
                });
            });
    },
}

module.exports = authController;
