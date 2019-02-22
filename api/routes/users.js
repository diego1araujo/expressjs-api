const router = require('express').Router();

const usersController = require('../controllers/users');
const auth = require('../middleware/auth');

router.get('/', usersController.index);
router.post('/', usersController.store);
router.get('/seed', auth, usersController.seed);
router.get('/:id', auth, usersController.show);
router.delete('/:id', auth, usersController.destroy);

module.exports = router;
