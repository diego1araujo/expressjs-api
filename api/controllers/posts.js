const faker = require('faker');

const Post = require('../models/post');

const postsController = {
    index: async (req, res) => {
        try {
            const options = {
                select: '_id title created_at',
                sort: { created_at: -1 },
                page: parseInt(req.query.page ? req.query.page : 1, 10),
                limit: parseInt(req.query.limit ? req.query.limit : 15, 10),
            };

            const posts = await Post.paginate({}, options);

            res.status(200).send({
                total: posts.totalDocs,
                limit: posts.limit,
                page: posts.page,
                pages: posts.totalPages,
                data: posts.docs.map(post => {
                    return {
                        _id: post._id,
                        title: post.title,
                        created_at: post.created_at,
                        request: {
                            url: `/posts/${post._id}`,
                        },
                    };
                }),
            });
        } catch (error) {
            res.status(500).send({
                error,
            });
        }
    },

    store: async (req, res) => {
        const newPost = new Post({
            title: req.body.title,
            body: req.body.body,
        });

        try {
            const post = await newPost.save();

            res.status(201).send({
                message: 'Post created successfully',
                data: {
                    _id: post._id,
                    title: post.title,
                    body: post.body,
                    created_at: post.created_at,
                    request: {
                        url: `/posts/${post._id}`,
                    },
                },
            });
        } catch (error) {
            res.status(500).json({
                error,
            });
        }
    },

    show: async (req, res) => {
        try {
            const post = await Post.findById(req.params.id);

            if (!post) {
                return res.status(404).send({
                    message: 'No valid ID was found',
                });
            }

            res.status(200).json(post);
        } catch (error) {
            res.status(500).send({
                error,
            });
        }
    },

    update: async (req, res) => {
        const updateOps = {};

        for (const [key, value] of Object.entries(req.body)) {
            updateOps[key] = value;
        }

        if (Object.keys(updateOps).length === 0) {
            return res.status(500).send({
                error: 'Fields cannot be empty',
            });
        }

        try {
            await Post.updateOne({ _id: req.params.id }, { $set: updateOps });

            res.status(200).send({
                message: 'Post updated successfully',
                request: {
                    url: `/posts/${req.params.id}`,
                },
            });
        } catch (error) {
            res.status(500).send({
                error,
            });
        }
    },

    destroy: async (req, res) => {
        try {
            await Post.deleteOne({ _id: req.params.id });

            res.status(204).send();
        } catch (error) {
            res.status(500).send({
                error,
            });
        }
    },

    generateSeed: async () => {
        const fakePosts = [];

        // Dummy some fake data
        for (let i = 0; i < 5; i += 1) {
            const newPost = new Post({
                title: faker.lorem.sentence(),
                body: faker.lorem.sentences(),
            });

            const savePost = await newPost.save();

            fakePosts.push(savePost);
        }

        return fakePosts;
    },

    seed: async (req, res) => {
        await postsController.generateSeed();

        res.status(200).send({
            message: 'Post database seeded successfully',
        });
    },
};

module.exports = postsController;
