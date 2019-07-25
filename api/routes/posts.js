const router = require('express').Router();

const postsController = require('../controllers/posts');
const auth = require('../middleware/auth');

router.get('/', postsController.index); // Retrieve all posts
router.post('/', auth, postsController.store); // Create a new post
router.get('/seed', postsController.seed); // Seed posts
router.get('/:id', postsController.show); // Retrieve a post by its ID
router.patch('/:id', auth, postsController.update); // Update properties of a post by its ID
router.delete('/:id', auth, postsController.destroy); // Delete a post by its ID

module.exports = router;
