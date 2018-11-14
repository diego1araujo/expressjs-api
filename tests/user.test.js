const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const app = require('../app');

const User = require('../api/models/user');

const usersController = require('../api/controllers/users');

beforeAll(async () => {
    // Clean all users documents
    await User.deleteMany({}).exec();

    let data = {
        email: 'admin@email.com',
        password: 'secret',
    }

    // Create a new User
    const adminUser = new User(data);
    await adminUser.save();

    // Find the user data
    const findUser = await User.find({ email: data.email });

    if (findUser) {
        // Generate a token for created user
        const token = await jwt.sign({ userId: findUser[0]._id, email: findUser[0].email }, process.env.JWT_KEY, { expiresIn: '5h' });

        // Get the token and assign to env var
        process.env.AUTH = 'Bearer ' + token;
    }

    // Dummy some fake data
    let fakeUsers = await usersController.generateSeed();

    // Get some fake user ID and assign to env var
    process.env.USER_ID = fakeUsers[0]._id;

    // Get some fake user EMAIL and assign to env var
    process.env.USER_EMAIL = fakeUsers[1].email;
});

afterAll(async () => {
    await mongoose.disconnect();
});

// ======= GET /users

describe('get /users - List all Users', () => {
    test('It should respond with an array of object containing all users', async () => {
        try {
            const response = await request(app).get('/users');
            expect(response.statusCode).toBe(200);
            expect(response.body.count).toEqual(6);
            expect(response.body.data).toBeDefined();
        } catch (e) {
            console.log(e);
        }
    });
});

// ======= POST /users

describe('post /users - Create a new User with empty fields', () => {
    test('It should throw an error when no data was sent', async () => {
        try {
            const response = await request(app).post('/users');
            expect(response.statusCode).toBe(500);
            expect(response.body.error).toBeDefined();
        } catch (e) {
            console.log(e);
        }
    });
});

describe('post /users - Create a new User properly', () => {
    test('It should respond with a success message', async () => {
        let data = {
            email: 'user@email.com',
            password: '123456',
        }

        try {
            const response = await request(app).post('/users').send(data);
            expect(response.statusCode).toBe(201);
            expect(response.body.message).toBe('User created successfully');
        } catch (e) {
            console.log(e);
        }
    });
});

describe('post /users - Create a new User with a duplicate email', () => {
    test('It should throw an error with message `email already exists`', async () => {
        let data = {
            email: 'user@email.com',
            password: '123456',
        }

        try {
            const response = await request(app).post('/users').send(data);
            expect(response.statusCode).toBe(409);
            expect(response.body.message).toBe('Email already exists');
        } catch (e) {
            console.log(e);
        }
    });
});

// ======= GET /users/:id

describe('get /users/:id - Show a specific User without authorization', () => {
    test('It should respond with an `Unauthorized` message', async () => {
        try {
            const response = await request(app).get('/users/123456');
            expect(response.statusCode).toBe(401);
            expect(response.body.message).toBe('Unauthorized');
        } catch (e) {
            console.log(e);
        }
    });
});

describe('get /users/:id - Show a specific User with invalid id', () => {
    test('It should throw an error message that provided ID is invalid', async () => {
        let auth = process.env.AUTH;

        try {
            const response = await request(app).get('/users/123456').set('Authorization', auth);
            expect(response.statusCode).toBe(500);
            expect(response.body.error.message).toBeDefined();
        } catch (e) {
            console.log(e);
        }
    });
});

describe('get /users/:id - Show a specific User properly', () => {
    test('It should respond with a User data', async () => {
        let id = process.env.USER_ID;
        let auth = process.env.AUTH;

        try {
            const response = await request(app).get('/users/' + id).set('Authorization', auth);
            expect(response.statusCode).toBe(200);
            expect(response.body.email).toBeDefined();
        } catch (e) {
            console.log(e);
        }
    });
});

// ======= DELETE /users/:id

describe('delete /users/:id - Delete a User without authorization', () => {
    test('It should respond with an `Unauthorized` message', async () => {
        try {
            const response = await request(app).delete('/users/123456');
            expect(response.statusCode).toBe(401);
            expect(response.body.message).toBe('Unauthorized');
        } catch (e) {
            console.log(e);
        }
    });
});

describe('delete /users/:id - Delete a User properly', () => {
    test('It should respond with NO CONTENT status (204)', async () => {
        let id = process.env.USER_ID;
        let auth = process.env.AUTH;

        try {
            const response = await request(app).delete('/users/' + id).set('Authorization', auth);
            expect(response.statusCode).toBe(204);
        } catch (e) {
            console.log(e);
        }
    });
});

// ======= POST /auth/login

describe('post /auth/login - Auth User with empty fields', () => {
    test('It should throw an error when no data was sent', async () => {
        try {
            const response = await request(app).post('/auth/login');
            expect(response.statusCode).toBe(500);
            expect(response.body.error).toBeDefined();
        } catch (e) {
            console.log(e);
        }
    });
});

describe('post /auth/login - Auth User with wrong credentials', () => {
    test('It should throw an error when data wasn\'t match', async () => {
        let data = {
            email: 'random@email.com',
            password: '123456',
        }

        try {
            const response = await request(app).post('/auth/login').send(data);
            expect(response.statusCode).toBe(401);
            expect(response.body.message).toBe('Invalid Credentials');
        } catch (e) {
            console.log(e);
        }
    });
});

describe('post /auth/login - Auth User successful', () => {
    test('It should respond with a success message and its jwt token', async () => {
        let data = {
            email: process.env.USER_EMAIL,
            password: 'secret',
        }

        try {
            const response = await request(app).post('/auth/login').send(data);
            expect(response.statusCode).toBe(200);
            expect(response.body.message).toBe('Auth successful');
            expect(response.body.token).toBeDefined();
        } catch (e) {
            console.log(e);
        }
    });
});
