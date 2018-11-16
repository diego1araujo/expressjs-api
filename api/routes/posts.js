const express = require('express');

const postsController = require('../controllers/posts');
const checkAuth = require('../middleware/check-auth');

const router = express.Router();

router.get('/', postsController.index);
router.post('/', checkAuth, postsController.store);
router.get('/seed', checkAuth, postsController.seed);
router.get('/:id', postsController.show);
router.patch('/:id', checkAuth, postsController.update);
router.delete('/:id', checkAuth, postsController.destroy);

module.exports = router;
