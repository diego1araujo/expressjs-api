const router = require('express').Router();

const AuthController = require('../controllers/AuthController');
const authValidate = require('../validate/auth.validate');

router.post('/login', authValidate.validate(), AuthController.login);

module.exports = router;
