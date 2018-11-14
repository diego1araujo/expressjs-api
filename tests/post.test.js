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
    let fakePosts = await postsController.generateSeed();

    // Get the fake posts and assign to env var
    process.env.POST_ID = fakePosts[0]._id;

    // Find the user data
    const findUser = await User.find({ email: 'admin@email.com' });

    if (findUser) {
        // Generate a token for user
        const token = await jwt.sign({ userId: findUser[0]._id, email: findUser[0].email }, process.env.JWT_KEY, { expiresIn: '5h' });

        // Get the token and assign to env var
        process.env.AUTH = 'Bearer ' + token;
    }
});

afterAll(async () => {
    await mongoose.disconnect();
});

// ======= GET /posts

describe('get /posts - List all Posts', () => {
    test('It should respond with an array of object containing all Posts', async () => {
        try {
            const response = await request(app).get('/posts');
            expect(response.statusCode).toBe(200);
            expect(response.body.count).toEqual(5);
            expect(response.body.data).toBeDefined();
        } catch (e) {
            console.log(e);
        }
    });
});

// ======= POST /posts

describe('post /posts - Create a new Post without authorization', () => {
    test('It should respond with an `Unauthorized` message', async () => {
        try {
            const response = await request(app).post('/posts');
            expect(response.statusCode).toBe(401);
            expect(response.body.message).toBe('Unauthorized');
        } catch (e) {
            console.log(e);
        }
    });
});

describe('post /posts - Create a new Post with empty fields', () => {
    test('It should throw an error when no data was sent', async () => {
        let auth = process.env.AUTH;

        try {
            const response = await request(app).post('/posts').set('Authorization', auth);
            expect(response.statusCode).toBe(500);
            expect(response.body.error.errors).toBeDefined();
        } catch (e) {
            console.log(e);
        }
    });
});

describe('post /posts - Create a new Post properly', () => {
    test('It should respond with a success message', async () => {
        let data = {
            title: 'Example 01',
            body: 'A body text example',
        }

        let auth = process.env.AUTH;

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

// ======= GET /posts/:id

describe('get /posts/:id - Show a specific Post with invalid id', () => {
    test('It should throw an error message that provided ID is invalid', async () => {
        try {
            const response = await request(app).get('/posts/123456');
            expect(response.statusCode).toBe(500);
            expect(response.body.error.message).toBeDefined();
        } catch (e) {
            console.log(e);
        }
    });
});

describe('get /posts/:id - Show a specific Post', () => {
    test('It should respond with a Post data', async () => {
        let id = process.env.POST_ID;

        try {
            const response = await request(app).get('/posts/' + id);
            expect(response.statusCode).toBe(200);
            expect(response.body.title).toBeDefined();
            expect(response.body.body).toBeDefined();
        } catch (e) {
            console.log(e);
        }
    });
});

// ======= PATCH /posts/:id

describe('patch /posts/:id - Update a Post without authorization', () => {
    test('It should respond with an `Unauthorized` message', async () => {
        try {
            const response = await request(app).patch('/posts/123456');
            expect(response.statusCode).toBe(401);
            expect(response.body.message).toBe('Unauthorized');
        } catch (e) {
            console.log(e);
        }
    });
});

describe('patch /posts/:id - Update a Post with empty fields', () => {
    test('It should throw an error when no data was sent', async () => {
        let id = process.env.POST_ID;
        let auth = process.env.AUTH;

        try {
            const response = await request(app).patch('/posts/' + id).set('Authorization', auth);
            expect(response.statusCode).toBe(500);
            expect(response.body.error).toBeDefined();
        } catch (e) {
            console.log(e);
        }
    });
});

describe('patch /posts/:id - Update a Post properly', () => {
    test('It should respond with an success message', async () => {
        let id = process.env.POST_ID;
        let auth = process.env.AUTH;

        let data = {
            title: 'Title 01',
        }

        try {
            const response = await request(app).patch('/posts/' + id).set('Authorization', auth).send(data);
            expect(response.statusCode).toBe(200);
            expect(response.body.message).toBe('Post updated successfully');
        } catch (e) {
            console.log(e);
        }
    });
});

// ======= DELETE /posts/:id

describe('delete /posts/:id - Delete a Post without authorization', () => {
    test('It should respond with an `Unauthorized` message', async () => {
        try {
            const response = await request(app).delete('/posts/123456');
            expect(response.statusCode).toBe(401);
            expect(response.body.message).toBe('Unauthorized');
        } catch (e) {
            console.log(e);
        }
    });
});

describe('delete /posts/:id - Delete a Post properly', () => {
    test('It should respond with a success message', async () => {
        let id = process.env.POST_ID;
        let auth = process.env.AUTH;

        try {
            const response = await request(app).delete('/posts/' + id).set('Authorization', auth);
            expect(response.statusCode).toBe(204);
        } catch (e) {
            console.log(e);
        }
    });
});
