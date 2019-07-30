const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const app = require('../app');

const User = require('../api/models/User');

const UserController = require('../api/controllers/UserController');

beforeAll(async () => {
    // Clean all users documents
    await User.deleteMany({}).exec();

    // Dummy some fake data
    const fakeUsers = await UserController.generateSeed();

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

describe('post /auth/login', () => {
    test('A user may not authenticate if fields are empty', async () => {
        const response = await request(app).post('/api/auth/login');

        expect(response.statusCode).toBe(500);
        expect(response.body.errors).toBeDefined();
        expect(response.body.errors[0].msg).toBe('Email is required');
        expect(response.body.errors[2].msg).toBe('Password is required');
    });

    test('A user may not authenticate if email address is invalid', async () => {
        const data = {
            email: 'randomemail.com',
            password: '123456',
        };
        const response = await request(app).post('/api/auth/login').send(data);

        expect(response.statusCode).toBe(500);
        expect(response.body.errors[0].msg).toBe('Email is invalid');
    });

    test('A user may not authenticate if credentials are invalid', async () => {
        const data = {
            email: 'random@email.com',
            password: '123456',
        };
        const response = await request(app).post('/api/auth/login').send(data);

        expect(response.statusCode).toBe(401);
        expect(response.body.message).toBe('Invalid Credentials');
    });

    test('A user is successfully authenticated', async () => {
        const data = {
            email: process.env.USER_EMAIL,
            password: 'secret',
        };
        const response = await request(app).post('/api/auth/login').send(data);

        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe('You have successfully authenticated.');
        expect(response.body.token).toBeDefined();
    });
});
