const request = require('supertest');
const mongoose = require('mongoose');

const app = require('../app');

const User = require('../api/models/User');
const UserFactory = require('../api/factories/PostFactory');

let userEmail;

beforeAll(async () => {
    // Clean all users documents
    await User.deleteMany({}).exec();

    // Dummy some fake data
    const fakeUsers = await UserFactory.createMany('User', 5);

    // Get random Email from a User
    userEmail = fakeUsers[1].email;
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
            email: userEmail,
            password: 'secret',
        };
        const response = await request(app).post('/api/auth/login').send(data);

        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe('You have successfully authenticated.');
        expect(response.body.token).toBeDefined();
    });
});
