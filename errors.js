const express = require('express');

const app = express();

app.all('*', (req, res) => {
    res.status(404).json({
        message: '404 Not Found',
    });
});

app.use((req, res, next) => {
    const error = new Error('Not Found');
    error.status = 404;
    next(error);
});

app.use((error, req, res) => {
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message,
        },
    });
});
