const express = require('express');
const router = express.Router();

const usersController = require('../controllers/users');
const checkAuth = require('../middleware/check-auth');

router.get('/', usersController.index);
router.post('/', checkAuth, usersController.store);
router.get('/seed', usersController.seed);
router.get('/:id', checkAuth, usersController.show);
router.delete('/:id', checkAuth, usersController.destroy);

module.exports = router;
