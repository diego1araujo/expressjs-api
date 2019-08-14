module.exports = {
    development: {
        database: process.env.DB_URI,
        port: process.env.PORT || 3000,
    },
    test: {
        database: process.env.DB_URI_TEST,
        port: process.env.PORT || 3000,
    },
    production: {
        database: process.env.DB_URI,
        port: process.env.PORT || 3000,
    },
};
