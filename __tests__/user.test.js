const request = require('supertest');
const mongoose = require('mongoose');

const app = require('../app');
const utils = require('../api/utils');

const User = require('../api/models/User');
const UserFactory = require('../api/factories/UserFactory');

let userID;
let auth;

beforeAll(async () => {
    // Clean all users documents
    await User.deleteMany({}).exec();

    // Dummy some fake data
    const fakeUsers = await UserFactory.createMany('User', 5);

    // Get random ID from a User
    userID = fakeUsers[0]._id;

    // Generate a token
    const token = await utils.generateToken({ id: 1 });

    // Get the token
    auth = `Bearer ${token}`;
});

afterAll(async () => {
    await mongoose.disconnect();
});

describe('GET /users', () => {
    test('A user can view all users', async () => {
        const response = await request(app).get('/api/users');

        expect(response.statusCode).toBe(200);
        expect(response.body.total).toEqual(10);
        expect(response.body.data).toBeDefined();
        expect(response.body.data).toHaveLength(10);
        expect(response.body.data[0]).toHaveProperty('_id');
        expect(response.body.data[0]).toHaveProperty('email');
    });
});

describe('POST /users', () => {
    test('A user may not be created if fields are undefined', async () => {
        const response = await request(app).post('/api/users');

        expect(response.statusCode).toBe(422);
        expect(response.body.errors).toBeDefined();
        expect(response.body.errors[0].msg).toBe('Email is required');
        expect(response.body.errors[3].msg).toBe('Password is required');
    });

    test('A user may not be created if fields are empty', async () => {
        const data = {
            email: '',
            password: '',
        };

        const response = await request(app).post('/api/users').send(data);

        expect(response.statusCode).toBe(422);
        expect(response.body.errors).toBeDefined();
        expect(response.body.errors[0].msg).toBe('Email is empty');
        expect(response.body.errors[2].msg).toBe('Password is empty');
    });

    test('A user may not be created if email address is invalid', async () => {
        const data = {
            email: 'useremail.com',
            password: '123456',
            password_confirmation: '123456',
        };

        const response = await request(app).post('/api/users').send(data);

        expect(response.statusCode).toBe(422);
        expect(response.body.errors[0].msg).toBe('Email is invalid');
    });

    test('A user may not be created if password_confirmation field is empty', async () => {
        const data = {
            email: 'user@email.com',
            password: '123456',
        };

        const response = await request(app).post('/api/users').send(data);

        expect(response.statusCode).toBe(422);
        expect(response.body.errors[0].msg).toBe('Password Confirmation is required');
    });

    test('A user may not be created if passwords are not equals', async () => {
        const data = {
            email: 'user@email.com',
            password: '123456',
            password_confirmation: '123',
        };

        const response = await request(app).post('/api/users').send(data);

        expect(response.statusCode).toBe(422);
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

describe('GET /users/:id', () => {
    test('Unauthorized user may not see a user', async () => {
        const response = await request(app).get('/api/users/123456');

        expect(response.statusCode).toBe(401);
        expect(response.body.message).toBe('Unauthorized');
    });

    test('A user may not see a user if provided ID is invalid', async () => {
        const response = await request(app).get('/api/users/123456').set('Authorization', auth);

        expect(response.statusCode).toBe(500);
        expect(response.body.error.message).toBeDefined();
    });

    test('A user can see a user', async () => {
        const response = await request(app).get(`/api/users/${userID}`).set('Authorization', auth);

        expect(response.statusCode).toBe(200);
        expect(response.body.email).toBeDefined();
    });
});

describe('DELETE /users/:id', () => {
    test('Unauthorized user may not delete a user', async () => {
        const response = await request(app).delete('/api/users/123456');

        expect(response.statusCode).toBe(401);
        expect(response.body.message).toBe('Unauthorized');
    });

    test('A user can delete a user', async () => {
        const response = await request(app).delete(`/api/users/${userID}`).set('Authorization', auth);

        expect(response.statusCode).toBe(204);
    });
});
