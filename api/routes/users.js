const router = require('express').Router();

const UserController = require('../controllers/UserController');
const userValidate = require('../validate/user.validate');
const auth = require('../middleware/auth');

router.get('/', UserController.index); // Retrieve all users
router.post('/', userValidate.validate('store'), UserController.store); // Create a new user
router.get('/seed', UserController.seed); // Seed users
router.get('/:id', auth, UserController.show); // Retrive a user by its ID
router.delete('/:id', auth, UserController.destroy); // Delete a user by its ID

module.exports = router;
