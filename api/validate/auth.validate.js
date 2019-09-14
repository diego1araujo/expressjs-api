const { check } = require('express-validator');

exports.validate = () => {
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
    ];
}
