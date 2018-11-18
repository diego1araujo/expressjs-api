const express = require('express');

const postsController = require('../controllers/posts');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/', postsController.index);
router.post('/', auth, postsController.store);
router.get('/seed', auth, postsController.seed);
router.get('/:id', postsController.show);
router.patch('/:id', auth, postsController.update);
router.delete('/:id', auth, postsController.destroy);

module.exports = router;
