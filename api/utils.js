const jwt = require('jsonwebtoken');

module.exports = {
    generateToken: async (data) => {
        const token = await jwt.sign(data, process.env.JWT_KEY, { expiresIn: '5h' });

        return token;
    },
};
