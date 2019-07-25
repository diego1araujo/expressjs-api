const router = require('express').Router();

const usersController = require('../controllers/users');
const auth = require('../middleware/auth');

router.get('/', usersController.index); // Retrieve all users
router.post('/', usersController.store); // Create a new user
router.get('/seed', usersController.seed); // Seed users
router.get('/:id', auth, usersController.show); // Retrive a user by its ID
router.delete('/:id', auth, usersController.destroy); // Delete a user by its ID

module.exports = router;
