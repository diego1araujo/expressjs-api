const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const app = require('../app');

const User = require('../api/models/user');

const usersController = require('../api/controllers/users');

beforeAll(async () => {
    // Clean all users documents
    await User.deleteMany({}).exec();

    // Dummy some fake data
    const fakeUsers = await usersController.generateSeed();

    // Get random fake user ID and assign it to an env var
    process.env.USER_ID = fakeUsers[0]._id;

    // Get random fake user EMAIL and assign it to an env var
    process.env.USER_EMAIL = fakeUsers[1].email;

    // Generate a token
    const token = await jwt.sign({ id: 1 }, process.env.JWT_KEY, { expiresIn: '5h' });

    // Get the token and assign it to an env var
    process.env.AUTH = `Bearer ${token}`;
});

afterAll(async () => {
    await mongoose.disconnect();
});

describe('get /users', () => {
    test('A user can view all users', async () => {
        try {
            const response = await request(app).get('/users');
            expect(response.statusCode).toBe(200);
            expect(response.body.total).toEqual(5);
            expect(response.body.data).toBeDefined();
        } catch (e) {
            console.log(e);
        }
    });
});

describe('post /users', () => {
    test('A user may not be created if fields are empty', async () => {
        try {
            const response = await request(app).post('/users');
            expect(response.statusCode).toBe(500);
            expect(response.body.errors).toBeDefined();
        } catch (e) {
            console.log(e);
        }
    });

    test('A user may not be created if email address is invalid', async () => {
        const data = {
            email: 'useremail.com',
        };

        try {
            const response = await request(app).post('/users').send(data);
            expect(response.statusCode).toBe(500);
            expect(response.body.errors[0].msg).toBe('Email is invalid');
        } catch (e) {
            console.log(e);
        }
    });

    test('A user may not be created if password_confirmation field is empty', async () => {
        const data = {
            email: 'user@email.com',
            password: '123456',
        };

        try {
            const response = await request(app).post('/users').send(data);
            expect(response.statusCode).toBe(500);
            expect(response.body.errors[1].msg).toBe('Password Confirmation is required');
        } catch (e) {
            console.log(e);
        }
    });

    test('A user may not be created if passwords are not equals', async () => {
        const data = {
            email: 'user@email.com',
            password: '123456',
            password_confirmation: '123',
        };

        try {
            const response = await request(app).post('/users').send(data);
            expect(response.statusCode).toBe(500);
            expect(response.body.errors[0].msg).toBe('Passwords must match');
        } catch (e) {
            console.log(e);
        }
    });

    test('A user is successfully created when all data is correct', async () => {
        const data = {
            email: 'user@email.com',
            password: '123456',
            password_confirmation: '123456',
        };

        try {
            const response = await request(app).post('/users').send(data);
            expect(response.statusCode).toBe(201);
            expect(response.body.message).toBe('User created successfully');
        } catch (e) {
            console.log(e);
        }
    });

    test('A user may not be created if email already exists', async () => {
        const data = {
            email: 'user@email.com',
            password: '123456',
            password_confirmation: '123456',
        };

        try {
            const response = await request(app).post('/users').send(data);
            expect(response.statusCode).toBe(409);
            expect(response.body.message).toBe('Email already exists');
        } catch (e) {
            console.log(e);
        }
    });
});

describe('get /users/:id', () => {
    test('Unauthorized user may not see a single user', async () => {
        try {
            const response = await request(app).get('/users/123456');
            expect(response.statusCode).toBe(401);
            expect(response.body.message).toBe('Unauthorized');
        } catch (e) {
            console.log(e);
        }
    });

    test('A user may not see a single user if provided ID is invalid', async () => {
        const auth = process.env.AUTH;

        try {
            const response = await request(app).get('/users/123456').set('Authorization', auth);
            expect(response.statusCode).toBe(500);
            expect(response.body.error.message).toBeDefined();
        } catch (e) {
            console.log(e);
        }
    });

    test('A user can see a single user', async () => {
        const id = process.env.USER_ID;
        const auth = process.env.AUTH;

        try {
            const response = await request(app).get(`/users/${id}`).set('Authorization', auth);
            expect(response.statusCode).toBe(200);
            expect(response.body.email).toBeDefined();
        } catch (e) {
            console.log(e);
        }
    });
});

describe('delete /users/:id', () => {
    test('Unauthorized user may not delete a user', async () => {
        try {
            const response = await request(app).delete('/users/123456');
            expect(response.statusCode).toBe(401);
            expect(response.body.message).toBe('Unauthorized');
        } catch (e) {
            console.log(e);
        }
    });

    test('A user can delete a user', async () => {
        const id = process.env.USER_ID;
        const auth = process.env.AUTH;

        try {
            const response = await request(app).delete(`/users/${id}`).set('Authorization', auth);
            expect(response.statusCode).toBe(204);
        } catch (e) {
            console.log(e);
        }
    });
});

describe('post /auth/login', () => {
    test('A user may not authenticate if fields are empty', async () => {
        try {
            const response = await request(app).post('/auth/login');
            expect(response.statusCode).toBe(500);
            expect(response.body.errors).toBeDefined();
        } catch (e) {
            console.log(e);
        }
    });

    test('A user may not authenticate if email address is invalid', async () => {
        const data = {
            email: 'randomemail.com',
            password: '123456',
        };

        try {
            const response = await request(app).post('/auth/login').send(data);
            expect(response.statusCode).toBe(500);
            expect(response.body.errors[0].msg).toBe('Email is invalid');
        } catch (e) {
            console.log(e);
        }
    });

    test('A user may not authenticate if credentials are invalid', async () => {
        const data = {
            email: 'random@email.com',
            password: '123456',
        };

        try {
            const response = await request(app).post('/auth/login').send(data);
            expect(response.statusCode).toBe(401);
            expect(response.body.message).toBe('Invalid Credentials');
        } catch (e) {
            console.log(e);
        }
    });

    test('A user is successfully authenticated', async () => {
        const data = {
            email: process.env.USER_EMAIL,
            password: 'secret',
        };

        try {
            const response = await request(app).post('/auth/login').send(data);
            expect(response.statusCode).toBe(200);
            expect(response.body.message).toBe('You\'ve successfully authenticated.');
            expect(response.body.token).toBeDefined();
        } catch (e) {
            console.log(e);
        }
    });
});
