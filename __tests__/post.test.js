const request = require('supertest');
const mongoose = require('mongoose');

const app = require('../app');
const utils = require('../api/utils');

const Post = require('../api/models/Post');
const PostFactory = require('../api/factories/PostFactory');

let postID;
let auth;

beforeAll(async () => {
    // Clean all posts documents
    await Post.deleteMany({}).exec();

    // Dummy some fake data
    const fakePosts = await PostFactory.createMany('Post', 5);

    // Get random ID from a Post
    postID = fakePosts[0]._id;

    // Generate a token
    const token = await utils.generateToken({ id: 1 });

    // Get the token
    auth = `Bearer ${token}`;
});

afterAll(async () => {
    await mongoose.disconnect();
});

describe('GET /posts', () => {
    test('A user can view all posts', async () => {
        const response = await request(app).get('/api/posts');

        expect(response.statusCode).toBe(200);
        expect(response.body.total).toEqual(5);
        expect(response.body.data).toBeDefined();
        expect(response.body.data).toHaveLength(5);
        expect(response.body.data[0]).toHaveProperty('_id');
        expect(response.body.data[0]).toHaveProperty('title');
    });
});

describe('POST /posts', () => {
    test('Unauthorized user may not create a post', async () => {
        const response = await request(app).post('/api/posts');

        expect(response.statusCode).toBe(401);
        expect(response.body.message).toBe('Unauthorized');
    });

    test('A post may not be created if fields are empty', async () => {
        const response = await request(app).post('/api/posts').set('Authorization', auth);

        expect(response.statusCode).toBe(500);
        expect(response.body.error.errors).toBeDefined();
    });

    test('A post is successfully created when all data is correct', async () => {
        const data = {
            title: 'Example 01',
            body: 'A body text example',
        };

        const response = await request(app).post('/api/posts').set('Authorization', auth).send(data);

        expect(response.statusCode).toBe(201);
        expect(response.body.message).toBe('Post created successfully');
        expect(response.body.data.title).toBe(data.title);
        expect(response.body.data.body).toBe(data.body);
    });
});

describe('GET /posts/:id', () => {
    test('A user may not see a post if provided ID is invalid', async () => {
        const response = await request(app).get('/api/posts/123456');

        expect(response.statusCode).toBe(500);
        expect(response.body.error.message).toBeDefined();
    });

    test('A user can see a post', async () => {
        const response = await request(app).get(`/api/posts/${postID}`);

        expect(response.statusCode).toBe(200);
        expect(response.body.title).toBeDefined();
        expect(response.body.body).toBeDefined();
    });
});

describe('PATCH /posts/:id', () => {
    test('Unauthorized user may not update a post', async () => {
        const response = await request(app).patch('/api/posts/123456');

        expect(response.statusCode).toBe(401);
        expect(response.body.message).toBe('Unauthorized');
    });

    test('A post may not be updated if fields are empty', async () => {
        const response = await request(app).patch(`/api/posts/${postID}`).set('Authorization', auth);

        expect(response.statusCode).toBe(500);
        expect(response.body.error).toBeDefined();
    });

    test('A post is successfully updated when all data is correct', async () => {
        const data = {
            title: 'Title 01',
        };

        const response = await request(app).patch(`/api/posts/${postID}`).set('Authorization', auth).send(data);

        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe('Post updated successfully');
    });
});

describe('DELETE /posts/:id', () => {
    test('Unauthorized user may not delete a post', async () => {
        const response = await request(app).delete('/api/posts/123456');

        expect(response.statusCode).toBe(401);
        expect(response.body.message).toBe('Unauthorized');
    });

    test('A user can delete a post', async () => {
        const response = await request(app).delete(`/api/posts/${postID}`).set('Authorization', auth);

        expect(response.statusCode).toBe(204);
    });
});
