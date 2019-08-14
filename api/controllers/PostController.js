const Post = require('../models/Post');
const PostFactory = require('../factories/PostFactory');

module.exports = {
    index: async (req, res) => {
        const { page = 1, limit = 10 } = req.query;

        const options = {
            select: '_id title createdAt',
            sort: { createdAt: -1 },
            page,
            limit,
        };

        try {
            const posts = await Post.paginate({}, options);

            return res.status(200).json({
                total: posts.totalDocs,
                limit: posts.limit,
                page: posts.page,
                pages: posts.totalPages,
                data: posts.docs.map(post => ({
                    _id: post._id,
                    title: post.title,
                    createdAt: post.createdAt,
                    request: {
                        url: `/posts/${post._id}`,
                    },
                })),
            });
        } catch (error) {
            return res.status(500).json({
                error,
            });
        }
    },

    store: async (req, res) => {
        try {
            const post = await Post.create(req.body);

            return res.status(201).json({
                message: 'Post created successfully',
                data: {
                    _id: post._id,
                    title: post.title,
                    body: post.body,
                    createdAt: post.createdAt,
                    request: {
                        url: `/posts/${post._id}`,
                    },
                },
            });
        } catch (error) {
            return res.status(500).json({
                error,
            });
        }
    },

    show: async (req, res) => {
        try {
            const post = await Post.findById(req.params.id);

            return res.status(200).json(post);
        } catch (error) {
            return res.status(500).json({
                error,
            });
        }
    },

    update: async (req, res) => {
        const updateOps = {};

        Object.entries(req.body).forEach((key, value) => {
            updateOps[key] = value;
        });

        if (Object.keys(updateOps).length === 0) {
            return res.status(500).send({
                error: 'Fields cannot be empty',
            });
        }

        try {
            await Post.updateOne({ _id: req.params.id }, { $set: updateOps });

            return res.status(200).json({
                message: 'Post updated successfully',
                request: {
                    url: `/posts/${req.params.id}`,
                },
            });
        } catch (error) {
            return res.status(500).json({
                error,
            });
        }
    },

    destroy: async (req, res) => {
        try {
            await Post.deleteOne({ _id: req.params.id });

            return res.status(204).send();
        } catch (error) {
            return res.status(500).json({
                error,
            });
        }
    },

    seed: async (req, res) => {
        await PostFactory.createMany('Post', 10);

        return res.status(200).json({
            message: 'Post database seeded successfully',
        });
    },
};
