const { check } = require('express-validator');

exports.validate = (method, req) => {
    switch (method) {
        case 'store': {
            return [
                check('email')
                    .exists()
                    .withMessage('Email is required')
                    .not().isEmpty()
                    .withMessage('Email is empty')
                    .isEmail()
                    .withMessage('Email is invalid')
                    .trim(),

                check('password')
                    .exists()
                    .withMessage('Password is required')
                    .not().isEmpty()
                    .withMessage('Password is empty')
                    .isLength({ min: 5 })
                    .withMessage('Password requires at least 5 characters')
                    .trim(),

                check('password_confirmation')
                .exists()
                .withMessage('Password Confirmation is required')
                .not().isEmpty()
                .withMessage('Password Confirmation is empty')
                .trim()
                .custom((value, { req }) => {
                    if (value !== req.body.password) {
                        throw new Error('Passwords must match');
                    }

                    return true;
                }),
            ];
        }
    }
}
