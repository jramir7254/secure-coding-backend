const { Router } = require('express');
const { authMiddleware, requireAdmin } = require('@shared/auth');

const { register, login } = require('./auth.module');
const logger = require('@shared/logger');

const routes = Router();


routes.post('/register', async (req, res) => {
    logger.debug('register', req.body);
    const accessToken = await register(req.body);
    logger.success('registration finished', { accessToken });

    return res.status(200).json(accessToken);
});

routes.post('/login', async (req, res) => {
    console.debug('auth.login', req.body);
    const accessToken = await login(req.body);
    return res.status(200).json(accessToken);
});


routes.get('/team', authMiddleware, async (req, res) => {
    console.debug('auth.login', req.body);
    const accessToken = await login(req.body);
    return res.status(200).json(accessToken);
});


module.exports = routes;
