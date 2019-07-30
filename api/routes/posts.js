const router = require('express').Router();

const PostController = require('../controllers/PostController');
const auth = require('../middleware/auth');

router.get('/', PostController.index); // Retrieve all posts
router.post('/', auth, PostController.store); // Create a new post
router.get('/seed', PostController.seed); // Seed posts
router.get('/:id', PostController.show); // Retrieve a post by its ID
router.patch('/:id', auth, PostController.update); // Update properties of a post by its ID
router.delete('/:id', auth, PostController.destroy); // Delete a post by its ID

module.exports = router;
