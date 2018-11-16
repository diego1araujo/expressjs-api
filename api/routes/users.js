const express = require('express');

const usersController = require('../controllers/users');
const checkAuth = require('../middleware/check-auth');

const router = express.Router();

router.get('/', usersController.index);
router.post('/', usersController.store);
router.get('/seed', checkAuth, usersController.seed);
router.get('/:id', checkAuth, usersController.show);
router.delete('/:id', checkAuth, usersController.destroy);

module.exports = router;
