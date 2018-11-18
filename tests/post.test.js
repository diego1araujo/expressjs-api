const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const app = require('../app');

const Post = require('../api/models/post');
const User = require('../api/models/user');

const postsController = require('../api/controllers/posts');

beforeAll(async () => {
    // Clean all posts documents
    await Post.deleteMany({}).exec();

    // Dummy some fake data
    const fakePosts = await postsController.generateSeed();

    // Get random fake post and assign it to env var
    process.env.POST_ID = fakePosts[0]._id;

    // Generate a token
    const token = await jwt.sign({ id: 1 }, process.env.JWT_KEY, { expiresIn: '5h' });

    // Get the token and assign it to an env var
    process.env.AUTH = `Bearer ${token}`;
});

afterAll(async () => {
    await mongoose.disconnect();
});

describe('get /posts', () => {
    test('It should respond with an array containing all posts', async () => {
        try {
            const response = await request(app).get('/posts');
            expect(response.statusCode).toBe(200);
            expect(response.body.total).toEqual(5);
            expect(response.body.data).toBeDefined();
        } catch (e) {
            console.log(e);
        }
    });
});

describe('post /posts', () => {
    test('It should respond with an `Unauthorized` message', async () => {
        try {
            const response = await request(app).post('/posts');
            expect(response.statusCode).toBe(401);
            expect(response.body.message).toBe('Unauthorized');
        } catch (e) {
            console.log(e);
        }
    });

    test('It should throw an error due to no data was sent', async () => {
        const auth = process.env.AUTH;

        try {
            const response = await request(app).post('/posts').set('Authorization', auth);
            expect(response.statusCode).toBe(500);
            expect(response.body.error.errors).toBeDefined();
        } catch (e) {
            console.log(e);
        }
    });

    test('It should respond with a success message', async () => {
        const data = {
            title: 'Example 01',
            body: 'A body text example',
        };

        const auth = process.env.AUTH;

        try {
            const response = await request(app).post('/posts').set('Authorization', auth).send(data);
            expect(response.statusCode).toBe(201);
            expect(response.body.message).toBe('Post created successfully');
            expect(response.body.data.title).toBe(data.title);
            expect(response.body.data.body).toBe(data.body);
        } catch (e) {
            console.log(e);
        }
    });
});

describe('get /posts/:id', () => {
    test('It should throw an error due to provided ID is invalid', async () => {
        try {
            const response = await request(app).get('/posts/123456');
            expect(response.statusCode).toBe(500);
            expect(response.body.error.message).toBeDefined();
        } catch (e) {
            console.log(e);
        }
    });

    test('It should respond with a Post data', async () => {
        const id = process.env.POST_ID;

        try {
            const response = await request(app).get(`/posts/${id}`);
            expect(response.statusCode).toBe(200);
            expect(response.body.title).toBeDefined();
            expect(response.body.body).toBeDefined();
        } catch (e) {
            console.log(e);
        }
    });
});

describe('patch /posts/:id', () => {
    test('It should throw an error message: `Unauthorized`', async () => {
        try {
            const response = await request(app).patch('/posts/123456');
            expect(response.statusCode).toBe(401);
            expect(response.body.message).toBe('Unauthorized');
        } catch (e) {
            console.log(e);
        }
    });

    test('It should throw an error due to no data was sent', async () => {
        const id = process.env.POST_ID;
        const auth = process.env.AUTH;

        try {
            const response = await request(app).patch(`/posts/${id}`).set('Authorization', auth);
            expect(response.statusCode).toBe(500);
            expect(response.body.error).toBeDefined();
        } catch (e) {
            console.log(e);
        }
    });

    test('It should respond with a success message', async () => {
        const id = process.env.POST_ID;
        const auth = process.env.AUTH;

        const data = {
            title: 'Title 01',
        };

        try {
            const response = await request(app).patch(`/posts/${id}`).set('Authorization', auth).send(data);
            expect(response.statusCode).toBe(200);
            expect(response.body.message).toBe('Post updated successfully');
        } catch (e) {
            console.log(e);
        }
    });
});

describe('delete /posts/:id', () => {
    test('It should throw an error message: `Unauthorized`', async () => {
        try {
            const response = await request(app).delete('/posts/123456');
            expect(response.statusCode).toBe(401);
            expect(response.body.message).toBe('Unauthorized');
        } catch (e) {
            console.log(e);
        }
    });

    test('It should respond with 204 status `No Content`', async () => {
        const id = process.env.POST_ID;
        const auth = process.env.AUTH;

        try {
            const response = await request(app).delete('/posts/' + id).set('Authorization', auth);
            expect(response.statusCode).toBe(204);
        } catch (e) {
            console.log(e);
        }
    });
});
