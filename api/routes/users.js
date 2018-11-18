const express = require('express');

const usersController = require('../controllers/users');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/', usersController.index);
router.post('/', usersController.store);
router.get('/seed', auth, usersController.seed);
router.get('/:id', auth, usersController.show);
router.delete('/:id', auth, usersController.destroy);

module.exports = router;
