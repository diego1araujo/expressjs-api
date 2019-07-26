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
        const response = await request(app).get('/api/users');

        expect(response.statusCode).toBe(200);
        expect(response.body.total).toEqual(10);
        expect(response.body.data).toBeDefined();
        expect(response.body.data[0]).toHaveProperty('_id');
        expect(response.body.data[0]).toHaveProperty('email');
    });
});

describe('post /users', () => {
    test('A user may not be created if fields are empty', async () => {
        const response = await request(app).post('/api/users');

        expect(response.statusCode).toBe(500);
        expect(response.body.errors).toBeDefined();
        expect(response.body.errors[0].msg).toBe('Email is required');
        expect(response.body.errors[2].msg).toBe('Password is required');
    });

    test('A user may not be created if email address is invalid', async () => {
        const data = {
            email: 'useremail.com',
            password: '123456',
            password_confirmation: '123456',
        };
        const response = await request(app).post('/api/users').send(data);

        expect(response.statusCode).toBe(500);
        expect(response.body.errors[0].msg).toBe('Email is invalid');
    });

    test('A user may not be created if password_confirmation field is empty', async () => {
        const data = {
            email: 'user@email.com',
            password: '123456',
        };
        const response = await request(app).post('/api/users').send(data);

        expect(response.statusCode).toBe(500);
        expect(response.body.errors[1].msg).toBe('Password Confirmation is required');
    });

    test('A user may not be created if passwords are not equals', async () => {
        const data = {
            email: 'user@email.com',
            password: '123456',
            password_confirmation: '123',
        };
        const response = await request(app).post('/api/users').send(data);

        expect(response.statusCode).toBe(500);
        expect(response.body.errors[0].msg).toBe('Passwords must match');
    });

    test('A user is successfully created when all data is correct', async () => {
        const data = {
            email: 'user@email.com',
            password: '123456',
            password_confirmation: '123456',
        };
        const response = await request(app).post('/api/users').send(data);

        expect(response.statusCode).toBe(201);
        expect(response.body.message).toBe('User created successfully');
    });

    test('A user may not be created if email already exists', async () => {
        const data = {
            email: 'user@email.com',
            password: '123456',
            password_confirmation: '123456',
        };
        const response = await request(app).post('/api/users').send(data);

        expect(response.statusCode).toBe(409);
        expect(response.body.message).toBe('Email already exists');
    });
});

describe('get /users/:id', () => {
    test('Unauthorized user may not see a user', async () => {
        const response = await request(app).get('/api/users/123456');

        expect(response.statusCode).toBe(401);
        expect(response.body.message).toBe('Unauthorized');
    });

    test('A user may not see a user if provided ID is invalid', async () => {
        const auth = process.env.AUTH;
        const response = await request(app).get('/api/users/123456').set('Authorization', auth);

        expect(response.statusCode).toBe(500);
        expect(response.body.error.message).toBeDefined();
    });

    test('A user can see a user', async () => {
        const id = process.env.USER_ID;
        const auth = process.env.AUTH;
        const response = await request(app).get(`/api/users/${id}`).set('Authorization', auth);

        expect(response.statusCode).toBe(200);
        expect(response.body.email).toBeDefined();
    });
});

describe('delete /users/:id', () => {
    test('Unauthorized user may not delete a user', async () => {
        const response = await request(app).delete('/api/users/123456');

        expect(response.statusCode).toBe(401);
        expect(response.body.message).toBe('Unauthorized');
    });

    test('A user can delete a user', async () => {
        const id = process.env.USER_ID;
        const auth = process.env.AUTH;
        const response = await request(app).delete(`/api/users/${id}`).set('Authorization', auth);

        expect(response.statusCode).toBe(204);
    });
});
